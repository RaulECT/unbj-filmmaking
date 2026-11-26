# Solución de problemas

| Síntoma | Causa probable | Qué hacer |
| --- | --- | --- |
| «command not found: node» | Se usó `node` en lugar del Node portátil | Usa `~/.unbj-filmmaking/node/bin/node` (Mac) o `%USERPROFILE%\.unbj-filmmaking\node\node.exe` (Windows) |
| La descarga «no coincide con su firma SHA-256» | Descarga cortada o proxy | Vuelve a correr el instalador |
| Se quiere desinstalar | — | Borra `~/.unbj-filmmaking` (y `~/Videos UNBJ Filmmaking` si ya no quiere los videos) |
| `npm install` falla | Sin internet o proxy | Reintenta; si persiste, muestra el error a la persona |
| «La fuente X no está en Google Fonts» | Nombre mal escrito | Búscalo exacto en fonts.google.com |
| Render: `Cannot find module` | `node_modules` del video roto | `node "$R/scripts/preparar.mjs" x --carpeta "<carpeta>"` y, si sigue, borra `~/.unbj-filmmaking/motor` y repite |
| Una imagen sale negra o falta | Ruta mal escrita en `video.json` | `validar.mjs` lo dice; las rutas son relativas a `public/` |
| Texto cortado | Título o palabra demasiado larga | Acórtalo (≤ 30 letras) |
| Captura borrosa | Captura de menos de 780 px de ancho | Pide una captura de celular a tamaño completo |
| Error al leer la grabación en `camara.py` | Formato poco común | Exporta la grabación como MP4 (H.264) desde el celular o la cámara |
| No detecta la cara | Poca luz o perfil | `camara.py` encuadra al centro y avisa; edita `cara` en `camara.json` (0–1) si hace falta |
| El render tarda mucho | Varios formatos en alta | Usa `--vista-previa` mientras se aprueba; renderiza solo los formatos necesarios |
