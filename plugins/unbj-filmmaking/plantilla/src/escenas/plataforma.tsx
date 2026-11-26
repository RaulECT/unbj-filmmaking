// Plataforma isométrica: el celular cae sobre una losa con las portadas como bloques; la cámara gira
// de vista isométrica a frontal y las portadas se elevan. Presentación del producto (4,9 s).
// e.etiqueta · e.titulo · e.insignia? · e.pantalla {archivo, alto} · e.portadas [{archivo, etiqueta}] (hasta 6)
import React from "react";
import { C } from "../motor/marca";
import { useT, useTl, ramp, easeOut, easeIO, easeIn, glide } from "../motor/tiempo";
import { IsoBlock, CoverCard } from "../motor/piezas";
import { DefEscena, FRONTAL } from "../motor/linea";

export const POS_PORTADAS = [
  { x: 40, y: 760 },
  { x: 1040, y: 720 },
  { x: -20, y: 1190 },
  { x: 1100, y: 1160 },
  { x: 60, y: 1640 },
  { x: 1020, y: 1620 },
];

const IsoCampus: React.FC<{ o: number; e: any }> = ({ o, e }) => {
  const t = useTl(o);
  if (t < -0.25 || t > 4.8) return null;
  const slabO = ramp(t, -0.2, 0.5) * (1 - ramp(t, 3.3, 1.0, easeIO));
  const tiles = (e.portadas ?? []).slice(0, 6) as { archivo: string; etiqueta?: string }[];
  return (
    <>
      <IsoBlock x={-300} y={250} w={1680} d={1960} h={70} z={-72} south={C.losaSur} west={C.losaOeste} style={{ opacity: slabO }}
        topStyle={{ background: C.paper2, backgroundImage: `radial-gradient(${C.line} 2px, transparent 2px)`, backgroundSize: "48px 48px" }} />
      {tiles.map((c, i) => {
        const pos = POS_PORTADAS[i];
        const drop = ramp(t, 0.15 + i * 0.12, 0.6, easeOut);
        const h = 44 * ramp(t, 0.4 + i * 0.12, 0.7, glide);
        const lift = ramp(t, 2.9 + i * 0.05, 0.9, easeIn);
        const z = (1 - drop) * 600 + lift * 900 + 6 * Math.sin((t + o) * 1.5 + i);
        const w = 320;
        const d = 200;
        return (
          <IsoBlock key={i} x={pos.x - w / 2} y={pos.y - d / 2} w={w} d={d} h={h} z={z} south={C.fichaSur} west={C.fichaOeste}
            style={{ opacity: Math.min(1, drop * 1.5) * (1 - lift) }}>
            <CoverCard src={c.archivo} label={c.etiqueta} w={w} style={{ left: 0, top: 0, padding: 5, boxShadow: "none" }} />
          </IsoBlock>
        );
      })}
    </>
  );
};

export const plataforma: DefEscena = {
  dur: () => 4.9,
  Mundo: IsoCampus,
  telefono: (e) => ({
    keys: [
      { at: 0, d: 0, x: 540, y: 610, s: 0.9, ry: 0, rz: 0, z: 900 },
      { at: 0, d: 0.9, x: 540, y: 610, s: 0.9, ry: 0, rz: 0, z: 0 }, // cae sobre la plataforma
    ],
    shots: [{ from: -0.1, src: e.pantalla.archivo, h: e.pantalla.alto, keys: [{ at: -0.1, cy: 422 }, { at: 1.6, d: 1.0, cy: 1180 }, { at: 3.7, d: 1.0, cy: 1960 }] }],
  }),
  mundo: () => [
    { at: -0.31, d: 0.01, x: 0, y: 60, s: 0.5, rx: 58, rz: -38 },
    { at: -0.1, d: 1.2, x: 0, y: 40, s: 0.68, rx: 58, rz: -38 },
    { at: 3.2, d: 1.5, ...FRONTAL }, // de isométrico a frontal
  ],
  titulos: (e) => [{ from: 0.5, to: 4.6, title: e.titulo, eyebrow: e.etiqueta }],
  insignias: (e) => (e.insignia ? [{ from: 1.8, to: 2.9, text: e.insignia, top: 1420 }] : []),
  sfx: (e) => [
    { at: 0.05, f: "pop", v: 0.7 },
    ...(e.portadas ?? []).slice(0, 6).map((_: any, i: number) => ({ at: 0.4 + i * 0.12, f: "pop" as const, v: 0.4 })),
    { at: 3.2, f: "whoosh", v: 0.7 },
    ...(e.insignia ? [{ at: 1.8, f: "pop" as const, v: 0.7 }] : []),
  ],
};
