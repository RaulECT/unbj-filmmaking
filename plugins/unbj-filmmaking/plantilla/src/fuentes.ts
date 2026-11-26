// ARCHIVO GENERADO por scripts/preparar.mjs a partir de marca.json → fuentes. No editar a mano.
import { loadFont as cargarTitulos } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as cargarTexto } from "@remotion/google-fonts/Inter";

export const { fontFamily: TITULOS } = cargarTitulos("normal", { weights: ["400", "600", "700", "900"], subsets: ["latin"] });
cargarTitulos("italic", { weights: ["400", "500", "700"], subsets: ["latin"] });
export const { fontFamily: TEXTO } = cargarTexto("normal", { weights: ["400", "600", "700", "900"], subsets: ["latin"] });
