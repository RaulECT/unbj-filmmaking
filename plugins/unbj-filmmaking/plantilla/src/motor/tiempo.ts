// Tiempo y curvas de animación del reel original. No cambiar las curvas: son el "ritmo" del estilo.
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};
/** redondeo a microsegundos: evita que 19.5 - 19.4 dé 0.0999999 y una pieza se salte un cuadro */
export const r6 = (n: number) => Math.round(n * 1e6) / 1e6;
/** tiempo local de una escena que empieza en `o` */
export const useTl = (o: number) => r6(useT() - o);
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
export const easeIO = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.in(Easing.cubic);
export const glide = Easing.bezier(0.34, 1.25, 0.64, 1); // llega con un leve rebote
export const ramp = (t: number, at: number, dur: number, easing: (x: number) => number = easeOut) =>
  interpolate(t, [at, at + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
/** 0→1 con rebote (elementos que "saltan" a pantalla) */
export const pop = (t: number, at: number, dur = 0.45) =>
  interpolate(t, [at, at + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.8)) });
export const rnd = (i: number, n: number) => {
  const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// keyframes con duración propia por tramo: cada clave anima desde la anterior entre `at` y `at + d`
export type Key = { at: number; d?: number; [k: string]: number | undefined };
export function track<K extends Key>(keys: K[], t: number, easing = glide): K {
  let i = 0;
  while (i + 1 < keys.length && keys[i + 1].at <= t) i++;
  const cur = keys[i];
  if (i === 0) return cur;
  const prev = keys[i - 1];
  const p = ramp(t, cur.at, cur.d ?? 0.8, easing);
  const out: Key = { ...cur };
  for (const k of Object.keys(cur)) if (k !== "at" && k !== "d") out[k] = lerp(prev[k] as number, cur[k] as number, p);
  return out as K;
}

/** Tamaño de letra que cabe en `ancho` px (aprox. por cantidad de letras). */
export const cabe = (texto: string, base: number, ancho: number, factor = 0.62) =>
  Math.min(base, ancho / (Math.max(1, texto.length) * factor));
