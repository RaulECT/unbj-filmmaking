// Render final (o vista previa) con la mezcla de audio del reel original.
// Uso: node render.mjs <carpeta del video> [--vista-previa] [--formatos vertical,horizontal] [--musica <archivo>] [--volumen 0.8]
//  · Sin persona a cámara: música + efectos, normalizado a -14 LUFS (estándar de redes).
//  · Con persona a cámara: la voz manda; la música baja sola cuando se habla (ducking).
import fs from "node:fs";
import path from "node:path";
import { proyecto, leer, npx, run, FORMATOS, PLUGIN, fallo } from "./comun.mjs";

const args = process.argv.slice(2);
const opt = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : d;
};
const dir = proyecto(args[0]);
const previa = args.includes("--vista-previa");
const v = leer(path.join(dir, "video.json"));
const formatos = (opt("--formatos") ?? (previa ? (v.formatos ?? ["vertical"])[0] : (v.formatos ?? ["vertical"]).join(","))).split(",");
let musica = opt("--musica", v.musica ?? "");
if (musica && !fs.existsSync(musica)) {
  const enPlugin = path.join(PLUGIN, "musica", musica);
  const enProyecto = path.resolve(dir, musica);
  musica = fs.existsSync(enProyecto) ? enProyecto : fs.existsSync(enPlugin) ? enPlugin : fallo(`No encuentro la música "${musica}".`);
}
const voz = v.escenas.some((e) => e.tipo === "persona");
const mvol = Number(opt("--volumen", voz ? 0.16 : 0.8));
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
  const d = Number(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", crudo], { silencio: true }).stdout.trim());
  const fo = Math.max(0, d - 1.6);
  const mezcla = path.join(tmp, `${f}.wav`);
  if (musica && voz) {
    run("ffmpeg", ["-v", "error", "-y", "-i", crudo, "-i", musica, "-filter_complex",
      `[0:a]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[v];[1:a]atrim=0:${d},asetpts=PTS-STARTPTS,aresample=48000,volume=${mvol},afade=t=in:d=0.8,afade=t=out:st=${fo}:d=1.6[m];[v]asplit=2[vv][sc];[m][sc]sidechaincompress=threshold=0.05:ratio=4:attack=30:release=400[md];[vv][md]amix=inputs=2:normalize=0,alimiter=limit=0.89[out]`,
      "-map", "[out]", "-ar", "48000", mezcla]);
  } else if (musica) {
    run("ffmpeg", ["-v", "error", "-y", "-i", crudo, "-i", musica, "-filter_complex",
      `[1:a]atrim=0:${d},asetpts=PTS-STARTPTS,aresample=48000,volume=${mvol},afade=t=in:d=0.5,afade=t=out:st=${fo}:d=1.6[m];[0:a]aresample=48000,volume=0.6[s];[m][s]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[out]`,
      "-map", "[out]", "-ar", "48000", mezcla]);
  } else {
    run("ffmpeg", ["-v", "error", "-y", "-i", crudo, "-af", `volume=${voz ? 1 : 0.6},loudnorm=I=-14:TP=-1.5:LRA=11`, "-ar", "48000", mezcla]);
  }
  const fin = path.join(salida, `${nombre} — ${f}${previa ? " (vista previa)" : ""}.mp4`);
  run("ffmpeg", ["-v", "error", "-y", "-i", crudo, "-i", mezcla, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", fin]);
  console.log(`✅ ${fin} (${d.toFixed(1)} s)`);
}
fs.rmSync(tmp, { recursive: true, force: true });
