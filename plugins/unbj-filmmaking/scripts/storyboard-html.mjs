// Storyboard en HTML (una sola página, imágenes incluidas): portada con resumen, índice por secciones y, por escena,
// el fotograma con Pantalla / Animación / Sonido y el texto en pantalla. Se publica como artifact o se abre en el navegador.
// Uso: node storyboard-html.mjs <carpeta del video> [formato]   (storyboard.mjs lo llama solo al terminar)
import fs from "node:fs";
import path from "node:path";
import { proyecto, leer, tiempos, seg, FORMATOS } from "./comun.mjs";
import { filas } from "./descripciones.mjs";

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** *palabra* → cursiva de acento */
const em = (s) => esc(s).replace(/\*([^*]+)\*/g, "<em>$1</em>").replace(/_([^_]+)_/g, "<em>$1</em>");
const mmss = (n) => `${Math.floor(n / 60)}:${String(Math.round(n % 60)).padStart(2, "0")}`;

const NOMBRE = {
  gancho: "Gancho", plataforma: "Plataforma", catalogo: "Catálogo", "golpe-barrido": "Golpe", avance: "Avance", reproductor: "Reproductor",
  ruta: "Ruta", "golpe-circulo": "Golpe", descargas: "Descargas", diploma: "Diploma", persona: "Persona a cámara", captura: "Captura", cierre: "Cierre",
};

export function storyboardHtml(dir, formato = "vertical") {
  const v = leer(path.join(dir, "video.json"));
  const m = fs.existsSync(path.join(dir, "marca.json")) ? leer(path.join(dir, "marca.json")) : { nombre: "", colores: {}, fuentes: {} };
  const ts = tiempos(v.escenas);
  const d = filas(v.escenas);
  const sb = path.join(dir, "storyboard");
  const fotos = fs.existsSync(sb) ? fs.readdirSync(sb).filter((f) => /^\d\d-.*\.jpg$/.test(f)).sort() : [];
  // borrador: sube en cada storyboard nuevo
  const cont = path.join(dir, ".borrador");
  const borrador = (fs.existsSync(cont) ? Number(fs.readFileSync(cont, "utf8")) || 0 : 0) + 1;
  fs.writeFileSync(cont, String(borrador));

  // secciones: gancho / cada número / cierre
  const secciones = [];
  v.escenas.forEach((e, i) => {
    const clave = e.tipo === "gancho" ? "0" : e.tipo === "cierre" ? "fin" : d[i].seccion ?? null;
    const nombre = e.tipo === "gancho" ? "Gancho" : e.tipo === "cierre" ? "Cierre" : e.etiqueta ? e.etiqueta.charAt(0) + e.etiqueta.slice(1).toLowerCase() : NOMBRE[e.tipo];
    const ultima = secciones[secciones.length - 1];
    if (clave && (!ultima || ultima.clave !== clave)) secciones.push({ clave, nombre: (clave !== "0" && clave !== "fin" ? `${Number(clave)} · ` : "") + nombre, items: [i] });
    else if (ultima) ultima.items.push(i);
    else secciones.push({ clave: "x", nombre: NOMBRE[e.tipo], items: [i] });
  });

  const c = m.colores ?? {};
  const acento = c.acento ?? "#D85446";
  const tit = m.fuentes?.titulos ?? "Playfair Display";
  const txt = m.fuentes?.texto ?? "Inter";
  const gf = (f, w) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:${w}`;
  const total = ts.at(-1)?.hasta ?? 0;
  const pub = v.publicacion ?? {};

  const escena = (i) => {
    const e = v.escenas[i];
    const f = fotos[i] ? `data:image/jpeg;base64,${fs.readFileSync(path.join(sb, fotos[i])).toString("base64")}` : null;
    const num = `${String(i + 1).padStart(2, "0")}`;
    const titulo = e.titulo ? em(e.titulo) : e.tipo === "gancho" ? "Gancho" : esc(NOMBRE[e.tipo]);
    return `
    <article class="escena" id="e${i + 1}">
      ${f ? `<figure><img src="${f}" alt="Fotograma de la escena ${i + 1}" loading="lazy"></figure>` : ""}
      <h3><span class="n">${num}</span> ${titulo} <span class="t">${mmss(ts[i].desde)} – ${mmss(ts[i].hasta)}</span></h3>
      <dl>
        <dt>Pantalla</dt><dd>${em(d[i].ve)}</dd>
        <dt>Animación</dt><dd>${em(d[i].anim)}${d[i].tr && d[i].tr !== "—" ? `. <span class="sub">Transición: ${em(d[i].tr)}.</span>` : ""}</dd>
        <dt>Sonido</dt><dd>${em(d[i].sfx)}</dd>
      </dl>
      <div class="caja"><div class="eti">Texto en pantalla</div><p>${em(d[i].texto)}</p></div>
    </article>`;
  };

  const cambios = v.cambios?.length
    ? `<aside class="cambios"><h2>Borrador ${borrador} · qué cambió</h2><ul>${v.cambios.map((x) => `<li>${em(x)}</li>`).join("")}</ul></aside>`
    : "";
  const fondo = c.fondo ?? "#F3F1EC", texto = c.texto ?? "#1C1C1C", linea = c.linea ?? "#D8D4CB", tenue = c.tenue ?? "#6D6A64";
  const oscuro = "--fondo:#1C1B1A;--sup:#262422;--linea:#3A3734;--texto:#EDEAE4;--tenue:#A8A39B;color-scheme:dark";
  // fragmento sin <html>/<head>/<body>: lo envuelve la publicación de artifacts y el navegador lo abre igual
  const html = `<title>Storyboard ${esc(String(v.titulo ?? m.nombre ?? "").split(/\s+—\s+/).pop())}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${gf(tit, "ital,wght@0,600;0,700;1,700")}&${gf(txt, "wght@400;600;700")}&display=swap">
<style>
/* página de lectura: columna de 980px, fotograma grande y ficha por escena */
:root{--fondo:${fondo};--sup:#FFFFFF;--linea:${linea};--texto:${texto};--tenue:${tenue};--acento:${acento};--tit:"${tit}",Georgia,serif;--txt:"${txt}",system-ui,sans-serif}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){${oscuro}}}
:root[data-theme="dark"]{${oscuro}}
*{box-sizing:border-box}body{margin:0;background:var(--fondo);color:var(--texto);font:17px/1.6 var(--txt);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
main{max-width:980px;margin:0 auto;padding-block:48px 80px}
.eyebrow{font-weight:700;font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:var(--tenue)}
h1{font:700 clamp(34px,6vw,58px)/1.08 var(--tit);margin:14px 0 16px;letter-spacing:-.01em}
em{font-style:italic;color:var(--acento)}h1 em,h3 em{font-family:var(--tit)}
.intro{color:var(--tenue);font-size:19px;max-width:760px}
.chips{display:flex;flex-wrap:wrap;gap:10px;margin:22px 0 28px}.chips span{border:1px solid var(--linea);border-radius:99px;padding:7px 16px;font-size:15px}
.cambios{border-left:4px solid var(--acento);background:var(--sup);padding:18px 24px;border-radius:0 12px 12px 0;margin-bottom:28px}
.cambios h2{font:700 18px var(--txt);color:var(--acento);margin:0 0 6px}.cambios ul{margin:0;padding-left:20px}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:10;background:var(--fondo)}
nav{position:sticky;top:env(safe-area-inset-top,0px);z-index:2;background:var(--fondo);display:flex;flex-wrap:wrap;gap:6px 22px;padding:14px 0;border-bottom:1px solid var(--linea);margin-bottom:12px}
nav a{color:var(--texto);text-decoration:none;font-size:16px}nav a:hover{color:var(--acento)}
section{padding-top:28px;border-top:1px solid var(--linea);margin-top:28px}
h2.sec{font:700 clamp(30px,5vw,44px) var(--tit);margin:0 0 20px}h2.sec small{font:400 18px var(--txt);color:var(--tenue);margin-left:10px}
figure{margin:0 0 18px;border-radius:14px;overflow:hidden;border:1px solid var(--linea);background:#000}figure img{display:block;width:100%;height:auto${formato === "vertical" || formato === "retrato" ? ";max-height:78vh;object-fit:contain" : ""}}
.escena{margin-bottom:44px}h3{font:600 22px var(--txt);margin:0 0 12px;display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 12px}
h3 .n{font:700 26px var(--tit)}h3 .t{color:var(--tenue);font-weight:400;font-size:17px}
dl{display:grid;grid-template-columns:120px 1fr;gap:8px 18px;margin:0 0 16px}dt{font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--tenue);padding-top:3px}dd{margin:0}
.sub{color:var(--tenue)}
.caja{border:1px solid var(--linea);background:var(--sup);border-radius:12px;padding:14px 20px}.caja .eti{font-weight:700;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--acento)}.caja p{margin:4px 0 0}
footer{margin-top:40px;padding-top:20px;border-top:1px solid var(--linea);color:var(--tenue);font-size:15px}
@media (max-width:600px){dl{grid-template-columns:1fr}dt{padding-top:8px}}
h1,h2,h3{text-wrap:balance}dd,.caja p{min-width:0}
</style><main>
<div class="eyebrow">Storyboard · ${esc(v.titulo ?? "")} · Borrador ${borrador}</div>
<h1>${em(v.titulo ?? m.nombre ?? "Video")}</h1>
<p class="intro">Cada fotograma es cómo se verá la escena ya animada; debajo está qué pasa en pantalla, la animación y el sonido. Pide cualquier cambio por número de escena antes de renderizar.</p>
<div class="chips">
<span><b>~${mmss(total)}</b> min</span><span><b>${v.escenas.length}</b> escenas en ${secciones.length} partes</span>
<span>${esc((v.formatos ?? ["vertical"]).join(" · "))}</span><span>${esc(tit)} + ${esc(txt)} · acento <b>${esc(acento)}</b></span>
<span>Música: ${esc(v.musica ? path.basename(v.musica, path.extname(v.musica)).replace(/-/g, " ") : "solo efectos")}</span>
</div>
${cambios}
<nav>${secciones.map((s, k) => `<a href="#s${k}">${esc(s.nombre)}</a>`).join("")}</nav>
${secciones
  .map((s, k) => `<section id="s${k}"><h2 class="sec">${esc(s.nombre.replace(/^\d+ · /, ""))}<small>${mmss(ts[s.items[0]].desde)} – ${mmss(ts[s.items.at(-1)].hasta)}</small></h2>${s.items.map(escena).join("")}</section>`)
  .join("")}
<footer>${pub.texto ? `<p><b>Texto para publicar:</b> ${esc(pub.texto)} ${esc((pub.hashtags ?? []).join(" "))}</p>` : ""}<p>Fotogramas en formato ${esc(formato)} (${FORMATOS[formato]}). Generado por UNBJ Filmmaking.</p></footer>
</main>`;
  const out = path.join(dir, "storyboard", "storyboard.html");
  fs.writeFileSync(out, html);
  return { out, borrador };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const dir = proyecto(process.argv[2]);
  const r = storyboardHtml(dir, process.argv[3] ?? "vertical");
  console.log(`✅ ${r.out} (borrador ${r.borrador})`);
}
