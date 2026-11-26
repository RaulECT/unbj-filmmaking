# Persona a cámara

1. Instala lo necesario una vez: `instalar.sh --camara` (Mac) o `instalar.ps1 -Camara` (Windows). Crea `~/.unbj-filmmaking/python`.
2. Prepara la grabación (puede tardar unos minutos; la primera vez descarga el modelo de transcripción, ~1,5 GB):
   - Mac: `~/.unbj-filmmaking/python/bin/python "$R/scripts/camara.py" "<carpeta>" "<grabación>" --formato vertical`
   - Windows: `%USERPROFILE%\.unbj-filmmaking\python\Scripts\python.exe "$R\scripts\camara.py" ...`
   Opciones: `--pausa 0.3` (pausas que se quitan; 0.4 = más calmado), `--quitar "12.3-14.1"` (tomas falsas, en tiempos del original), `--modelo small` (más rápido, menos preciso).
3. Deja `public/camara.mp4` (sin pausas, recortado a la cara) y `camara.json` (palabras), e imprime la transcripción con tiempos nuevos. Úsala para partir en tramos: cada escena `persona` lleva `desde` y `hasta` de esos tiempos. Corta en finales de frase.
4. Revisa con la persona la transcripción: si una palabra clave salió mal escrita (marcas, nombres), corrígela en `camara.json`.
5. `resaltar`: 1–3 palabras clave por tramo (salen en cursiva con el acento).
6. Si la grabación se usará en varios formatos, prepárala para el más vertical; el recorte se adapta solo (`objectFit: cover`).

Con voz, `render.mjs` normaliza la voz y baja la música cuando se habla (volumen de música 0.16 por defecto).
