// Catálogo de escenas. El "tipo" de cada escena en video.json es una de estas claves.
import { DefEscena } from "../motor/linea";
import { gancho, golpeBarrido, golpeCirculo } from "./ganchos";
import { plataforma } from "./plataforma";
import { catalogo } from "./catalogo";
import { avance } from "./avance";
import { reproductor, ruta } from "./lecciones";
import { descargas, diploma, cierre } from "./final";
import { persona } from "./persona";
import { captura } from "./captura";

export const ESCENAS: Record<string, DefEscena> = {
  gancho,
  plataforma,
  catalogo,
  "golpe-barrido": golpeBarrido,
  avance,
  reproductor,
  ruta,
  "golpe-circulo": golpeCirculo,
  descargas,
  diploma,
  persona,
  captura,
  cierre,
};
