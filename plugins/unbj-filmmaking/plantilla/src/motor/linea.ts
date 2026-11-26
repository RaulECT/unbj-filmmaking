// Arma la línea de tiempo a partir de video.json: cada escena aporta, en su tiempo local, sus poses del celular,
// pantallas, toques, movimientos de la cámara global, títulos y efectos de sonido. Aquí se pasan a tiempo absoluto.
import React from "react";
import { r6 } from "./tiempo";

export type Sfx = { at: number; f: "whoosh" | "pop" | "ding" | "click" | "boom"; v?: number };
export type PK = { at: number; d?: number; x: number; y: number; s: number; ry: number; rz: number; z: number };
export type WK = { at: number; d?: number; x: number; y: number; s: number; rx: number; rz: number };
export type Tr = "push" | "sheet" | "fade";
export type Shot = { from: number; src: string; h: number; keys: { at: number; d?: number; cy: number }[]; tr?: Tr; sheetTop?: number };
export type Tap = { at: number; x: number; y: number };
export type Cap = { from: number; to: number; eyebrow: string; title: string; align?: "left" | "center" };
export type Badge = { from: number; to: number; text: string; top: number };
export type Pantalla = { archivo: string; alto: number };

export type Ctx = { o: number; fin: number; e: any; n: string | null; i: number };
export type DefEscena = {
  /** duración en segundos (fija: es el ritmo del original) */
  dur: (e: any) => number;
  /** lleva número de sección (01, 02…) */
  numerada?: boolean;
  /** fin del número fantasma, en tiempo local (por defecto, el fin de la escena) */
  finNumero?: (dur: number) => number;
  telefono?: (e: any) => { keys?: PK[]; shots?: Shot[]; taps?: Tap[] };
  mundo?: (e: any, ctx: { telefono: (t: number) => PK | null }) => WK[];
  titulos?: (e: any) => { from: number; to: number; title: string; eyebrow?: string; sinNumero?: boolean; align?: "left" | "center" }[];
  insignias?: (e: any) => Badge[];
  sfx?: (e: any) => Sfx[];
  /** sumar el inicio sin redondear (el cierre del original calcula sus efectos como DURATION ± x) */
  sfxSinRedondeo?: boolean;
  /** dentro del escenario (debajo de la cámara global) */
  Mundo?: React.FC<Ctx>;
  /** dentro del escenario (sobre la cámara global) */
  Capa?: React.FC<Ctx>;
  /** cuadro completo, encima de todo (ganchos, cierres) */
  Arriba?: React.FC<Ctx>;
};

export type Linea = {
  items: Ctx[];
  total: number;
  phone: PK[];
  phoneDesde: number;
  phoneHasta: number;
  shots: Shot[];
  taps: Tap[];
  world: WK[];
  sfx: Sfx[];
  nums: { from: number; to: number; n: string; side: "left" | "right" }[];
  caps: Cap[];
  badges: Badge[];
  starts: number[]; // inicios de escenas numeradas (el fondo se reacomoda)
};

export const FRONTAL = { x: 0, y: 0, s: 1, rx: 0, rz: 0 };

export function armar(escenas: any[], defs: Record<string, DefEscena>): Linea {
  const L: Linea = { items: [], total: 0, phone: [], phoneDesde: -1, phoneHasta: -1, shots: [], taps: [], world: [{ at: 0, ...FRONTAL }], sfx: [], nums: [], caps: [], badges: [], starts: [] };
  let o = 0;
  let num = 0;
  escenas.forEach((e, i) => {
    const def = defs[e.tipo];
    if (!def) throw new Error(`Escena desconocida: "${e.tipo}"`);
    const dur = def.dur(e);
    let n: string | null = null;
    if (def.numerada) {
      const continua = e.numero === "igual" || (e.numero === undefined && e.tipo === "ruta" && escenas[i - 1]?.tipo === "reproductor");
      if (continua && num > 0) {
        n = String(num).padStart(2, "0");
        const last = L.nums[L.nums.length - 1];
        if (last) last.to = o + (def.finNumero ? def.finNumero(dur) : dur);
      } else {
        num++;
        n = String(num).padStart(2, "0");
        L.nums.push({ from: o, to: o + (def.finNumero ? def.finNumero(dur) : dur), n, side: num % 2 ? "right" : "left" });
        L.starts.push(o);
      }
    }
    L.items.push({ o, fin: r6(o + dur), e, n, i });

    const tel = def.telefono?.(e);
    if (tel) {
      const keys = (tel.keys ?? []).map((k) => ({ ...k, at: r6(k.at + o) }));
      if (L.phoneDesde < 0) {
        L.phoneDesde = o + Math.min(-0.1, ...keys.map((k) => k.at - o));
        // si la escena no trae su propia entrada, el celular cae desde arriba
        if (keys.length && !(keys[0].z > 0)) L.phone.push({ ...keys[0], at: L.phoneDesde, d: 0, z: 900 });
      }
      L.phone.push(...keys);
      L.phoneHasta = o + dur;
      const shots = (tel.shots ?? []).map((s) => ({ ...s, from: s.from + o, keys: s.keys.map((k) => ({ ...k, at: r6(k.at + o) })) }));
      for (const s of shots) {
        if (!L.shots.length) {
          s.tr = undefined;
          s.from = Math.min(s.from, L.phoneDesde);
          s.keys[0].at = Math.min(s.keys[0].at, L.phoneDesde);
        } else if (!s.tr) s.tr = "push";
        L.shots.push(s);
      }
      L.taps.push(...(tel.taps ?? []).map((k) => ({ ...k, at: r6(k.at + o) })));
    }
    for (const t of def.titulos?.(e) ?? []) {
      const eyebrow = t.eyebrow ?? e.etiqueta ?? "";
      L.caps.push({ from: r6(t.from + o), to: r6(t.to + o), align: t.align, title: t.title, eyebrow: n && !t.sinNumero ? `${n} · ${eyebrow}` : eyebrow });
    }
    L.badges.push(...(def.insignias?.(e) ?? []).map((b) => ({ ...b, from: r6(b.from + o), to: r6(b.to + o) })));
    L.sfx.push(...(def.sfx?.(e) ?? []).map((s) => ({ ...s, at: def.sfxSinRedondeo ? o + s.at : r6(s.at + o) })));
    o = r6(o + dur);
  });
  L.total = o;
  L.phone.sort((a, b) => a.at - b.at);
  // la cámara global puede necesitar la pose del celular (acercamiento a un botón)
  const poseEn = (t: number) => {
    const ks = L.phone.filter((k) => k.at <= t);
    return ks.length ? ks[ks.length - 1] : null;
  };
  L.items.forEach((it) => {
    const def = defs[it.e.tipo];
    const w = def.mundo?.(it.e, { telefono: (t) => poseEn(t + it.o) }) ?? [];
    L.world.push(...w.map((k) => ({ ...k, at: r6(k.at + it.o) })));
  });
  L.world.sort((a, b) => a.at - b.at);
  L.sfx = L.sfx.filter((s) => s.at >= 0 && s.at < L.total);
  return L;
}

export const LineaCtx = React.createContext<Linea | null>(null);
export const useLinea = () => React.useContext(LineaCtx)!;
