// Escribe guion.md (tabla de escenas + copy para publicar) a partir de video.json, para aprobar antes de renderizar.
// Uso: node guion.mjs <carpeta del video>
import fs from "node:fs";
import path from "node:path";
import { proyecto, leer, tiempos, seg } from "./comun.mjs";

const dir = proyecto(process.argv[2]);
const v = leer(path.join(dir, "video.json"));
const esc = v.escenas;
const ts = tiempos(esc);
const cur = (s) => String(s ?? "").replace(/\*([^*]+)\*/g, "_$1_");

const DESC = {
  gancho: (e) => ({
    texto: `${e.pregunta.join(" ")} → ${e.prefijo} [${e.palabras.join(" / ")}] → ${e.remate} ${e.subremate ?? ""}`,
    ve: "Tres golpes tipográficos sobre papel; aparece el logo",
    anim: "Palabras suben desde máscara; píldora de color con palabras que giran; remate se rellena de izquierda a derecha",
    tr: "La cámara atraviesa el texto (zoom ×6)",
    sfx: "pop ×3, whoosh, click por palabra, boom, whoosh",
  }),
  plataforma: (e) => ({
    ve: `Celular cae sobre una losa isométrica con ${e.portadas?.length ?? 0} portadas como bloques`,
    anim: "Bloques caen y crecen; la pantalla hace scroll; la cámara gira de isométrico a frontal; las portadas se elevan" + (e.insignia ? `; insignia «${e.insignia}»` : ""),
    tr: "Giro de cámara 3D",
    sfx: "pop por portada, whoosh",
  }),
  catalogo: (e) => ({
    ve: `Celular girado a la izquierda (pantalla ${e.pantalla.archivo}); chips: ${e.categorias.join(", ")}`,
    anim: `Chips entran desde la derecha y flotan; ${e.toque ? "toque en la pantalla, " : ""}${e.hoja ? "sube una hoja inferior, " : ""}se selecciona «${e.categorias[e.seleccion ?? 0]}»`,
    tr: "Pantalla entra empujando (push)",
    sfx: "whoosh, pops, click, pop",
  }),
  "golpe-barrido": (e) => ({ texto: `${e.linea1} ${e.linea2}`, ve: "Panel de color a cuadro completo", anim: "Texto sube desde máscara", tr: "Barrido de derecha a izquierda con inclinación", sfx: "whoosh, pop, whoosh" }),
  avance: (e) => ({
    ve: "Tres cifras a la izquierda, celular a la derecha",
    anim: `Contadores suben: ${e.cifras.map((c) => (c.tipo === "duracion" ? `${Math.floor(c.minutos / 60)} h ${c.minutos % 60} ${c.texto}` : `${c.valor}${c.tipo === "porcentaje" ? "%" : ""} ${c.texto}`)).join(" · ")}`,
    tr: e.toque ? "Acercamiento macro al botón que se toca" : "—",
    sfx: "pops, ding, whoosh, click",
  }),
  reproductor: (e) => ({ ve: `El video (${e.portada}) sale del celular`, anim: `Se agranda con controles; chip «${e.chip ?? ""}»; avanza ${e.desde ?? ""} / ${e.total ?? ""}`, tr: "Push de pantalla", sfx: "whoosh ×2" }),
  ruta: (e) => ({ ve: "Escalera isométrica de 3 módulos", anim: `Bloques crecen; la marca «${e.iniciales ?? ""}» salta al módulo actual; lista: ${e.modulos.map((m) => m.texto).join(" · ")}`, tr: "El celular sale volando a la izquierda", sfx: "whoosh, pops, ding" }),
  "golpe-circulo": (e) => ({ texto: `${e.linea1} ${e.linea2}`, ve: "Círculo de tinta a cuadro completo", anim: "Texto sube; la segunda línea se tacha", tr: "El círculo se abre y se cierra sobre la tarjeta siguiente", sfx: "whoosh, click, whoosh" }),
  descargas: (e) => ({ ve: `Tarjetas «${e.aviso?.titulo ?? ""}» y «${e.archivo.titulo}»`, anim: `Ícono de wifi se apaga y se tacha; barra de descarga llega a 100% → «${e.listo ?? "Descargada"}»`, tr: "Cámara se inclina sobre la mesa", sfx: "whoosh, click, ding" }),
  diploma: (e) => ({ ve: `Confeti y ${e.imagen}`, anim: "El diploma se levanta desde el plano; insignia con check", tr: "Empuje lento de cámara", sfx: "whoosh, boom, whoosh, pop" }),
  persona: (e) => ({ ve: `Persona a cámara (camara.mp4, ${e.desde}–${e.hasta} s)`, anim: "Subtítulos palabra por palabra" + (e.resaltar?.length ? `; resaltadas: ${e.resaltar.join(", ")}` : ""), tr: "Cortina que abre y cierra", sfx: "whoosh" }),
  cierre: (e) => ({
    texto: `${e.etiqueta ?? ""} · ${cur(e.titulo)}`,
    ve: { navegador: "Fondo de acento; el celular abre el sitio", maqueta: "Fondo oscuro; maqueta isométrica de portadas", editorial: "Papel con cintas de texto y botón" }[e.variante ?? "navegador"],
    anim: "Se escribe la dirección, aparece el logo y la firma",
    tr: "Círculo/cortina que tapa la escena anterior",
    sfx: "whoosh, pops, clicks de teclado, ding, pop",
  }),
};

let n = 0;
const filas = esc.map((e, i) => {
  const d = DESC[e.tipo](e);
  const numerada = ["catalogo", "avance", "reproductor", "ruta", "descargas", "diploma"].includes(e.tipo);
  if (numerada && !(e.tipo === "ruta" && esc[i - 1]?.tipo === "reproductor")) n++;
  const texto = d.texto ?? `${numerada ? String(n).padStart(2, "0") + " · " : ""}${e.etiqueta ?? ""} — ${cur(e.titulo)}`;
  return `| ${i + 1} | ${seg(ts[i].desde)}–${seg(ts[i].hasta)} | ${e.tipo} | ${texto} | ${d.ve} | ${d.anim} | ${d.tr} | ${d.sfx} |`;
});
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
