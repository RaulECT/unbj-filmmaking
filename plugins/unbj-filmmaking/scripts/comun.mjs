// Utilidades compartidas por los scripts (Mac y Windows).
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const PLUGIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const PLANTILLA = path.join(PLUGIN, "plantilla");
export const CASA = path.join(os.homedir(), ".unbj-filmmaking");
export const MOTOR = path.join(CASA, "motor"); // node_modules compartido por todos los videos
export const VIDEOS = path.join(os.homedir(), "Videos UNBJ Filmmaking");
export const WIN = process.platform === "win32";

export const FORMATOS = { vertical: "Vertical", retrato: "Retrato", cuadrado: "Cuadrado", horizontal: "Horizontal" };

export function fallo(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}
export function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: opts.silencio ? "pipe" : "inherit", shell: WIN, encoding: "utf8", ...opts });
  if (r.status !== 0 && !opts.tolerar) fallo(`Falló: ${cmd} ${args.join(" ")}\n${r.stderr ?? ""}`);
  return r;
}
export const hay = (cmd) => spawnSync(cmd, ["-version"], { stdio: "ignore", shell: WIN }).status === 0 || spawnSync(cmd, ["--version"], { stdio: "ignore", shell: WIN }).status === 0;

export function proyecto(arg) {
  if (!arg) fallo("Falta la carpeta del video.");
  const p = path.resolve(arg.replace(/^~/, os.homedir()));
  if (!fs.existsSync(path.join(p, "video.json"))) fallo(`No encuentro video.json en ${p}`);
  return p;
}
export const leer = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
export const escribir = (p, o) => fs.writeFileSync(p, JSON.stringify(o, null, 2) + "\n");

export const npx = (dir, args, opts = {}) => run(WIN ? "npx.cmd" : "npx", ["--no-install", "remotion", ...args], { cwd: dir, ...opts });

/** Medidas de un PNG o JPG leyendo su cabecera. */
export function medidas(file) {
  const b = fs.readFileSync(file);
  if (b.readUInt32BE(0) === 0x89504e47) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      const len = b.readUInt16BE(i + 2);
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
      i += 2 + len;
    }
  }
  return null;
}

/** Duración de cada tipo de escena (igual que en plantilla/src/escenas). */
export const DUR = {
  gancho: 2.7, plataforma: 4.9, catalogo: 4.4, "golpe-barrido": 0.75, avance: 3.8, reproductor: 2.85, ruta: 2.6,
  "golpe-circulo": 0.8, descargas: 3.0, diploma: 3.4, cierre: 3.2,
};
export const durEscena = (e) => (e.tipo === "persona" ? Math.max(0.5, e.hasta - e.desde) : DUR[e.tipo]);
export function tiempos(escenas) {
  let o = 0;
  return escenas.map((e) => {
    const d = durEscena(e);
    const r = { desde: o, hasta: o + d, dur: d };
    o += d;
    return r;
  });
}
export const seg = (n) => `${Math.floor(n / 60)}:${(n % 60).toFixed(1).padStart(4, "0")}`;
