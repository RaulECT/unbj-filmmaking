// Revisa video.json y marca.json antes de renderizar. Completa solo el "alto" de cada pantalla.
// Uso: node validar.mjs <carpeta del video>
import fs from "node:fs";
import path from "node:path";
import { PLUGIN, proyecto, leer, escribir, medidas, DUR, tiempos, seg } from "./comun.mjs";

const dir = proyecto(process.argv[2]);
const pub = path.join(dir, "public");
const video = leer(path.join(dir, "video.json"));
const marca = fs.existsSync(path.join(dir, "marca.json")) ? leer(path.join(dir, "marca.json")) : null;
const errores = [];
const avisos = [];
const existe = (f, donde) => {
  if (!f) return errores.push(`${donde}: falta la imagen.`);
  if (!fs.existsSync(path.join(pub, f))) errores.push(`${donde}: no encuentro la imagen "${f}" en public/.`);
};
const largo = (txt, max, donde) => {
  const limpio = String(txt ?? "").replace(/\*/g, "");
  if (!limpio) errores.push(`${donde}: falta el texto.`);
  else if (limpio.length > max) avisos.push(`${donde}: "${limpio}" tiene ${limpio.length} letras (recomendado ≤ ${max}); puede verse apretado.`);
};
const pantalla = (p, donde) => {
  if (!p) return errores.push(`${donde}: falta la pantalla del celular.`);
  existe(p.archivo, donde);
  const f = path.join(pub, p.archivo ?? "");
  if (fs.existsSync(f)) {
    const m = medidas(f);
    if (!m) return errores.push(`${donde}: "${p.archivo}" debe ser PNG o JPG.`);
    const alto = Math.round((m.h * 390) / m.w);
    // alto en puntos de diseño (ancho 390). Si ya viene (p. ej. medido en Pencil), se respeta: recalcularlo
    // desde los píxeles redondea distinto y corre la pantalla 1–2 px.
    if (!p.alto) p.alto = alto;
    else if (Math.abs(p.alto - alto) / alto > 0.02) avisos.push(`${donde}: "alto" (${p.alto}) no coincide con la imagen (≈${alto}); revisa que sea la captura correcta.`);
    if (m.w < 780) avisos.push(`${donde}: "${p.archivo}" mide ${m.w}px de ancho; se verá borrosa (ideal 1170px).`);
  }
};

if (!marca) errores.push("Falta marca.json.");
else {
  for (const k of ["fondo", "texto", "acento", "secundario"]) if (!/^#[0-9A-Fa-f]{6}$/.test(marca.colores?.[k] ?? "")) errores.push(`marca.json: el color "${k}" debe ser #RRGGBB.`);
  existe(marca.logo, "marca.json → logo");
  if (marca.logoBlanco) existe(marca.logoBlanco, "marca.json → logoBlanco");
}
const esc = video.escenas ?? [];
if (!esc.length) errores.push("video.json no tiene escenas.");
esc.forEach((e, i) => {
  const d = `Escena ${i + 1} (${e.tipo})`;
  if (!(e.tipo in DUR) && e.tipo !== "persona" && e.tipo !== "captura") return errores.push(`${d}: tipo desconocido.`);
  if (e.titulo !== undefined && e.tipo !== "cierre") largo(e.titulo, 30, `${d} → título`);
  if (e.etiqueta !== undefined) largo(e.etiqueta, 26, `${d} → etiqueta`);
  if (e.titulo && !/\*[^*]+\*/.test(e.titulo)) avisos.push(`${d}: el título no tiene palabra en *cursiva*; el estilo siempre resalta una.`);
  switch (e.tipo) {
    case "gancho":
      if (!Array.isArray(e.pregunta) || e.pregunta.length !== 3) errores.push(`${d}: "pregunta" lleva 3 partes.`);
      if (!Array.isArray(e.palabras) || e.palabras.length < 2 || e.palabras.length > 4) errores.push(`${d}: "palabras" lleva de 2 a 4.`);
      largo(e.remate, 9, `${d} → remate`);
      break;
    case "plataforma":
      pantalla(e.pantalla, d);
      (e.portadas ?? []).forEach((p, j) => existe(p.archivo, `${d} → portada ${j + 1}`));
      if ((e.portadas ?? []).length !== 6) avisos.push(`${d}: van mejor 6 portadas (hay ${(e.portadas ?? []).length}).`);
      break;
    case "catalogo":
      pantalla(e.pantalla, d);
      if (e.hoja) pantalla(e.hoja, `${d} → hoja`);
      if (!e.categorias?.length) errores.push(`${d}: faltan categorías.`);
      (e.categorias ?? []).forEach((c) => largo(c, 16, `${d} → categoría`));
      break;
    case "avance":
      pantalla(e.pantalla, d);
      if (!e.cifras?.length) errores.push(`${d}: faltan cifras.`);
      break;
    case "reproductor":
      pantalla(e.pantalla, d);
      existe(e.portada, `${d} → portada`);
      break;
    case "ruta":
      if (e.modulos?.length !== 3) errores.push(`${d}: "modulos" lleva 3.`);
      break;
    case "descargas":
      pantalla(e.pantalla, d);
      existe(e.archivo?.portada, `${d} → archivo.portada`);
      break;
    case "diploma":
      if (e.pantalla) pantalla(e.pantalla, d);
      existe(e.imagen, `${d} → imagen`);
      break;
    case "cierre":
      if (e.pantalla) pantalla(e.pantalla, d);
      (e.portadas ?? []).forEach((p, j) => existe(p, `${d} → portada ${j + 1}`));
      if (i !== esc.length - 1) avisos.push(`${d}: el cierre suele ir al final.`);
      break;
    case "captura": {
      existe(e.imagen, d);
      const f = path.join(pub, e.imagen ?? "");
      const m = fs.existsSync(f) ? medidas(f) : null;
      if (m) {
        const dentro = (r, que) => r && (r.x < 0 || r.y < 0 || r.x + (r.w ?? 0) > m.w || r.y + (r.h ?? 0) > m.h) && errores.push(`${d}: ${que} se sale de la imagen (${m.w}×${m.h}).`);
        dentro(e.recorte, "el recorte");
        dentro(e.foco, "el foco");
        dentro(e.clic, "el clic");
      }
      if (e.video) existe(e.video.archivo, `${d} → video`);
      break;
    }
    case "persona":
      {
        const cj = fs.existsSync(path.join(dir, "camara.json")) ? leer(path.join(dir, "camara.json")) : null;
        const arch = Array.isArray(cj) ? "camara.mp4" : cj?.archivo ?? "camara.mp4";
        if (!fs.existsSync(path.join(pub, arch))) errores.push(`${d}: falta la grabación public/${arch} (se prepara con camara.py).`);
      }
      if (!(e.hasta > e.desde)) errores.push(`${d}: "hasta" debe ser mayor que "desde".`);
      break;
  }
});
const ph = esc.filter((e) => ["plataforma", "catalogo", "avance", "reproductor", "descargas", "diploma"].includes(e.tipo));
if (esc.some((e) => e.tipo === "ruta" || e.tipo === "reproductor") && !ph.length) avisos.push("Hay escenas que usan el celular, pero ninguna le pone pantalla.");
if (video.musica && !fs.existsSync(path.resolve(dir, video.musica)) && !fs.existsSync(path.join(PLUGIN, "musica", video.musica))) errores.push(`No encuentro la música "${video.musica}".`);

escribir(path.join(dir, "video.json"), video);
const ts = tiempos(esc);
console.log(`Duración: ${seg(ts.at(-1)?.hasta ?? 0)} · ${esc.length} escenas`);
avisos.forEach((a) => console.log(`⚠️  ${a}`));
errores.forEach((a) => console.log(`❌ ${a}`));
if (errores.length) process.exit(1);
console.log("✅ Todo en orden para renderizar.");
