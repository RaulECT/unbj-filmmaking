// Render final (o vista previa). Todo el audio (efectos, voz y música con entrada/salida suaves y ducking) se mezcla
// dentro de Remotion; después el ffmpeg que trae Remotion normaliza a -14 LUFS (estándar de redes).
// Uso: node render.mjs <carpeta del video> [--vista-previa] [--formatos vertical,horizontal] [--musica <archivo>] [--volumen 0.47]
import fs from "node:fs";
import path from "node:path";
import { proyecto, leer, escribir, npx, ffmpeg, duracion, FORMATOS, PLUGIN, MOTOR, fallo } from "./comun.mjs";

const args = process.argv.slice(2);
const opt = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : d;
};
const dir = proyecto(args[0]);
const previa = args.includes("--vista-previa");
const v = leer(path.join(dir, "video.json"));
const formatos = (opt("--formatos") ?? (previa ? (v.formatos ?? ["vertical"])[0] : (v.formatos ?? ["vertical"]).join(","))).split(",");
const voz = v.escenas.some((e) => e.tipo === "persona");

// música: se copia a public/ para que Remotion la mezcle
const pedida = opt("--musica", v.musica ?? "");
for (const f of fs.readdirSync(path.join(dir, "public"))) if (/^musica\./.test(f)) fs.rmSync(path.join(dir, "public", f));
if (pedida) {
  const cands = [pedida, path.resolve(dir, pedida), path.join(PLUGIN, "musica", pedida)];
  const src = cands.find((c) => fs.existsSync(c)) ?? fallo(`No encuentro la música "${pedida}".`);
  fs.copyFileSync(src, path.join(dir, "public", `musica${path.extname(src).toLowerCase()}`));
}
const vol = opt("--volumen");
if (vol) {
  v.volumenMusica = Number(vol);
  escribir(path.join(dir, "video.json"), v);
}
const salida = path.join(dir, previa ? "vista-previa" : "final");
fs.mkdirSync(salida, { recursive: true });
const tmp = path.join(dir, ".render");
fs.mkdirSync(tmp, { recursive: true });
const nombre = (v.titulo ?? path.basename(dir)).replace(/[\\/:*?"<>|]/g, "-");

for (const f of formatos) {
  if (!FORMATOS[f]) fallo(`Formato desconocido: ${f}`);
  console.log(`→ ${previa ? "Vista previa" : "Render"} ${f}…`);
  const crudo = path.join(tmp, `${f}.mp4`);
  npx(dir, ["render", "src/index.ts", FORMATOS[f], crudo, "--log=error", ...(previa ? ["--scale=0.5", "--crf=30", "--jpeg-quality=70"] : ["--crf=18"])]);
  const fin = path.join(salida, `${nombre} — ${f}${previa ? " (vista previa)" : ""}.mp4`);
  // sin voz: mismo ajuste que el reel original (efectos a 0,6 y loudnorm); con voz: solo loudnorm
  const mezcla = path.join(tmp, `${f}.wav`);
  // loudnorm en dos pasadas: primero se mide, luego se aplica con esos valores (más preciso con voz)
  const pre = `volume=${voz ? 1 : 0.6}`;
  const med = npx(MOTOR, ["ffmpeg", "-hide_banner", "-i", crudo, "-vn", "-af", `${pre},loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json`, "-f", "null", "-"], { silencio: true });
  const j = JSON.parse(med.stderr.slice(med.stderr.lastIndexOf("{"), med.stderr.lastIndexOf("}") + 1));
  const ln = voz
    ? `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`
    : "loudnorm=I=-14:TP=-1.5:LRA=11"; // sin voz: igual que el reel original (paridad)
  ffmpeg(["-y", "-i", crudo, "-vn", "-af", `${pre},${ln}`, "-ar", "48000", mezcla]);
  ffmpeg(["-y", "-i", crudo, "-i", mezcla, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", fin]);
  console.log(`✅ ${fin} (${duracion(fin).toFixed(1)} s)`);
}
fs.rmSync(tmp, { recursive: true, force: true });
