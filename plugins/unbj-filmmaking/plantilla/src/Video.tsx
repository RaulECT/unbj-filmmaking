// Arma el video a partir de video.json. No hace falta editar este archivo: todo se decide en video.json y marca.json.
import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useVideoConfig } from "remotion";
import VIDEO from "../video.json";
import { C } from "./motor/marca";
import { armar, LineaCtx } from "./motor/linea";
import { Escenario, useFormato } from "./motor/formato";
import { PaperBg, BigNums, World, Phone, Caption, BadgeV, Sounds } from "./motor/piezas";
import { ESCENAS } from "./escenas";
import { Ventana } from "./escenas/captura";

export const LINEA = armar((VIDEO as any).escenas, ESCENAS);

// Música (render.mjs la copia a public/musica.<ext>): entra y sale suave y baja (ducking) en las escenas con persona a cámara.
const MUSICA = (VIDEO as any).musica ? `musica${String((VIDEO as any).musica).match(/\.[a-z0-9]+$/i)?.[0]?.toLowerCase() ?? ".mp3"}` : null;
const Musica: React.FC = () => {
  const { fps } = useVideoConfig();
  const L = LINEA;
  const voz = L.items.filter((it) => it.e.tipo === "persona");
  const base = (VIDEO as any).volumenMusica ?? (voz.length ? 0.12 : 0.47);
  if (!MUSICA) return null;
  return (
    <Audio
      src={staticFile(MUSICA)}
      volume={(f) => {
        const t = f / fps;
        const fade = interpolate(t, [0, 0.5, L.total - 1.6, L.total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const duck = voz.reduce((k, it) => Math.min(k, 1 - 0.7 * interpolate(t, [it.o - 0.3, it.o, it.fin, it.fin + 0.4], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })), 1);
        return base * fade * duck;
      }}
    />
  );
};

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
      <Musica />
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => (
  <LineaCtx.Provider value={LINEA}>
    <Capas />
  </LineaCtx.Provider>
);
