// Storyboard: un fotograma por escena (en el momento en que se lee mejor) y una hoja con todos.
// Uso: node storyboard.mjs <carpeta del video> [formato=vertical]
import fs from "node:fs";
import path from "node:path";
import { proyecto, leer, tiempos, npx, medidas, FORMATOS, fallo } from "./comun.mjs";
import { storyboardHtml } from "./storyboard-html.mjs";

const dir = proyecto(process.argv[2]);
const formato = process.argv[3] ?? "vertical";
if (!FORMATOS[formato]) fallo(`Formato desconocido: ${formato}`);
const v = leer(path.join(dir, "video.json"));
const ts = tiempos(v.escenas);
// en qué parte de cada escena se ve completa (fracción de su duración)
const PUNTO = { gancho: 0.92, "golpe-barrido": 0.6, "golpe-circulo": 0.55, cierre: 0.85, persona: 0.5, captura: 0.8 };
const out = path.join(dir, "storyboard");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out);
const archivos = [];
v.escenas.forEach((e, i) => {
  const t = ts[i].desde + ts[i].dur * (PUNTO[e.tipo] ?? 0.7);
  const f = path.join(out, `${String(i + 1).padStart(2, "0")}-${e.tipo}.jpg`);
  console.log(`→ Escena ${i + 1} (${e.tipo})`);
  npx(dir, ["still", "src/index.ts", FORMATOS[formato], f, `--frame=${Math.round(t * 30)}`, "--scale=0.5", "--log=error"], { silencio: true });
  archivos.push(f);
});
const cols = Math.min(archivos.length, formato === "horizontal" ? 3 : 6);
const filas = Math.ceil(archivos.length / cols);
// la hoja se arma con la composición "Hoja" de la plantilla (copia temporal de los fotogramas en public/)
const tmp = path.join(dir, "public", ".storyboard");
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(tmp);
archivos.forEach((a) => fs.copyFileSync(a, path.join(tmp, path.basename(a))));
const m = medidas(archivos[0]);
const props = path.join(tmp, "props.json");
fs.writeFileSync(props, JSON.stringify({ imgs: archivos.map((a) => `.storyboard/${path.basename(a)}`), w: m.w, h: m.h, cols }));
npx(dir, ["still", "src/index.ts", "Hoja", path.join(out, "hoja.jpg"), `--props=${props}`, "--log=error"], { silencio: true });
fs.rmSync(tmp, { recursive: true, force: true });
const h = storyboardHtml(dir, formato);
console.log(`✅ Storyboard: ${out} (${archivos.length} escenas, ${filas} fila(s) en hoja.jpg)\n✅ Página: ${h.out} (borrador ${h.borrador})`);
