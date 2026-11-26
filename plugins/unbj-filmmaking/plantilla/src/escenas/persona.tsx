// Persona a cámara: un tramo de public/camara.mp4 (ya sin pausas y recortado por scripts/camara.py) a cuadro completo,
// con subtítulos palabra por palabra. La duración es la del tramo.
// e.desde · e.hasta (segundos dentro de camara.mp4) · e.resaltar ["palabra", …] · e.subtitulos (true) · e.etiqueta? (chip arriba)
import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import CAMARA from "../../camara.json";

// camara.json: { archivo, palabras: [{w,s,e}] (tiempo ya sin pausas), tramos: [[inicio, fin], …] (tiempo de la grabación), cara: {x, y} }
// (formato viejo: un arreglo de palabras y public/camara.mp4 ya cortado)
const CAM: any = Array.isArray(CAMARA) ? { archivo: "camara.mp4", palabras: CAMARA, tramos: null, cara: { x: 0.5, y: 0.42 } } : CAMARA;
const PALABRAS = CAM.palabras ?? [];
import { C, TITLE, BODY } from "../motor/marca";
import { useT, useTl, ramp, pop, easeIO } from "../motor/tiempo";
import { Centro } from "../motor/formato";
import { DefEscena } from "../motor/linea";

type Pal = { w: string; s: number; e: number };
const norm = (w: string) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\wñ]/g, "");

const Subtitulos: React.FC<{ o: number; e: any }> = ({ o, e }) => {
  const t = useTl(o) + e.desde; // tiempo dentro de camara.mp4
  const pal = (PALABRAS as Pal[]).filter((p) => p.s >= e.desde - 0.05 && p.e <= e.hasta + 0.05);
  if (!pal.length) return null;
  // grupos de hasta 3 palabras (se corta antes si hay pausa o puntuación)
  const grupos: Pal[][] = [];
  for (const p of pal) {
    const g = grupos[grupos.length - 1];
    const prev = g?.[g.length - 1];
    if (!g || g.length >= 3 || p.s - prev.e > 0.35 || /[.,;:?!]$/.test(prev.w)) grupos.push([p]);
    else g.push(p);
  }
  const g = grupos.find((x) => t >= x[0].s - 0.05 && t <= x[x.length - 1].e + 0.15);
  if (!g) return null;
  const res = new Set(((e.resaltar ?? []) as string[]).map(norm));
  return (
    <Centro>
      <div style={{ position: "absolute", left: 60, right: 140, top: 1270, textAlign: "center" }}>
        {g.map((p, i) => {
          const on = t >= p.s;
          const k = pop(t, p.s, 0.25);
          const em = res.has(norm(p.w));
          return (
            <span key={i} style={{ display: "inline-block", marginRight: "0.25em", fontFamily: em ? TITLE : BODY, fontStyle: em ? "italic" : "normal", fontWeight: em ? 700 : 900,
              fontSize: em ? 92 : 80, lineHeight: 1.1, letterSpacing: em ? 0 : -1, color: on ? (em ? C.lime : "#fff") : "rgba(255,255,255,.55)",
              textShadow: "0 4px 18px rgba(0,0,0,.55), 0 0 2px rgba(0,0,0,.6)", transform: `scale(${on ? 0.92 + 0.08 * k : 0.92})` }}>
              {p.w}
            </span>
          );
        })}
      </div>
    </Centro>
  );
};

/** tramos de la grabación que caen en [desde, hasta] (tiempo sin pausas) */
function piezas(desde: number, hasta: number) {
  if (!CAM.tramos) return [{ desde, hasta, original: desde }];
  const out: { desde: number; hasta: number; original: number }[] = [];
  let c = 0;
  for (const [a, b] of CAM.tramos as [number, number][]) {
    const ini = Math.max(desde, c);
    const fin = Math.min(hasta, c + (b - a));
    if (fin > ini) out.push({ desde: ini, hasta: fin, original: a + (ini - c) });
    c += b - a;
  }
  return out;
}

const PersonaArriba: React.FC<{ o: number; fin: number; e: any }> = ({ o, fin, e }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  if (t < o - 0.3 || t > fin + 0.3) return null;
  const a = ramp(t, o - 0.25, 0.3, easeIO);
  const z = ramp(t, fin - 0.05, 0.3, easeIO);
  return (
    <AbsoluteFill style={{ clipPath: `inset(${(1 - a) * 100}% 0 ${z * 100}% 0 round ${(1 - a + z) * 60}px)`, background: C.text }}>
      {piezas(e.desde, e.hasta).map((p, j) => (
        <Sequence key={j} from={Math.round((o + p.desde - e.desde) * fps)} durationInFrames={Math.max(1, Math.round((p.hasta - p.desde) * fps))}>
          <OffthreadVideo src={staticFile(CAM.archivo)} startFrom={Math.round(p.original * fps)}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${(CAM.cara?.x ?? 0.5) * 100}% ${(CAM.cara?.y ?? 0.42) * 100}%` }} />
        </Sequence>
      ))}
      {e.etiqueta && (
        <Centro>
          <div style={{ position: "absolute", top: 250, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: ramp(t, o + 0.2, 0.4) }}>
            <div style={{ padding: "12px 26px", borderRadius: 99, background: C.lime, fontFamily: BODY, fontWeight: 700, fontSize: 28, letterSpacing: 4, color: "#fff" }}>{e.etiqueta}</div>
          </div>
        </Centro>
      )}
      {e.subtitulos !== false && <Subtitulos o={o} e={e} />}
    </AbsoluteFill>
  );
};

export const persona: DefEscena = {
  dur: (e) => Math.max(0.5, e.hasta - e.desde),
  Arriba: PersonaArriba,
  sfx: () => [{ at: -0.25, f: "whoosh", v: 0.5 }],
};
