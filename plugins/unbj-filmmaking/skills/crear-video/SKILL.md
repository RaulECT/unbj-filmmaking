---
name: crear-video
description: >-
  Crea videos promocionales con el estilo del reel de presentación de Campus UNBJ (cámara 3D isométrica, celular con pantallas reales, ganchos tipográficos, títulos palabra por palabra con una palabra en cursiva de color, números fantasma, confeti, cierres animados y efectos de sonido) para cualquier marca, en vertical 9:16, 4:5, 1:1 y horizontal 16:9, con o sin persona a cámara. Entrevista, arma el guion con tabla de escenas y copy para publicar, muestra un storyboard y una vista previa, y renderiza el MP4 final con música. Úsala cuando pidan "hazme un video/reel/promo", "un video como el de Campus UNBJ", "anuncia este curso/evento/producto en video", "un reel para lanzar…", aunque no la nombren. Pensada para personas que no programan: tú haces todo.
---

# Crear video con el estilo del reel de Campus UNBJ

La persona **no programa**. Tú instalas, escribes los archivos, corres los comandos y le muestras resultados. Nunca le pidas abrir una terminal ni editar código. Habla simple, en su idioma, y pregunta con la herramienta de preguntas con opciones (AskUserQuestion).

**Raíz del plugin:** dos carpetas arriba de esta skill (`<skill>/../..`). Ahí están `scripts/`, `plantilla/`, `musica/` y `ejemplos/`. En los comandos de abajo, `$R` es esa ruta (entre comillas: puede tener espacios).

**Cómo se hace un video:** todo el estilo ya está programado en `plantilla/`. Un video es solo dos archivos de datos en su carpeta (`~/Videos UNBJ Filmmaking/<nombre>/`): `marca.json` (colores, fuentes, logo) y `video.json` (la lista de escenas con sus textos e imágenes). **No edites `src/`.** Si algo no se puede con las escenas que hay, dilo y ofrece la escena más cercana.

## 0 — Preparación (una vez por computadora)
Comprueba `node -v` y `ffmpeg -version`. Si falta algo, explícale en una frase qué vas a instalar y por qué, pide permiso y corre:
- Mac: `bash "$R/scripts/instalar.sh"` (agrega `--camara` si el video lleva persona a cámara).
- Windows: `powershell -ExecutionPolicy Bypass -File "$R\scripts\instalar.ps1"` (agrega `-Camara`).
La primera vez tarda unos minutos (motor de video en `~/.unbj-filmmaking/`). Si algo falla, ve a `references/solucion-problemas.md`.

## 1 — Entrevista (por rondas, 3–4 preguntas por ronda; no avances con dudas abiertas)
1. **Qué y para quién:** qué se anuncia, objetivo (inscribirse, asistir, comprar, conocer), público, CTA y sitio o handle.
2. **Marca:** nombre, logo (que lo arrastre al chat; ideal PNG sin fondo, más uno blanco para fondos oscuros), 2–4 colores (o una imagen de su marca para sacarlos) y fuentes. Si no tiene fuentes, propón 2 parejas de Google Fonts (una serif con cursiva para títulos + una sans para texto). Detalle y cómo derivar colores: `references/marca.md`.
3. **Formatos:** vertical 9:16 (Reels, TikTok, Shorts), 4:5 y 1:1 (feed), horizontal 16:9 (YouTube, pantallas).
4. **Persona a cámara:** ¿hay grabación? Si sí, que la pase (MP4/MOV). Ver `references/camara.md`.
5. **Contenido:** mensajes (uno por escena), cifras reales (no inventes: si faltan, pregunta), capturas de pantalla del producto o sitio (de celular, ~1170 px de ancho), portadas o fotos, imagen final (diploma, premio, boleto…).
6. **Música:** una de `musica/` (ver `musica/LICENCIAS.md`, requiere crédito al publicar) o una propia con derechos, o solo efectos.

## 2 — Guion (lo aprueba antes de renderizar)
1. Elige escenas y orden con `references/escenas.md` (qué hace cada una, qué pide y estructuras recomendadas). Respeta el ritmo: gancho al inicio, un golpe a mitad, cierre al final, 20–40 s.
2. Crea la carpeta: `node "$R/scripts/preparar.mjs" "<nombre del video>"`. Copia ahí las imágenes que te pasó (a `public/`, en subcarpetas `pantallas/`, `portadas/`) y escribe `marca.json` y `video.json` (formato en `references/escenas.md` y `references/marca.md`; ejemplo completo en `$R/ejemplos/campus-unbj/`). Vuelve a correr `preparar.mjs` con `--carpeta <ruta>` para cargar las fuentes.
3. `node "$R/scripts/validar.mjs" "<carpeta>"` — corrige todo ❌ y explica los ⚠️ a la persona.
4. `node "$R/scripts/guion.mjs" "<carpeta>"` → `guion.md`. Muéstrale la tabla de escenas y el copy para publicar (redáctalo tú en `video.json → publicacion`: texto, hashtags y segundo de la portada; `references/guion.md`).
5. **Storyboard:** `node "$R/scripts/storyboard.mjs" "<carpeta>" [formato]` y muéstrale `storyboard/hoja.jpg` (léela con Read para que la vea en el chat).
6. Pide aprobación o cambios. Los cambios son ediciones de `video.json` / `marca.json`; repite 3–5.

## 3 — Vista previa
`node "$R/scripts/render.mjs" "<carpeta>" --vista-previa` (≈1 min, media resolución, primer formato). Ábrela para la persona (`open` en Mac, `start ""` en Windows) y pide comentarios. Revisa tú también 4–5 fotogramas (ffmpeg → imagen → Read): textos cortados, contraste, zonas seguras.

## 4 — Render final
`node "$R/scripts/render.mjs" "<carpeta>"` renderiza todos los formatos de `video.json` en `final/`, con música mezclada y volumen a -14 LUFS. Abre la carpeta y entrega:
- rutas de los MP4,
- el copy para publicar (con el crédito de música si aplica),
- qué revisaste y qué no.
No publiques nada en redes ni subas archivos a ningún servicio sin que la persona lo pida.

## Reglas
- Una idea por escena; títulos ≤ 30 letras con **una** palabra en `*cursiva*`.
- No inventes cifras, testimonios ni logos de terceros.
- Texto e imágenes reales de la persona; si falta una pantalla, usa otra escena en vez de inventar una.
- El ejemplo de UNBJ (`$R/ejemplos/campus-unbj/`) es la referencia de nivel: `node "$R/scripts/preparar.mjs" "Ejemplo" --ejemplo campus-unbj` lo reproduce idéntico al reel original.
- Remotion es gratis para personas y organizaciones de hasta 3 personas; si es una empresa más grande, avísale que necesita licencia (remotion.dev/license).

## Referencias
| Archivo | Cuándo |
| --- | --- |
| `references/escenas.md` | Elegir escenas y escribir `video.json` |
| `references/marca.md` | Escribir `marca.json` |
| `references/guion.md` | Guion, copy para publicar y revisión |
| `references/formatos.md` | Qué cambia en 4:5, 1:1 y 16:9 |
| `references/camara.md` | Videos con persona a cámara |
| `references/solucion-problemas.md` | Errores de instalación o render |
