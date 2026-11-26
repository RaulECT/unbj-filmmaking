# Escenas y `video.json`

```json
{
  "titulo": "Nombre del video (se usa en los archivos)",
  "formatos": ["vertical"],
  "musica": "Life-of-Riley.mp3",
  "escenas": [ { "tipo": "gancho", "...": "..." } ],
  "publicacion": { "texto": "…", "hashtags": ["#…"], "portada": 3.2 }
}
```
- `musica`: nombre de una pista de `musica/`, ruta de un archivo propio (relativa a la carpeta del video), o `null`.
- Las imágenes se escriben relativas a `public/` (p. ej. `"pantallas/inicio.png"`).
- `pantalla` = captura de celular `{ "archivo": "…" }`; `validar.mjs` completa `alto` solo. Las capturas pueden ser largas (página completa): la escena hace scroll.
- En los títulos, `*palabra*` sale en cursiva con el color de acento.
- Las duraciones son fijas por escena (son el ritmo del original). El video dura lo que sumen.
- Las escenas marcadas con № llevan número de sección automático (01, 02…) en la etiqueta y un número gigante al fondo.

| Tipo | Dura | № | Qué se ve | Campos |
| --- | --- | --- | --- | --- |
| `gancho` | 2,7 s | | Tres golpes: pregunta → «prefijo [palabras que giran]» → remate relleno + logo; la cámara atraviesa el texto | `pregunta` [3: mayúsculas, *cursiva*, cierre], `prefijo`, `palabras` (2–4, MAYÚSCULAS cortas), `remate` (≤ 9 letras), `subremate` |
| `plataforma` | 4,9 s | | Celular cae sobre una losa isométrica con 6 portadas en bloques; la cámara gira a frontal | `etiqueta`, `titulo`, `insignia`?, `pantalla`, `portadas` [6 × {`archivo`, `etiqueta`}] (16:10) |
| `catalogo` | 4,4 s | № | Celular a la izquierda; chips de categorías a la derecha; se selecciona uno; opcional toque + hoja inferior | `etiqueta`, `titulo`, `pantalla`, `categorias` (≤ 6, ≤ 16 letras), `seleccion` (índice), `toque`? {x, y}, `hoja`? {archivo, arriba} |
| `golpe-barrido` | 0,75 s | | Panel de acento que barre con una pregunta | `linea1` (MAYÚSCULAS), `linea2` (cursiva) |
| `avance` | 3,8 s | № | Hasta 3 cifras que suben + celular; opcional acercamiento macro a un botón | `etiqueta`, `titulo`, `pantalla`, `cifras` [{`tipo`:"numero", `valor`, `prefijo`?, `sufijo`?, `texto`} · {`tipo`:"duracion", `minutos`, `texto`} · {`tipo`:"porcentaje", `valor`, `texto`}], `toque`? |
| `reproductor` | 2,85 s | № | Un video sale del celular y se agranda con controles | `etiqueta`, `titulo`, `pantalla`, `portada`, `chip`, `desde` ("4:12"), `total` ("22:00") |
| `ruta` | 2,6 s | № (sigue el de `reproductor` si va después) | Escalera isométrica de 3 módulos; un avatar salta al actual | `etiqueta`, `titulo`, `modulos` [3 × {`texto`, `estado`: hecho/actual/siguiente}], `iniciales`, `aquiVas` |
| `golpe-circulo` | 0,8 s | | Círculo de tinta con una palabra tachada | `linea1`, `linea2`, `tachar` (true) |
| `descargas` | 3,0 s | № | Tarjetas «sin conexión» y descarga que llega a 100% | `etiqueta`, `titulo`, `pantalla`, `aviso` {titulo, texto}, `archivo` {portada, titulo, detalle}, `listo` |
| `diploma` | 3,4 s | № | Confeti; una imagen horizontal (diploma, boleto, premio) se levanta con insignia | `etiqueta`, `titulo`, `imagen`, `proporcion`? (alto/ancho), `pantalla`? |
| `persona` | la del tramo | | Persona a cámara a cuadro completo con subtítulos palabra por palabra | `desde`, `hasta` (s en camara.mp4), `resaltar` [palabras], `etiqueta`?, `subtitulos` (true) |
| `cierre` | 3,2 s | | `variante`: **navegador** (fondo de acento, el celular abre el sitio), **maqueta** (fondo oscuro, portadas en maqueta isométrica), **editorial** (papel, tres líneas grandes, cintas y botón) | `variante`, `etiqueta`, `titulo` ("Inscríbete *gratis*"), `sitio`?, `portadas` (4 navegador / 6 maqueta), `pantalla` (navegador), `lineas` [3] y `cinta` [palabras] (editorial) |

**Coordenadas de `toque`:** en puntos de diseño de la captura a 390 de ancho (x de 0 a 390; y desde arriba de la captura). Calcula: `x = px * 390 / ancho_px`, `y = py * 390 / ancho_px`.

## Estructuras recomendadas
- **Producto o plataforma (como el original, ~32 s):** gancho → plataforma → catalogo → golpe-barrido → avance → reproductor → ruta → golpe-circulo → descargas → diploma → cierre.
- **Anuncio corto (~15 s):** gancho → catalogo (o avance) → diploma → cierre.
- **Evento:** gancho → plataforma (portadas = talleres/ponentes) → avance (fecha, cupo, horas) → golpe-circulo → cierre editorial.
- **Con persona (~30–45 s):** gancho → persona → catalogo → persona → avance → cierre.

Reglas: gancho siempre primero; cierre siempre último; un golpe cada ~10 s; no repetir la misma escena seguida; las escenas con celular (`plataforma`, `catalogo`, `avance`, `reproductor`, `descargas`) necesitan capturas; sin capturas, arma el video con `gancho`, golpes, `persona`, `diploma` (con imagen) y `cierre` editorial o maqueta.
