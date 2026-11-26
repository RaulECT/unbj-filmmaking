import React from "react";
import { AbsoluteFill, Composition, Img, staticFile } from "remotion";
import { Video, LINEA } from "./Video";
import { FORMATOS } from "./motor/formato";

export const FPS = 30;

// Hoja del storyboard (scripts/storyboard.mjs): los fotogramas en cuadrícula, sin depender de ffmpeg.
type HojaProps = { imgs: string[]; w: number; h: number; cols: number };
const Hoja: React.FC<HojaProps> = ({ imgs, w, h, cols }) => (
  <AbsoluteFill style={{ background: "#fff", display: "flex", flexWrap: "wrap", alignContent: "flex-start" }}>
    {imgs.map((f) => <Img key={f} src={staticFile(f)} style={{ width: w, height: h, display: "block" }} />)}
  </AbsoluteFill>
);

// Una composición por formato: Vertical (9:16), Retrato (4:5), Cuadrado (1:1), Horizontal (16:9).
export const Root = () => (
  <>
    {Object.values(FORMATOS).map((f) => (
      <Composition key={f.id} id={f.id} component={Video} durationInFrames={Math.ceil(LINEA.total * FPS)} fps={FPS} width={f.w} height={f.h} />
    ))}
    <Composition id="Hoja" component={Hoja as any} durationInFrames={1} fps={FPS} width={1080} height={1920}
      defaultProps={{ imgs: [], w: 540, h: 960, cols: 6 } as HojaProps}
      calculateMetadata={({ props }: { props: HojaProps }) => ({ width: props.w * props.cols, height: props.h * Math.max(1, Math.ceil(props.imgs.length / props.cols)) })} />
  </>
);
