#!/usr/bin/env python3
"""Prepara una grabación a cámara para usarla en escenas "persona". No usa ffmpeg del sistema.

Uso:  python camara.py <carpeta del video> <grabación.mp4|.mov> [--pausa 0.3] [--quitar "12.3-14.1,..."] [--modelo medium]

1. Transcribe con tiempos por palabra (faster-whisper, local; la primera vez descarga el modelo).
2. Calcula los tramos con voz (quita las pausas mayores a --pausa y los tramos de --quitar).
3. Busca dónde está la cara (OpenCV) para el encuadre.
4. Copia la grabación a public/ y escribe camara.json: { archivo, palabras (tiempo ya sin pausas), tramos (tiempo de la
   grabación), cara }. Remotion reproduce los tramos directo de la grabación: no se recodifica nada.
Imprime la transcripción con los tiempos SIN PAUSAS: con ellos se escriben "desde" y "hasta" de cada escena persona.
"""
import argparse, json, shutil, sys
from pathlib import Path

PAD_IN, PAD_OUT = 0.06, 0.12  # aire antes/después de cada tramo para no comer sílabas


def audio_16k(video):
    """Audio mono a 16 kHz como float32, decodificado con PyAV (viene con faster-whisper)."""
    import av, numpy as np
    partes = []
    with av.open(str(video)) as c:
        res = av.AudioResampler(format="s16", layout="mono", rate=16000)
        for frame in c.decode(audio=0):
            for f in res.resample(frame):
                partes.append(f.to_ndarray().reshape(-1))
        for f in res.resample(None):
            partes.append(f.to_ndarray().reshape(-1))
    return np.concatenate(partes).astype(np.float32) / 32768.0


def transcribir(video, modelo):
    from faster_whisper import WhisperModel
    print("→ Transcribiendo (la primera vez descarga el modelo, ~1,5 GB)…", flush=True)
    m = WhisperModel(modelo, device="cpu", compute_type="int8")
    segs, _ = m.transcribe(audio_16k(video), language="es", word_timestamps=True, vad_filter=True)
    return [{"w": w.word.strip(), "s": round(w.start, 3), "e": round(min(w.end, w.start + 0.95), 3)} for sg in segs for w in sg.words if w.word.strip()]


def cara(video):
    """Centro de la cara (0–1) en 8 fotogramas, o el centro si no hay."""
    try:
        import cv2
        det = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
        cap = cv2.VideoCapture(str(video))
        n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 1
        xs, ys = [], []
        for i in range(8):
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(n * (i + 0.5) / 8))
            ok, img = cap.read()
            if not ok:
                continue
            g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            caras = det.detectMultiScale(g, 1.1, 6, minSize=(g.shape[1] // 12, g.shape[1] // 12))
            if len(caras):
                x, y, w, h = max(caras, key=lambda c: c[2] * c[3])
                xs.append((x + w / 2) / g.shape[1])
                ys.append((y + h / 2) / g.shape[0])
        cap.release()
        if xs:
            xs.sort(); ys.sort()
            return round(xs[len(xs) // 2], 3), round(ys[len(ys) // 2], 3)
    except Exception as ex:  # OpenCV incompleto: se encuadra al centro
        print(f"⚠️  No se pudo detectar la cara ({ex}); encuadro al centro.")
    return 0.5, 0.42


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("carpeta"); ap.add_argument("video")
    ap.add_argument("--pausa", type=float, default=0.3)
    ap.add_argument("--quitar", default="")
    ap.add_argument("--modelo", default="medium")
    ap.add_argument("--formato", default="", help="(ya no se usa: el encuadre lo hace cada formato)")
    a = ap.parse_args()
    dirp = Path(a.carpeta).expanduser().resolve()
    video = Path(a.video).expanduser().resolve()
    if not (dirp / "video.json").exists():
        sys.exit(f"❌ No encuentro video.json en {dirp}")
    words = transcribir(video, a.modelo)
    if not words:
        sys.exit("❌ No se entendió ninguna palabra en la grabación.")
    quitar = [tuple(map(float, r.split("-"))) for r in a.quitar.split(",") if r.strip()]
    words = [w for w in words if not any(q0 <= w["s"] < q1 for q0, q1 in quitar)]
    tramos = []
    for w in words:
        s, e = max(0, w["s"] - PAD_IN), w["e"] + PAD_OUT
        if tramos and s - tramos[-1][1] <= a.pausa:
            tramos[-1][1] = max(tramos[-1][1], e)
        else:
            tramos.append([s, e])
    tramos = [[round(s, 3), round(e, 3)] for s, e in tramos]
    nuevas, acc = [], 0.0
    for s, e in tramos:
        for w in words:
            if s <= w["s"] < e:
                nuevas.append({"w": w["w"], "s": round(acc + w["s"] - s, 3), "e": round(acc + w["e"] - s, 3)})
        acc += e - s
    cx, cy = cara(video)
    archivo = f"camara{video.suffix.lower()}"
    shutil.copyfile(video, dirp / "public" / archivo)
    (dirp / "camara.json").write_text(json.dumps({"archivo": archivo, "palabras": nuevas, "tramos": tramos, "cara": {"x": cx, "y": cy}}, ensure_ascii=False, indent=1))
    print(f"\n✅ public/{archivo} y camara.json ({len(nuevas)} palabras, {len(tramos)} tramos, {acc:.1f} s sin pausas)\n\nTranscripción con tiempos sin pausas:")
    linea, t0 = [], None
    for w in nuevas:
        t0 = w["s"] if t0 is None else t0
        linea.append(w["w"])
        if w["w"][-1:] in ".?!" or len(linea) >= 12:
            print(f"[{t0:6.2f}–{w['e']:6.2f}] {' '.join(linea)}")
            linea, t0 = [], None
    if linea:
        print(f"[{t0:6.2f}–{nuevas[-1]['e']:6.2f}] {' '.join(linea)}")


if __name__ == "__main__":
    main()
