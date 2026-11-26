// Genera src/fuentes.ts con las dos fuentes de Google Fonts de marca.json.
import fs from "node:fs";
import path from "node:path";
import { MOTOR, fallo } from "./comun.mjs";

const modulo = (nombre) => nombre.replace(/[^A-Za-z0-9]/g, "");

export function escribirFuentes(dir, marca) {
  const t = marca.fuentes?.titulos ?? "Playfair Display";
  const x = marca.fuentes?.texto ?? "Inter";
  const gf = path.join(MOTOR, "node_modules", "@remotion", "google-fonts", "dist", "esm");
  for (const f of [t, x]) {
    if (fs.existsSync(gf) && !fs.existsSync(path.join(gf, `${modulo(f)}.mjs`)))
      fallo(`La fuente "${f}" no está en Google Fonts (revisa el nombre exacto en fonts.google.com).`);
  }
  const src = `// ARCHIVO GENERADO por scripts/preparar.mjs a partir de marca.json → fuentes. No editar a mano.
import { loadFont as cargarTitulos } from "@remotion/google-fonts/${modulo(t)}";
import { loadFont as cargarTexto } from "@remotion/google-fonts/${modulo(x)}";

// se piden los pesos que usa el estilo; si la fuente no los tiene, se cargan los que existan
const pesos = (info: any, quiero: string[]) => {
  const hay = Object.keys(info.fonts?.normal ?? {});
  const ok = quiero.filter((w) => hay.includes(w));
  return ok.length ? ok : hay;
};
const pesosIt = (info: any, quiero: string[]) => {
  const hay = Object.keys(info.fonts?.italic ?? {});
  return quiero.filter((w) => hay.includes(w));
};
import { getInfo as infoTitulos } from "@remotion/google-fonts/${modulo(t)}";
import { getInfo as infoTexto } from "@remotion/google-fonts/${modulo(x)}";

export const { fontFamily: TITULOS } = cargarTitulos("normal", { weights: pesos(infoTitulos(), ["400", "600", "700", "900"]) as any, subsets: ["latin"] });
const it = pesosIt(infoTitulos(), ["400", "500", "700"]);
if (it.length) cargarTitulos("italic", { weights: it as any, subsets: ["latin"] });
export const { fontFamily: TEXTO } = cargarTexto("normal", { weights: pesos(infoTexto(), ["400", "600", "700", "900"]) as any, subsets: ["latin"] });
`;
  fs.writeFileSync(path.join(dir, "src", "fuentes.ts"), src);
}
