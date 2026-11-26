# UNBJ Filmmaking

Crea videos con el mismo estilo del **reel de presentación de Campus UNBJ**, para cualquier marca, solo conversando con Claude. Incluye la cámara 3D, el celular con pantallas reales, los ganchos tipográficos, los títulos animados, el confeti, los cierres y el sonido.

- Formatos: vertical 9:16 (Reels, TikTok, Shorts), 4:5, 1:1 y horizontal 16:9.
- Con o sin persona a cámara, con subtítulos automáticos.
- Antes de renderizar te entrega el **guion** (tabla de escenas y texto para publicar), un **storyboard** y una **vista previa**.

El resultado de referencia está en `plugins/unbj-filmmaking/ejemplos/campus-unbj/reel-original.mp4`.

## Instalación (una vez)

Necesitas la **app de escritorio de Claude** (Mac o Windows) y entrar a la pestaña **Code**. El chat normal no puede instalar programas ni renderizar video.

1. En la pestaña **Code**, abre cualquier carpeta (por ejemplo, Documentos).
2. Escribe en el chat:
   ```
   /plugin marketplace add RaulECT/unbj-filmmaking
   ```
3. Luego:
   ```
   /plugin install unbj-filmmaking@unbj-filmmaking
   ```
4. Cierra y vuelve a abrir la app.
5. Pídele: **«Prepara todo para hacer videos»**. Claude instalará lo que falte (Node.js y ffmpeg; Python si usarás persona a cámara). Te avisará antes, puede pedir tu contraseña de la computadora y te pedirá permiso para correr comandos: acéptalos.

**Actualizar:** `/plugin marketplace update unbj-filmmaking` y después `/plugin update unbj-filmmaking@unbj-filmmaking`.

## Requisitos previos (no los instala el plugin)

| Requisito | Notas |
| --- | --- |
| App de escritorio de Claude con la pestaña **Code** | Y una cuenta con acceso a Claude Code |
| Internet | Se descargan Node.js, ffmpeg, el motor de video (~300 MB), el navegador de render y las fuentes |
| Contraseña de administrador de la computadora | Homebrew (Mac) y winget (Windows) la piden |
| Windows: **winget** (App Installer, de Microsoft Store) | Viene en Windows 10/11 recientes |
| Mac: herramientas de línea de comandos de Xcode | Homebrew abre una ventana para instalarlas: hay que aceptar |
| Espacio libre: ~1 GB (~2,5 GB con persona a cámara) | Con el disco casi lleno el render puede fallar |

El plugin sí instala: Homebrew (Mac), **Node.js**, **ffmpeg**, el motor de video y, si usarás persona a cámara, Python con la transcripción.

## Uso

Solo pide el video, por ejemplo:

> Hazme un reel para anunciar el curso de Liderazgo, con el estilo del video de Campus UNBJ.

Claude te hará preguntas (marca, mensajes, imágenes, música), te mostrará el guion y el storyboard, y cuando apruebes hará la vista previa y el video final. Los videos quedan en la carpeta **Videos UNBJ Filmmaking** de tu usuario.

Puedes arrastrar al chat tu logo, capturas de pantalla, fotos, una grabación tuya o tu música.

## Qué incluye

| Carpeta | Contenido |
| --- | --- |
| `plugins/unbj-filmmaking/skills/crear-video/` | La guía que sigue Claude |
| `plugins/unbj-filmmaking/plantilla/` | El estilo programado en Remotion (12 escenas) |
| `plugins/unbj-filmmaking/scripts/` | Instalar, preparar, validar, guion, storyboard, render, cámara |
| `plugins/unbj-filmmaking/musica/` | 5 pistas de Kevin MacLeod (CC BY 4.0: dar crédito al publicar) |
| `plugins/unbj-filmmaking/ejemplos/campus-unbj/` | El reel original como datos: se reproduce idéntico |

## Licencias
- Remotion es gratis para personas y organizaciones de hasta 3 personas; empresas más grandes necesitan licencia: https://remotion.dev/license
- Música: ver `plugins/unbj-filmmaking/musica/LICENCIAS.md`.
- Los logos, pantallas y portadas de `ejemplos/campus-unbj/` son de UNBJ y se incluyen solo como ejemplo.
