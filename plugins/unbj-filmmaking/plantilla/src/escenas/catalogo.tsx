// Catálogo: el celular gira a la izquierda, entra la pantalla de la lista, se toca "Filtros" y sube una hoja;
// a la derecha caen los chips de categorías y se selecciona uno (4,4 s).
// e.etiqueta · e.titulo · e.pantalla · e.hoja? {archivo, alto, arriba} · e.toque? {x, y} · e.categorias (hasta 6) · e.seleccion (índice, 0)
import React from "react";
import { C, BODY, sombra } from "../motor/marca";
import { useT, useTl, ramp, easeIO, glide, pop } from "../motor/tiempo";
import { Check } from "../motor/piezas";
import { DefEscena } from "../motor/linea";

const Chips: React.FC<{ o: number; e: any }> = ({ o, e }) => {
  const t = useTl(o);
  if (t < 0.5 || t > 4.6) return null;
  const colores = [C.lime, C.violet, C.warn, C.text, C.accentDark, C.muted];
  const sel = e.seleccion ?? 0;
  return (
    <>
      {(e.categorias as string[]).slice(0, 6).map((n, i) => {
        const p = ramp(t, 0.75 + i * 0.1, 0.6, glide);
        const out = ramp(t, 3.9 + i * 0.05, 0.4, easeIO);
        const s = i === sel ? ramp(t, 3.15, 0.35) : 0;
        return (
          <div key={n} style={{ position: "absolute", left: 600, top: 650 + i * 112, display: "flex", alignItems: "center", gap: 16, padding: "18px 30px 18px 22px",
            borderRadius: 99, background: s > 0.5 ? C.text : C.card, color: s > 0.5 ? "#fff" : C.text, border: `2px solid ${s > 0.5 ? C.text : C.line}`,
            boxShadow: `0 16px 40px ${sombra(0.12)}`, fontFamily: BODY, fontWeight: 600, fontSize: 34, whiteSpace: "nowrap",
            opacity: Math.min(1, p * 1.5) * (1 - out),
            transform: `translateX(${(1 - p) * 240 + out * 320}px) translateY(${6 * Math.sin((t + o) * 1.6 + i)}px) scale(${1 + 0.08 * Math.sin(Math.PI * s)})` }}>
            {s > 0.5 ? <Check size={30} bg={C.lime} draw={ramp(t, 3.3, 0.3)} /> : <div style={{ width: 22, height: 22, borderRadius: 99, background: colores[i] }} />}
            {n}
          </div>
        );
      })}
    </>
  );
};

export const catalogo: DefEscena = {
  dur: () => 4.4,
  numerada: true,
  Capa: Chips,
  telefono: (e) => ({
    keys: [{ at: -0.05, d: 0.9, x: 330, y: 620, s: 0.78, ry: 16, rz: -2, z: 0 }],
    shots: [
      { from: 0.2, src: e.pantalla.archivo, h: e.pantalla.alto, tr: "push", keys: [{ at: 0.2, cy: 422 }] },
      ...(e.hoja ? [{ from: 2.35, src: e.hoja.archivo, h: e.hoja.alto, tr: "sheet" as const, sheetTop: e.hoja.arriba ?? 236, keys: [{ at: 2.35, cy: 422 }] }] : []),
    ],
    taps: e.toque ? [{ at: 2.2, ...e.toque }] : [],
  }),
  mundo: () => [{ at: 0.4, d: 3.6, x: 10, y: -10, s: 1.05, rx: 0, rz: 0 }],
  titulos: (e) => [{ from: 0.2, to: 4.1, title: e.titulo, align: "left" }],
  sfx: (e) => [
    { at: -0.05, f: "whoosh", v: 0.75 },
    ...(e.categorias as string[]).slice(0, 6).map((_, i) => ({ at: 0.8 + i * 0.1, f: "pop" as const, v: 0.4 })),
    ...(e.toque ? [{ at: 2.2, f: "click" as const, v: 0.9 }] : []),
    ...(e.hoja ? [{ at: 2.35, f: "whoosh" as const, v: 0.5 }] : []),
    { at: 3.15, f: "pop", v: 0.7 },
  ],
};
export { pop };
