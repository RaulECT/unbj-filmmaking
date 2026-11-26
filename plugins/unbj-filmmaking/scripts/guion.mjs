// Escribe guion.md (tabla de escenas + copy para publicar) a partir de video.json, para aprobar antes de renderizar.
// Uso: node guion.mjs <carpeta del video>
import fs from "node:fs";
import path from "node:path";
import { proyecto, leer, tiempos, seg } from "./comun.mjs";
import { cur, filas as describir } from "./descripciones.mjs";

const dir = proyecto(process.argv[2]);
const v = leer(path.join(dir, "video.json"));
const esc = v.escenas;
const ts = tiempos(esc);


const filas = describir(esc).map((d, i) => `| ${i + 1} | ${seg(ts[i].desde)}–${seg(ts[i].hasta)} | ${esc[i].tipo} | ${d.texto} | ${d.ve} | ${d.anim} | ${d.tr} | ${d.sfx} |`);
const pub = v.publicacion ?? {};
const CREDITOS = { "Carefree.mp3": "Carefree", "Life-of-Riley.mp3": "Life of Riley", "Wallpaper.mp3": "Wallpaper", "Funkorama.mp3": "Funkorama", "Inspired.mp3": "Inspired" };
const pista = v.musica ? CREDITOS[path.basename(v.musica)] : null;
const credito = pista ? `\nMúsica: «${pista}» de Kevin MacLeod (incompetech.com), licencia CC BY 4.0` : "";
const md = `# Guion — ${v.titulo ?? path.basename(dir)}

**Duración:** ${seg(ts.at(-1).hasta)} · **Formatos:** ${(v.formatos ?? ["vertical"]).join(", ")} · **Música:** ${v.musica ? path.basename(v.musica) : "solo efectos"}

| # | Tiempo | Escena | Texto en pantalla | Qué se ve | Animación | Transición | Sonido |
| --- | --- | --- | --- | --- | --- | --- | --- |
${filas.join("\n")}

_Las palabras en cursiva van en el color de acento._

## Copy para publicar

${pub.texto ?? "_(pendiente)_"}

${(pub.hashtags ?? []).join(" ")}
${credito}

**Portada del post:** fotograma en ${pub.portada ?? "—"} s.
`;
fs.writeFileSync(path.join(dir, "guion.md"), md);
console.log(`✅ ${path.join(dir, "guion.md")}`);
