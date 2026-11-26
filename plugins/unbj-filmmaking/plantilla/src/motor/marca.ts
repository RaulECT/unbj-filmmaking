// La marca sale de marca.json (en la raíz del proyecto). Los colores que no se den se derivan de los principales.
import M from "../../marca.json";
import { TITULOS, TEXTO } from "../fuentes";

const hex = (h: string) => {
  const s = h.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
};
const toHex = (c: number[]) => "#" + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("").toUpperCase();
export const mezcla = (a: string, b: string, p: number) => {
  const x = hex(a);
  const y = hex(b);
  return toHex(x.map((v, i) => v + (y[i] - v) * p));
};
export const oscurecer = (a: string, p: number) => mezcla(a, "#000000", p);

const m = M as any;
const c = m.colores;
const d = m.derivados ?? {};
const [r, g, b] = hex(c.texto);
/** sombra con el color del texto (en el original, rgba(28,28,28,a)) */
export const sombra = (a: number) => `rgba(${r},${g},${b},${a})`;

export const C = {
  bg: c.fondo,
  paper2: c.papel ?? mezcla(c.fondo, "#FFFFFF", 0.45),
  cream: c.crema ?? mezcla(c.fondo, "#FFFFFF", 0.1),
  card: c.tarjeta ?? "#FFFFFF",
  line: c.linea ?? oscurecer(c.fondo, 0.14),
  text: c.texto,
  muted: c.tenue ?? mezcla(c.texto, c.fondo, 0.45),
  lime: c.acento, // acento principal (el nombre viene del motor de editor-video-ia)
  accentDark: c.acentoOscuro ?? oscurecer(c.acento, 0.22),
  violet: c.secundario, // acento secundario (éxito, completado)
  warn: c.aviso ?? "#A66A20",
  // caras de los bloques isométricos
  losaSur: d.losaSur ?? oscurecer(c.fondo, 0.09),
  losaOeste: d.losaOeste ?? oscurecer(c.fondo, 0.05),
  fichaSur: d.fichaSur ?? oscurecer(c.fondo, 0.11),
  fichaOeste: d.fichaOeste ?? oscurecer(c.fondo, 0.04),
  secSur: d.secundarioSur ?? oscurecer(c.secundario, 0.22),
  secOeste: d.secundarioOeste ?? oscurecer(c.secundario, 0.11),
  acOeste: d.acentoOeste ?? oscurecer(c.acento, 0.11),
  vacioOeste: d.vacioOeste ?? oscurecer(c.tarjeta ?? "#FFFFFF", 0.15),
  sombraCierre: d.sombraCierre ?? "rgba(0,0,0,.4)",
};

export const TITLE = TITULOS;
export const BODY = TEXTO;
export const MARCA = {
  nombre: m.nombre as string,
  logo: m.logo as string,
  logoBlanco: (m.logoBlanco ?? m.logo) as string,
  sitio: (m.sitio ?? "") as string,
  firma: (m.firma ?? null) as null | { izquierda: string; derecha: string },
};
