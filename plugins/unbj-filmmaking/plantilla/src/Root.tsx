import React from "react";
import { Composition } from "remotion";
import { Video, LINEA } from "./Video";
import { FORMATOS } from "./motor/formato";

export const FPS = 30;

// Una composición por formato: Vertical (9:16), Retrato (4:5), Cuadrado (1:1), Horizontal (16:9).
export const Root = () => (
  <>
    {Object.values(FORMATOS).map((f) => (
      <Composition key={f.id} id={f.id} component={Video} durationInFrames={Math.ceil(LINEA.total * FPS)} fps={FPS} width={f.w} height={f.h} />
    ))}
  </>
);
