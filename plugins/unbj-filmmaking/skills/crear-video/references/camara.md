# Persona a cámara

1. Instala lo necesario una vez: `instalar.sh --camara` (Mac) o `instalar.ps1 -Camara` (Windows). Crea `~/.unbj-filmmaking/python`.
2. Prepara la grabación (la primera vez descarga el modelo de transcripción, ~1,5 GB; `--modelo small` pesa ~0,5 GB):
   - Mac: `~/.unbj-filmmaking/python/bin/python "$R/scripts/camara.py" "<carpeta>" "<grabación>"`
   - Windows: `%USERPROFILE%\.unbj-filmmaking\python\Scripts\python.exe "$R\scripts\camara.py" ...`
   Opciones: `--pausa 0.3` (pausas que se quitan; 0.4 = más calmado), `--quitar "12.3-14.1"` (tomas falsas, en tiempos de la grabación), `--modelo small`.
3. Copia la grabación a `public/` **sin recodificarla** y escribe `camara.json`: palabras (tiempos ya sin pausas), tramos con voz (tiempos de la grabación) y la posición de la cara. Remotion reproduce esos tramos directo de la grabación y encuadra la cara en cada formato. Imprime la transcripción con tiempos sin pausas: úsala para partir en escenas `persona` (`desde` y `hasta`). Corta en finales de frase.
4. Revisa con la persona la transcripción: si una palabra clave salió mal escrita (marcas, nombres), corrígela en `camara.json`.
5. `resaltar`: 1–3 palabras clave por tramo (salen en cursiva con el acento).

Con voz, la música baja sola durante las escenas `persona` (ducking) y `render.mjs` normaliza todo a -14 LUFS en dos pasadas.
