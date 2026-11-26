// Arma el video a partir de video.json. No hace falta editar este archivo: todo se decide en video.json y marca.json.
import React from "react";
import { AbsoluteFill } from "remotion";
import VIDEO from "../video.json";
import { C } from "./motor/marca";
import { armar, LineaCtx } from "./motor/linea";
import { Escenario, useFormato } from "./motor/formato";
import { PaperBg, BigNums, World, Phone, Caption, BadgeV, Sounds } from "./motor/piezas";
import { ESCENAS } from "./escenas";
import { Ventana } from "./escenas/captura";

export const LINEA = armar((VIDEO as any).escenas, ESCENAS);

const Capas: React.FC = () => {
  const f = useFormato();
  const L = LINEA;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <PaperBg />
      <Escenario>
        <BigNums />
        <World>
          {L.items.map((it) => {
            const M = ESCENAS[it.e.tipo].Mundo;
            return M ? <M key={it.i} {...it} /> : null;
          })}
          <Phone />
        </World>
        {L.items.map((it) => {
          const K = ESCENAS[it.e.tipo].Capa;
          return K ? <K key={it.i} {...it} /> : null;
        })}
        {f !== "horizontal" && L.caps.map((c) => <Caption key={c.from} {...c} />)}
        {L.badges.map((b) => <BadgeV key={b.from} {...b} />)}
      </Escenario>
      <Ventana />
      {f === "horizontal" && L.caps.map((c) => <Caption key={c.from} {...c} />)}
      {L.items.map((it) => {
        const A = ESCENAS[it.e.tipo].Arriba;
        return A ? <A key={it.i} {...it} /> : null;
      })}
      <Sounds list={L.sfx} />
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => (
  <LineaCtx.Provider value={LINEA}>
    <Capas />
  </LineaCtx.Provider>
);
