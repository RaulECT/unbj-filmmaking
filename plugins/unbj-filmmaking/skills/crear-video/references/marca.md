# `marca.json`

```json
{
  "nombre": "Campus UNBJ",
  "logo": "logo.png",
  "logoBlanco": "logo-blanco.png",
  "sitio": "campus.unbj.app",
  "firma": { "izquierda": "UNBJ 2026", "derecha": "Un Latir por el Reino" },
  "fuentes": { "titulos": "Playfair Display", "texto": "Inter" },
  "colores": {
    "fondo": "#E8E6DF", "texto": "#1C1C1C", "acento": "#D85446", "secundario": "#2F6B54",
    "papel": "#F3F1EC", "crema": "#E9E7E1", "tarjeta": "#FFFFFF", "linea": "#C9C6BD",
    "tenue": "#6D6A64", "acentoOscuro": "#A93E35", "aviso": "#A66A20"
  }
}
```
- **Obligatorios:** `nombre`, `logo`, `fuentes`, y los colores `fondo`, `texto`, `acento`, `secundario`. Los demás colores se derivan solos (puedes darlos para afinar). `derivados` (ver el ejemplo de UNBJ) fija las caras de los bloques 3D.
- **fondo:** claro, tipo papel (el estilo es de fondo claro). **texto:** casi negro. **acento:** el color protagonista (cursivas, píldora del gancho, cierre). **secundario:** «hecho / completado» (checks, módulo listo); que contraste con el acento.
- **Contraste:** texto sobre fondo ≥ 7:1; blanco sobre acento ≥ 3:1 (títulos grandes). Si el acento es muy claro (amarillo, celeste), oscurécelo un poco y avisa.
- **Sacar colores de una imagen:** léela (Read) y propone 2 combinaciones; la persona elige.
- **Fuentes:** nombre exacto de Google Fonts. Títulos: serif con cursiva real y peso 700 (Playfair Display, DM Serif Display, Fraunces, Lora, Libre Caslon Display). Texto: sans con pesos 600 y 900 (Inter, DM Sans, Manrope, Plus Jakarta Sans). `preparar.mjs` avisa si el nombre no existe.
- **Logos:** PNG con fondo transparente; `logoBlanco` para el cierre de fondo de color/oscuro (si no hay, se usa el normal).
- `firma` (opcional): la línea final del cierre (dos textos separados por un punto de color).
