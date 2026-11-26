// Crea la carpeta de un video nuevo con la plantilla.
// Uso: node preparar.mjs "<nombre del video>" [--ejemplo campus-unbj] [--carpeta <ruta>]
// Con --ejemplo copia también video.json, marca.json y los assets del ejemplo.
// Si la carpeta ya existe, solo actualiza el código de la plantilla (no toca video.json, marca.json ni public/).
import fs from "node:fs";
import path from "node:path";
import { PLUGIN, PLANTILLA, MOTOR, VIDEOS, WIN, fallo, leer, run } from "./comun.mjs";
import { escribirFuentes } from "./fuentes.mjs";

const args = process.argv.slice(2);
const opt = (k) => {
  const i = args.indexOf(k);
  return i >= 0 ? args.splice(i, 2)[1] : undefined;
};
const soloMotor = args.includes("--solo-motor");
if (soloMotor) args.splice(args.indexOf("--solo-motor"), 1);
const ejemplo = opt("--ejemplo");
const carpeta = opt("--carpeta");
const nombre = args.join(" ").trim();
if (!nombre && !carpeta && !soloMotor) fallo('Uso: node preparar.mjs "<nombre del video>" [--ejemplo campus-unbj]');
const slug = nombre.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").toLowerCase();
const dir = carpeta ? path.resolve(carpeta) : path.join(VIDEOS, slug);

// 1. motor compartido (node_modules), una sola vez
if (!fs.existsSync(path.join(MOTOR, "node_modules", "remotion"))) {
  console.log("→ Instalando el motor de video (solo la primera vez, 2–5 minutos)…");
  fs.mkdirSync(MOTOR, { recursive: true });
  fs.copyFileSync(path.join(PLANTILLA, "package.json"), path.join(MOTOR, "package.json"));
  run(WIN ? "npm.cmd" : "npm", ["install", "--no-audit", "--no-fund", "--loglevel=error"], { cwd: MOTOR });
}

if (soloMotor) {
  console.log("✅ Motor de video listo.");
  process.exit(0);
}

// 2. código de la plantilla
const nuevo = !fs.existsSync(dir);
fs.mkdirSync(path.join(dir, "public"), { recursive: true });
fs.rmSync(path.join(dir, "src"), { recursive: true, force: true });
fs.cpSync(path.join(PLANTILLA, "src"), path.join(dir, "src"), { recursive: true });
for (const f of ["package.json", "tsconfig.json"]) fs.copyFileSync(path.join(PLANTILLA, f), path.join(dir, f));
fs.cpSync(path.join(PLANTILLA, "public", "sfx"), path.join(dir, "public", "sfx"), { recursive: true });
if (!fs.existsSync(path.join(dir, "camara.json"))) fs.writeFileSync(path.join(dir, "camara.json"), "[]\n");

// 3. node_modules → motor compartido
const nm = path.join(dir, "node_modules");
if (!fs.existsSync(nm)) fs.symlinkSync(path.join(MOTOR, "node_modules"), nm, WIN ? "junction" : "dir");

// 4. ejemplo (opcional)
if (ejemplo) {
  const ej = path.join(PLUGIN, "ejemplos", ejemplo);
  if (!fs.existsSync(ej)) fallo(`No existe el ejemplo "${ejemplo}"`);
  for (const f of ["video.json", "marca.json"]) fs.copyFileSync(path.join(ej, f), path.join(dir, f));
  fs.cpSync(path.join(ej, "assets"), path.join(dir, "public"), { recursive: true });
}
if (!fs.existsSync(path.join(dir, "marca.json")) || !fs.existsSync(path.join(dir, "video.json"))) {
  console.log(`\n✅ Carpeta lista: ${dir}\n   Falta escribir marca.json y video.json (y poner las imágenes en public/).`);
} else {
  escribirFuentes(dir, leer(path.join(dir, "marca.json")));
  console.log(`\n✅ ${nuevo ? "Video creado" : "Plantilla actualizada"}: ${dir}`);
}
