// Ganchos tipográficos: el de apertura (tres golpes) y los dos de mitad del video (barrido y círculo de tinta).
import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { C, TITLE, BODY, MARCA } from "../motor/marca";
import { useT, useTl, ramp, pop, easeIO, easeIn, glide, lerp, cabe } from "../motor/tiempo";
import { Mask, img } from "../motor/piezas";
import { Centro, useCentro } from "../motor/formato";
import { DefEscena, FRONTAL } from "../motor/linea";

// ---------- gancho inicial: tres golpes tipográficos (2,7 s) ----------
// e.pregunta: [palabra, *cursiva*, palabra] · e.prefijo · e.palabras (2–4, giran en la píldora) · e.remate · e.subremate
const GanchoArriba: React.FC<{ o: number; e: any }> = ({ o, e }) => {
  const t = useTl(o);
  if (t < -0.05 || t > 3.05) return null;
  const [p1, p2, p3] = e.pregunta as string[];
  const SLOT = e.palabras as string[];
  const through = ramp(t, 2.55, 0.45, easeIn); // la cámara atraviesa el texto
  const q1 = ramp(t, 0.95, 0.28, easeIO);
  const l = (i: number) => ramp(t, 0.08 + i * 0.12, 0.45);
  const b = ramp(t, 1.0, 0.4, glide);
  const q2 = ramp(t, 1.95, 0.25, easeIO);
  const idx = Math.max(0, Math.min(SLOT.length - 1, Math.floor((t - 1.2) / 0.2)));
  const sw = ramp(t, 1.2 + idx * 0.2, 0.12, easeIO);
  const g = ramp(t, 2.0, 0.35, glide);
  const fill = ramp(t, 2.15, 0.35, easeIO);
  const lp = pop(t, 2.05, 0.5);
  const big: React.CSSProperties = { fontFamily: BODY, fontWeight: 900, letterSpacing: -3, lineHeight: 1 };
  const rem = e.remate as string;
  const remSize = cabe(rem, 260, 1000, 0.6);
  const slotMax = Math.max(...SLOT.map((s) => s.length));
  return (
    <Centro>
      <AbsoluteFill style={{ alignItems: "center", opacity: 1 - through, transform: `scale(${1 + 5 * through})`, transformOrigin: "540px 900px" }}>
        {t < 1.3 && (
          <div style={{ position: "absolute", top: 520, left: 0, right: 0, textAlign: "center" }}>
            <Mask p={l(0)} q={q1}><div style={{ ...big, fontSize: cabe(p1, 150, 1000, 0.66), color: C.text }}>{p1}</div></Mask>
            <Mask p={l(1)} q={q1}><div style={{ fontFamily: TITLE, fontStyle: "italic", fontWeight: 700, fontSize: cabe(p2, 230, 1000, 0.5), lineHeight: 1.05, color: C.lime }}>{p2}</div></Mask>
            <Mask p={l(2)} q={q1}><div style={{ fontFamily: TITLE, fontWeight: 900, fontSize: cabe(p3, 180, 1000, 0.55), lineHeight: 1, color: C.text, letterSpacing: -3 }}>{p3}</div></Mask>
          </div>
        )}
        {t >= 0.95 && t < 2.25 && (
          <div style={{ position: "absolute", top: 640, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Mask p={ramp(t, 1.0, 0.35)} q={q2}>
              <div style={{ fontFamily: TITLE, fontWeight: 700, fontSize: cabe(e.prefijo, 130, 1000, 0.5), color: C.text, letterSpacing: -2 }}>{e.prefijo}</div>
            </Mask>
            <div style={{ marginTop: 20, width: 900, height: 200, borderRadius: 36, background: C.lime, overflow: "hidden", position: "relative",
              transform: `scaleX(${b * (1 - q2)}) rotate(${-2 * (1 - b)}deg)`, boxShadow: `0 30px 60px ${C.lime}44` }}>
              {[idx - 1, idx].filter((k) => k >= 0).map((k) => (
                <div key={k} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...big, fontSize: Math.min(140, 820 / (slotMax * 0.62)), color: "#fff",
                  letterSpacing: 2, transform: `translateY(${k === idx ? (idx === 0 ? 0 : (1 - sw) * 100) : -sw * 100}%)` }}>
                  {SLOT[k]}
                </div>
              ))}
            </div>
          </div>
        )}
        {t >= 1.95 && (
          <>
            <Img src={img(MARCA.logo)} style={{ position: "absolute", top: 330, height: 220, opacity: Math.min(1, lp * 1.5), transform: `scale(${0.6 + 0.4 * lp})` }} />
            <div style={{ position: "absolute", top: 700 + (260 - remSize) / 2, left: 0, right: 0, textAlign: "center", transform: `scale(${1.25 - 0.25 * g})`, opacity: Math.min(1, g * 1.5) }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <div style={{ ...big, fontSize: remSize, letterSpacing: -6, color: "transparent", WebkitTextStroke: `5px ${C.text}` }}>{rem}</div>
                <div style={{ ...big, fontSize: remSize, letterSpacing: -6, color: C.lime, position: "absolute", inset: 0, clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}>{rem}</div>
              </div>
              <div style={{ marginTop: 10, fontFamily: TITLE, fontStyle: "italic", fontSize: 78, color: C.text, opacity: ramp(t, 2.25, 0.3) }}>{e.subremate}</div>
            </div>
          </>
        )}
      </AbsoluteFill>
    </Centro>
  );
};

export const gancho: DefEscena = {
  dur: () => 2.7,
  Arriba: GanchoArriba,
  sfx: (e) => [
    ...[0.08, 0.2, 0.32].map((at) => ({ at, f: "pop" as const, v: 0.6 })),
    { at: 0.95, f: "whoosh", v: 0.6 },
    ...(e.palabras as string[]).map((_, i) => ({ at: 1.2 + i * 0.2, f: "click" as const, v: 0.7 })),
    { at: 2.0, f: "boom", v: 0.5 },
    { at: 2.55, f: "whoosh" },
  ],
};

// ---------- golpe a mitad del video: panel de color que barre (0,75 s) ----------
// e.linea1 (mayúsculas, blanco) · e.linea2 (cursiva, color de texto)
const BarridoArriba: React.FC<{ o: number; fin: number; e: any }> = ({ o, fin, e }) => {
  const t = useT();
  const { width } = useCentro();
  if (t < o - 0.05 || t > fin + 0.3) return null;
  const a = ramp(t, o, 0.3, easeIO);
  const z = ramp(t, fin - 0.05, 0.3, easeIO);
  const x = (1 - a) * (width + 100) - z * (width + 100);
  const skew = -8 * Math.sin(Math.PI * a) + -8 * Math.sin(Math.PI * z);
  return (
    <AbsoluteFill style={{ background: C.lime, transform: `translateX(${x}px) skewX(${skew}deg)` }}>
      <Centro>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", marginTop: -80 }}>
            <Mask p={ramp(t, o + 0.15, 0.35)}>
              <div style={{ fontFamily: BODY, fontWeight: 900, fontSize: cabe(e.linea1, 120, 1000, 0.66), letterSpacing: -2, color: "#fff", lineHeight: 1 }}>{e.linea1}</div>
            </Mask>
            <Mask p={ramp(t, o + 0.25, 0.35)}>
              <div style={{ fontFamily: TITLE, fontStyle: "italic", fontWeight: 700, fontSize: cabe(e.linea2, 200, 1000, 0.48), color: C.text, lineHeight: 1.05 }}>{e.linea2}</div>
            </Mask>
          </div>
        </AbsoluteFill>
      </Centro>
    </AbsoluteFill>
  );
};
export const golpeBarrido: DefEscena = {
  dur: () => 0.75,
  Arriba: BarridoArriba,
  mundo: () => [{ at: 0, d: 0.5, ...FRONTAL }],
  sfx: () => [{ at: 0, f: "whoosh" }, { at: 0.2, f: "pop", v: 0.6 }, { at: 0.7, f: "whoosh" }],
};

// ---------- golpe a mitad del video: círculo de tinta con palabra tachada (0,8 s) ----------
// e.linea1 (mayúsculas) · e.linea2 (cursiva, se tacha)
const CirculoArriba: React.FC<{ o: number; fin: number; e: any }> = ({ o, fin, e }) => {
  const t = useT();
  const c = useCentro();
  if (t < o - 0.05 || t > fin + 0.4) return null;
  const a = ramp(t, o, 0.35, easeIO);
  const z = ramp(t, fin - 0.1, 0.4, easeIO);
  const R = (Math.hypot(c.width, c.height) * 1400) / Math.hypot(1080, 1920);
  const r = R * a * (1 - z);
  // se cierra sobre el ícono de la tarjeta "Sin conexión" de la escena siguiente
  const centro = c.punto(lerp(540, 150, z), lerp(960, 730, z));
  const strike = ramp(t, o + 0.42, 0.22, easeIO);
  return (
    <AbsoluteFill style={{ background: C.text, clipPath: `circle(${r}px at ${centro.x}px ${centro.y}px)` }}>
      <Centro>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", marginTop: -80, transform: `scale(${1 + 0.15 * z})` }}>
            <Mask p={ramp(t, o + 0.1, 0.3)}>
              <div style={{ fontFamily: BODY, fontWeight: 900, fontSize: cabe(e.linea1, 160, 1000, 0.66), letterSpacing: -3, color: "#fff", lineHeight: 1 }}>{e.linea1}</div>
            </Mask>
            <div style={{ position: "relative", display: "inline-block" }}>
              <Mask p={ramp(t, o + 0.18, 0.3)}>
                <div style={{ fontFamily: TITLE, fontStyle: "italic", fontWeight: 700, fontSize: cabe(e.linea2, 200, 1000, 0.48), color: "#fff", lineHeight: 1.05 }}>{e.linea2}</div>
              </Mask>
              {e.tachar !== false && (
                <div style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 16, borderRadius: 9, background: C.lime, transformOrigin: "left",
                  transform: `scaleX(${strike}) rotate(-4deg)` }} />
              )}
            </div>
          </div>
        </AbsoluteFill>
      </Centro>
    </AbsoluteFill>
  );
};
export const golpeCirculo: DefEscena = {
  dur: () => 0.8,
  Arriba: CirculoArriba,
  sfx: () => [{ at: 0, f: "whoosh" }, { at: 0.45, f: "click", v: 0.8 }, { at: 0.7, f: "whoosh", v: 0.6 }],
};
