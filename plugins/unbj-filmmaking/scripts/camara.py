#!/usr/bin/env python3
"""Prepara una grabación a cámara para usarla en escenas "persona".

Uso:  python camara.py <carpeta del video> <grabación.mp4|.mov> [--formato vertical] [--pausa 0.3] [--quitar "12.3-14.1,..."] [--modelo medium]

1. Transcribe con tiempos por palabra (faster-whisper, local, sin internet después de la primera vez).
2. Quita las pausas mayores a --pausa segundos y los tramos de --quitar (tomas falsas).
3. Recorta al formato alrededor de la cara (OpenCV) y deja public/camara.mp4 + camara.json (palabras con tiempos nuevos).
Imprime la transcripción con los tiempos NUEVOS: con ellos se escriben "desde" y "hasta" de cada escena persona.
"""
import argparse, json, subprocess, sys, tempfile
from pathlib import Path

PAD_IN, PAD_OUT = 0.06, 0.12  # aire antes/después de cada tramo para no comer sílabas
FORMATOS = {"vertical": (1080, 1920), "retrato": (1080, 1350), "cuadrado": (1080, 1080), "horizontal": (1920, 1080)}


def run(cmd):
    subprocess.run(cmd, check=True)


def probe(video):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration", "-of", "json", str(video)])
    j = json.loads(out)
    s = j["streams"][0]
    return s["width"], s["height"], float(j["format"]["duration"])


def transcribir(video, modelo, tmp):
    from faster_whisper import WhisperModel
    wav = Path(tmp) / "a.wav"
    run(["ffmpeg", "-v", "error", "-y", "-i", str(video), "-ac", "1", "-ar", "16000", str(wav)])
    print("→ Transcribiendo (la primera vez descarga el modelo, ~1,5 GB)…", flush=True)
    m = WhisperModel(modelo, device="cpu", compute_type="int8")
    # se pasa el audio ya leído: con av >= 15, decode_audio de faster-whisper falla (metadata_errors)
    import numpy as np, wave
    with wave.open(str(wav)) as wf:
        audio = np.frombuffer(wf.readframes(wf.getnframes()), np.int16).astype(np.float32) / 32768.0
    segs, _ = m.transcribe(audio, language="es", word_timestamps=True, vad_filter=True)
    return [{"w": w.word.strip(), "s": round(w.start, 3), "e": round(min(w.end, w.start + 0.95), 3)} for sg in segs for w in sg.words if w.word.strip()]


def cara(video, dur, tmp):
    """Centro horizontal y vertical promedio de la cara (0–1), o el centro si no hay."""
    try:
        import cv2
    except ImportError:
        return 0.5, 0.42
    det = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    xs, ys = [], []
    for i in range(8):
        f = Path(tmp) / f"f{i}.jpg"
        run(["ffmpeg", "-v", "error", "-y", "-ss", str(dur * (i + 0.5) / 8), "-i", str(video), "-frames:v", "1", str(f)])
        img = cv2.imread(str(f))
        if img is None:
            continue
        g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        caras = det.detectMultiScale(g, 1.1, 6, minSize=(g.shape[1] // 12, g.shape[1] // 12))
        if len(caras):
            x, y, w, h = max(caras, key=lambda c: c[2] * c[3])
            xs.append((x + w / 2) / g.shape[1])
            ys.append((y + h / 2) / g.shape[0])
    if not xs:
        return 0.5, 0.42
    xs.sort(); ys.sort()
    return xs[len(xs) // 2], ys[len(ys) // 2]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("carpeta"); ap.add_argument("video")
    ap.add_argument("--formato", default="vertical", choices=list(FORMATOS))
    ap.add_argument("--pausa", type=float, default=0.3)
    ap.add_argument("--quitar", default="")
    ap.add_argument("--modelo", default="medium")
    a = ap.parse_args()
    dirp = Path(a.carpeta).expanduser().resolve()
    video = Path(a.video).expanduser().resolve()
    if not (dirp / "video.json").exists():
        sys.exit(f"❌ No encuentro video.json en {dirp}")
    W, H, dur = probe(video)
    with tempfile.TemporaryDirectory() as tmp:
        words = transcribir(video, a.modelo, tmp)
        if not words:
            sys.exit("❌ No se entendió ninguna palabra en la grabación.")
        quitar = [tuple(map(float, r.split("-"))) for r in a.quitar.split(",") if r.strip()]
        words = [w for w in words if not any(q0 <= w["s"] < q1 for q0, q1 in quitar)]
        # tramos con voz, unidos si la pausa es corta
        tramos = []
        for w in words:
            s, e = max(0, w["s"] - PAD_IN), min(dur, w["e"] + PAD_OUT)
            if tramos and s - tramos[-1][1] <= a.pausa:
                tramos[-1][1] = max(tramos[-1][1], e)
            else:
                tramos.append([s, e])
        # recorte alrededor de la cara
        ow, oh = FORMATOS[a.formato]
        try:
            cx, cy = cara(video, dur, tmp)
        except Exception as ex:  # OpenCV incompleto: se recorta al centro
            print(f"⚠️  No se pudo detectar la cara ({ex}); recorto al centro.")
            cx, cy = 0.5, 0.42
        if W / H > ow / oh:
            ch, cw = H, int(H * ow / oh) // 2 * 2
        else:
            cw, ch = W, int(W * oh / ow) // 2 * 2
        x = int(min(max(0, cx * W - cw / 2), W - cw))
        y = int(min(max(0, cy * H - ch * 0.42), H - ch))
        sel = "+".join(f"between(t,{s:.3f},{e:.3f})" for s, e in tramos)
        out = dirp / "public" / "camara.mp4"
        print("→ Cortando pausas y recortando…", flush=True)
        run(["ffmpeg", "-v", "error", "-y", "-i", str(video),
             "-vf", f"select='{sel}',setpts=N/FRAME_RATE/TB,crop={cw}:{ch}:{x}:{y},scale={ow}:{oh},fps=30",
             "-af", f"aselect='{sel}',asetpts=N/SR/TB", "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-c:a", "aac", "-b:a", "192k", str(out)])
    # tiempos nuevos
    nuevas, acc = [], 0.0
    for s, e in tramos:
        for w in words:
            if s <= w["s"] < e:
                nuevas.append({"w": w["w"], "s": round(acc + w["s"] - s, 3), "e": round(acc + w["e"] - s, 3)})
        acc += e - s
    (dirp / "camara.json").write_text(json.dumps(nuevas, ensure_ascii=False, indent=0))
    print(f"\n✅ public/camara.mp4 ({acc:.1f} s) y camara.json ({len(nuevas)} palabras)\n\nTranscripción con tiempos nuevos:")
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
