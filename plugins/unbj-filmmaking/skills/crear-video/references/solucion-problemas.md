# Solución de problemas

| Síntoma | Causa probable | Qué hacer |
| --- | --- | --- |
| `node` o `ffmpeg` no se encuentra después de instalar (Windows) | La terminal no recargó el PATH | Cierra y vuelve a abrir Claude, o usa la ruta completa |
| `npm install` falla | Sin internet o proxy | Reintenta; si persiste, muestra el error a la persona |
| «La fuente X no está en Google Fonts» | Nombre mal escrito | Búscalo exacto en fonts.google.com |
| Render: `Cannot find module` | `node_modules` del video roto | `node "$R/scripts/preparar.mjs" x --carpeta "<carpeta>"` y, si sigue, borra `~/.unbj-filmmaking/motor` y repite |
| Una imagen sale negra o falta | Ruta mal escrita en `video.json` | `validar.mjs` lo dice; las rutas son relativas a `public/` |
| Texto cortado | Título o palabra demasiado larga | Acórtalo (≤ 30 letras) |
| Captura borrosa | Captura de menos de 780 px de ancho | Pide una captura de celular a tamaño completo |
| Error de faster-whisper con `metadata_errors` | Versión de `av` | Ya resuelto en `camara.py` (lee el audio con numpy); actualiza el plugin |
| No detecta la cara | OpenCV incompleto o poca luz | `camara.py` recorta al centro y avisa; está bien para tomas centradas |
| El render tarda mucho | Varios formatos en alta | Usa `--vista-previa` mientras se aprueba; renderiza solo los formatos necesarios |
