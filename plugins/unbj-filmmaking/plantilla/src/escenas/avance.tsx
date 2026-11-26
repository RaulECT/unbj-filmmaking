// Avance: tres cifras que suben (número, duración en h/min y anillo de porcentaje) y, al final, la cámara
// hace un acercamiento macro al botón que se toca (3,8 s).
// e.etiqueta · e.titulo · e.pantalla · e.toque? {x, y} (botón del acercamiento)
// e.cifras: [{tipo:"numero", valor, texto}, {tipo:"duracion", minutos, texto}, {tipo:"porcentaje", valor, texto}] (cualquier orden, hasta 3)
import React from "react";
import { C, TITLE, BODY } from "../motor/marca";
import { useT, useTl, ramp, easeIO, glide } from "../motor/tiempo";
import { DefEscena, FRONTAL } from "../motor/linea";
import { puntoEnPantalla } from "../motor/piezas";

const Stats: React.FC<{ o: number; e: any }> = ({ o, e }) => {
  const t = useTl(o);
  if (t < 0.05 || t > 3.25) return null;
  const blocks = [0.2, 0.6, 1.0];
  const counts = [0.25, 0.65, 1.2];
  const durs = [1.0, 1.2, 1.4];
  const io = (i: number) => {
    const p = ramp(t, blocks[i], 0.6, glide);
    const q = ramp(t, 2.65 + i * 0.07, 0.4, easeIO);
    return { opacity: Math.min(1, p * 1.5) * (1 - q), transform: `translateX(${(1 - p) * -120 - q * 140}px)` };
  };
  const rr = 84;
  const circ = 2 * Math.PI * rr;
  const big: React.CSSProperties = { fontFamily: TITLE, fontWeight: 900, fontSize: 150, lineHeight: 1, color: C.text, letterSpacing: -3 };
  const unit: React.CSSProperties = { fontFamily: TITLE, fontStyle: "italic", fontWeight: 400, fontSize: 96, color: C.lime };
  const label: React.CSSProperties = { fontFamily: BODY, fontSize: 32, color: C.muted, marginTop: 8 };
  const rule = (i: number): React.CSSProperties => ({ marginTop: 26, width: 380, height: 2, background: C.line, transformOrigin: "left", transform: `scaleX(${ramp(t, blocks[i] + 0.2, 0.6)})` });
  return (
    <div style={{ position: "absolute", left: 60, top: 610 }}>
      {(e.cifras as any[]).slice(0, 3).map((c, i) => {
        const k = ramp(t, counts[i], durs[i]);
        const mt = i ? 40 : 0;
        if (c.tipo === "porcentaje") {
          const pct = (c.valor / 100) * k;
          return (
            <div key={i} style={{ ...io(i), marginTop: mt, display: "flex", alignItems: "center", gap: 26 }}>
              <div style={{ position: "relative", width: 200, height: 200 }}>
                <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="100" cy="100" r={rr} stroke={C.line} strokeWidth="16" fill="none" />
                  <circle cx="100" cy="100" r={rr} stroke={C.lime} strokeWidth="16" fill="none" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TITLE, fontWeight: 700, fontSize: 56, color: C.text }}>
                  {Math.round(pct * 100)}%
                </div>
              </div>
              <div style={{ ...label, marginTop: 0, color: C.text, fontWeight: 600 }}>{c.texto}</div>
            </div>
          );
        }
        if (c.tipo === "duracion") {
          const mins = Math.round(c.minutos * k);
          return (
            <div key={i} style={{ ...io(i), marginTop: mt }}>
              <div style={big}>
                {Math.floor(mins / 60)}
                <span style={unit}> h </span>
                {mins % 60}
              </div>
              <div style={label}>{c.texto}</div>
              <div style={rule(i)} />
            </div>
          );
        }
        return (
          <div key={i} style={{ ...io(i), marginTop: mt }}>
            <div style={big}>
              {c.prefijo ?? ""}
              {Math.round(c.valor * k).toLocaleString("es")}
              {c.sufijo ? <span style={unit}>{c.sufijo}</span> : null}
            </div>
            <div style={label}>{c.texto}</div>
            <div style={rule(i)} />
          </div>
        );
      })}
    </div>
  );
};

export const avance: DefEscena = {
  dur: () => 3.8,
  numerada: true,
  finNumero: () => 3.05, // el número se va antes del acercamiento
  Capa: Stats,
  telefono: (e) => ({
    keys: [
      { at: -0.65, d: 0.7, x: 700, y: 620, s: 0.78, ry: -16, rz: 2, z: 0 },
      { at: 2.75, d: 0.5, x: 700, y: 620, s: 0.78, ry: 0, rz: 0, z: 0 },
    ],
    shots: [{ from: -0.45, src: e.pantalla.archivo, h: e.pantalla.alto, tr: "push", keys: [{ at: -0.45, cy: 422 }] }],
    taps: e.toque ? [{ at: 3.55, ...e.toque }] : [],
  }),
  mundo: (e) => {
    if (!e.toque) return [];
    // macro: el punto tocado queda al centro del cuadro, con zoom 2.2 (en el original, el botón "Continuar lección")
    const p = puntoEnPantalla({ x: 700, y: 620, s: 0.78 }, e.toque.x, e.toque.y);
    const x = Math.round(-(p.x - 540) * 2.2);
    const y = Math.round(-(p.y - 960) * 2.2 + 40);
    return [
      { at: 3.1, d: 0.65, x, y, s: 2.2, rx: 0, rz: 0 },
      { at: 3.8, d: 0.85, ...FRONTAL },
    ];
  },
  titulos: (e) => [{ from: 0.15, to: 2.8, title: e.titulo, align: "left" }],
  sfx: (e) => [
    ...[0.2, 0.6, 1.0].slice(0, (e.cifras as any[]).length).map((at) => ({ at, f: "pop" as const, v: 0.55 })),
    { at: 2.6, f: "ding", v: 0.5 },
    ...(e.toque ? [{ at: 3.1, f: "whoosh" as const, v: 0.6 }, { at: 3.55, f: "click" as const, v: 0.9 }] : []),
    { at: 3.8, f: "whoosh", v: 0.6 },
  ],
};
