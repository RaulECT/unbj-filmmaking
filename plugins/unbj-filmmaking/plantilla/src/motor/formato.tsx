// Formatos de salida. Todo el diseño está pensado en el lienzo vertical original de 1080×1920 ("escenario").
// Cada formato decide cómo se encuadra ese escenario:
//  · vertical   1080×1920  tal cual (zonas seguras de Instagram: texto entre y=220 y y=1590, x < 950)
//  · retrato    1080×1350  (4:5) recorta la franja útil y=220…1620
//  · cuadrado   1080×1080  (1:1) la misma franja, más chica y centrada
//  · horizontal 1920×1080  (16:9) el contenido a la derecha (franja y=560…1640) y los títulos en una columna a la izquierda
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";

export type Formato = "vertical" | "retrato" | "cuadrado" | "horizontal";
export const FORMATOS: Record<Formato, { id: string; w: number; h: number }> = {
  vertical: { id: "Vertical", w: 1080, h: 1920 },
  retrato: { id: "Retrato", w: 1080, h: 1350 },
  cuadrado: { id: "Cuadrado", w: 1080, h: 1080 },
  horizontal: { id: "Horizontal", w: 1920, h: 1080 },
};

export const useFormato = (): Formato => {
  const { width, height } = useVideoConfig();
  if (width > height) return "horizontal";
  if (width === height) return "cuadrado";
  return height / width < 1.5 ? "retrato" : "vertical";
};

type T = { s: number; x: number; y: number };
const ESCENARIO: Record<Formato, T> = {
  vertical: { s: 1, x: 0, y: 0 },
  retrato: { s: 1350 / 1400, x: (1080 - 1080 * (1350 / 1400)) / 2, y: -220 * (1350 / 1400) },
  cuadrado: { s: 1080 / 1400, x: (1080 - 1080 * (1080 / 1400)) / 2, y: -220 * (1080 / 1400) },
  horizontal: { s: 1, x: 790, y: -560 },
};
// Para textos grandes centrados (ganchos, cierre): el centro del diseño (540, 960) va al centro del cuadro.
const CENTRO_K: Record<Formato, number> = { vertical: 1, retrato: 0.78, cuadrado: 0.62, horizontal: 0.62 };

export const useEscenario = () => ESCENARIO[useFormato()];
export const useCentro = () => {
  const f = useFormato();
  const { width, height } = useVideoConfig();
  const k = CENTRO_K[f];
  const x = width / 2 - 540 * k;
  const y = height / 2 - 960 * k;
  /** pasa un punto del diseño a coordenadas del cuadro */
  const punto = (px: number, py: number) => ({ x: x + px * k, y: y + py * k });
  return { k, x, y, punto, width, height };
};

/** Escenario 1080×1920 encuadrado según el formato. */
export const Escenario: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const e = useEscenario();
  const f = useFormato();
  // en horizontal, la columna de títulos queda libre: lo que salga del escenario por la izquierda se recorta con un degradado
  const mask = f === "horizontal" ? { WebkitMaskImage: `linear-gradient(90deg, transparent ${e.x - 60}px, #000 ${e.x + 40}px)` } : {};
  return (
    <AbsoluteFill style={{ overflow: "hidden", ...mask }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: `translate(${e.x}px, ${e.y}px) scale(${e.s})` }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};

/** Capa 1080×1920 centrada en el cuadro (para tipografía grande que debe verse completa en cualquier formato). */
export const Centro: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const c = useCentro();
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: `translate(${c.x}px, ${c.y}px) scale(${c.k})`, ...style }}>
      {children}
    </div>
  );
};
