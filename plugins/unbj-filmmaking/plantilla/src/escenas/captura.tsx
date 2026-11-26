// Captura de computadora (tutoriales): una ventana con la captura, acercamiento suave al foco, cursor que llega y hace
// clic, texto que se teclea, zonas desenfocadas o tapadas, burbujas de chat recreadas y video dentro de la ventana.
// Las escenas "captura" seguidas comparten la misma ventana: la imagen cambia con un fundido y el zoom viaja de un foco al siguiente.
// Coordenadas en píxeles de la imagen original.
// e.imagen · e.recorte {x,y,w,h} · e.foco? {x,y,w,h} · e.zoom? · e.clic? {x,y,at} · e.escribir? {x,y,texto,at,tam,color,fondo}
// e.ocultar? [{x,y,w,h,modo:"desenfoque"|"tapar",color}] · e.chat? {zona:{x,y,w,h}, tam, mensajes:[{de:"tu"|"claude", texto}]}
// e.video? {archivo,x,y,w,h} · e.etiqueta · e.titulo · e.texto · e.dur (4,5 s)
import React from "react";
import { Img, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import { C, BODY, sombra } from "../motor/marca";
import { useT, ramp, easeIO, glide, pop, lerp } from "../motor/tiempo";
import { useLinea, DefEscena, VShot } from "../motor/linea";
import { useFormato, Formato } from "../motor/formato";
import { img } from "../motor/piezas";

const MARCO: Record<Formato, { x: number; y: number; w: number; h: number }> = {
  horizontal: { x: 770, y: 175, w: 1090, h: 728 },
  vertical: { x: 40, y: 620, w: 1000, h: 668 },
  retrato: { x: 70, y: 420, w: 940, h: 628 },
  cuadrado: { x: 150, y: 340, w: 780, h: 520 },
};
type R = { x: number; y: number; w: number; h: number };
type Cam = { cx: number; cy: number; s: number };
const recorteDe = (e: any): R => e.recorte ?? { x: 0, y: 0, w: e.ancho ?? 2880, h: e.alto ?? 1800 };
const llegaZoom = (e: any) => e.zoomAt ?? 0.35;
const clicAt = (e: any) => e.clic?.at ?? 2.0;

function enfoque(e: any, W: number, H: number): Cam {
  const r = recorteDe(e);
  if (!e.foco) return { cx: 0.5, cy: 0.5, s: 1 };
  const k0 = Math.max(W / r.w, H / r.h);
  const f = e.foco;
  const s = e.zoom ?? Math.max(1, Math.min(2.6, (W * 0.7) / (f.w * k0), (H * 0.7) / (f.h * k0)));
  return { cx: (f.x + f.w / 2 - r.x) / r.w, cy: (f.y + f.h / 2 - r.y) / r.h, s };
}

/** cámara de la ventana en el tiempo t (viaja del foco anterior al nuevo) */
const esInicio = (shots: VShot[], j: number) => j === 0 || shots[j - 1].to !== shots[j].from;
function camara(shots: VShot[], i: number, t: number, W: number, H: number): Cam {
  const cur = shots[i];
  const destino = enfoque(cur.e, W, H);
  const ini = esInicio(shots, i);
  const origen = ini ? { cx: 0.5, cy: 0.5, s: 1 } : camara(shots, i - 1, cur.from, W, H);
  const at = cur.from + (ini ? 0.9 : llegaZoom(cur.e));
  const p = ramp(t, at, 0.9, easeIO);
  return { cx: lerp(origen.cx, destino.cx, p), cy: lerp(origen.cy, destino.cy, p), s: lerp(origen.s, destino.s, p) };
}

const Cursor: React.FC<{ escala: number }> = ({ escala }) => (
  <svg width={44 / escala} height={44 / escala} viewBox="0 0 24 24" style={{ position: "absolute", left: 0, top: 0, filter: "drop-shadow(0 2px 3px rgba(0,0,0,.45))" }}>
    <path d="M4 2l15 11.2-6.6 1.1 3.9 7.2-2.8 1.5-3.9-7.3L4.6 20z" fill="#fff" stroke="#111" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

const Capa: React.FC<{ v: VShot; cam: Cam; W: number; H: number; opacity: number; cursor: { x: number; y: number; press: number; ripple: number } | null }> = ({ v, cam, W, H, opacity, cursor }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  const e = v.e;
  const r = recorteDe(e);
  const k = Math.max(W / r.w, H / r.h) * cam.s;
  // que la imagen siempre cubra la ventana
  const hx = W / (2 * k);
  const hy = H / (2 * k);
  const cx = Math.min(Math.max(cam.cx * r.w, hx), r.w - hx);
  const cy = Math.min(Math.max(cam.cy * r.h, hy), r.h - hy);
  const lt = t - v.from;
  const hl = e.foco && e.resaltar !== false ? ramp(lt, llegaZoom(e) + 0.7, 0.35) * (1 - ramp(t, v.to - 0.25, 0.25)) : 0;
  const px = (n: number) => n / k; // n píxeles de pantalla → píxeles de imagen
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: r.w, height: r.h, transformOrigin: "0 0", opacity, overflow: "hidden",
      transform: `translate(${W / 2 - cx * k}px, ${H / 2 - cy * k}px) scale(${k})` }}>
      <Img src={img(e.imagen)} style={{ position: "absolute", left: -r.x, top: -r.y }} />
      {(e.ocultar ?? []).map((o: any, j: number) => (
        <div key={j} style={{ position: "absolute", left: o.x - r.x, top: o.y - r.y, width: o.w, height: o.h, borderRadius: o.radio ?? 8,
          ...(o.modo === "tapar" ? { background: o.color ?? "#1F1F1F" } : { backdropFilter: `blur(${o.blur ?? 22}px)`, WebkitBackdropFilter: `blur(${o.blur ?? 22}px)`, background: o.tinte ?? "rgba(18,18,18,.6)" }) }} />
      ))}
      {e.video && (
        <div style={{ position: "absolute", left: e.video.x - r.x, top: e.video.y - r.y, width: e.video.w, height: e.video.h, borderRadius: e.video.radio ?? 24, overflow: "hidden", background: "#000" }}>
          <Sequence from={Math.round(v.from * fps)} durationInFrames={Math.max(1, Math.round((v.to - v.from) * fps))}>
            <OffthreadVideo src={staticFile(e.video.archivo)} muted startFrom={Math.round((e.video.desde ?? 0) * fps)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </Sequence>
        </div>
      )}
      {e.escribir && (() => {
        const w = e.escribir;
        const at = w.at ?? 1.4;
        const n = Math.round(w.texto.length * ramp(lt, at, w.dur ?? 1.0, (x) => x));
        return (
          <>
            {w.fondo && <div style={{ position: "absolute", left: w.fondo.x - r.x, top: w.fondo.y - r.y, width: w.fondo.w, height: w.fondo.h, background: w.fondo.color ?? "#2A2A2A", borderRadius: w.fondo.radio ?? 10 }} />}
            <div style={{ position: "absolute", left: w.x - r.x, top: w.y - r.y, fontFamily: BODY, fontSize: w.tam ?? 34, color: w.color ?? "#ECECEC", whiteSpace: "nowrap", lineHeight: 1 }}>
              {w.texto.slice(0, n)}
              <span style={{ display: "inline-block", width: 3, height: (w.tam ?? 34) * 1.1, marginLeft: 3, verticalAlign: "middle", background: C.lime, opacity: lt > at - 0.3 && Math.floor(t * 2.4) % 2 === 0 ? 1 : 0 }} />
            </div>
          </>
        );
      })()}
      {e.chat && (() => {
        const z = e.chat.zona;
        const tam = e.chat.tam ?? 34;
        return (
          <div style={{ position: "absolute", left: z.x - r.x, top: z.y - r.y, width: z.w, height: z.h, display: "flex", flexDirection: "column", gap: tam * 1.1, justifyContent: "flex-end" }}>
            {(e.chat.mensajes as any[]).map((m, j) => {
              const at = (e.chat.inicio ?? 0.5) + j * (e.chat.paso ?? 1.4);
              const p = ramp(lt, at, 0.45, glide);
              if (p <= 0) return null;
              const tu = m.de === "tu";
              const n = tu ? m.texto.length : Math.round(m.texto.length * ramp(lt, at + 0.2, 0.8, (x) => x));
              return (
                <div key={j} style={{ alignSelf: tu ? "flex-end" : "flex-start", maxWidth: tu ? "70%" : "92%", opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 30}px)`,
                  ...(tu ? { background: "#303030", borderRadius: tam * 0.8, padding: `${tam * 0.55}px ${tam * 0.8}px` } : { display: "flex", gap: tam * 0.5 }),
                  fontFamily: BODY, fontSize: tam, lineHeight: 1.4, color: "#ECECEC", whiteSpace: "pre-wrap" }}>
                  {!tu && <span style={{ color: "#D97757", fontSize: tam * 1.1 }}>✳</span>}
                  <span>{m.texto.slice(0, n)}</span>
                </div>
              );
            })}
          </div>
        );
      })()}
      {hl > 0 && (
        <div style={{ position: "absolute", left: e.foco.x - r.x - px(10), top: e.foco.y - r.y - px(10), width: e.foco.w + px(20), height: e.foco.h + px(20),
          borderRadius: px(16), border: `${px(4)}px solid ${C.lime}`, boxShadow: `0 0 0 ${px(6)}px ${C.lime}33, 0 0 0 99999px rgba(0,0,0,${0.32 * hl})`, opacity: hl }} />
      )}
      {cursor && (
        <div style={{ position: "absolute", left: cursor.x - r.x, top: cursor.y - r.y }}>
          {cursor.ripple > 0 && cursor.ripple < 1 && (
            <div style={{ position: "absolute", left: -px(70 * cursor.ripple), top: -px(70 * cursor.ripple), width: px(140 * cursor.ripple), height: px(140 * cursor.ripple),
              borderRadius: 9999, background: C.lime, opacity: 0.45 * (1 - cursor.ripple) }} />
          )}
          <div style={{ transform: `scale(${1 - 0.15 * cursor.press})`, transformOrigin: "0 0" }}>
            <Cursor escala={k} />
          </div>
        </div>
      )}
    </div>
  );
};

/** posición del cursor (en píxeles de imagen de la captura actual) */
function cursorEn(shots: VShot[], i: number, t: number) {
  const cur = shots[i];
  let prevPos: { x: number; y: number } | null = null;
  for (let j = i - 1; j >= 0 && shots[j].to === shots[j + 1].from; j--) if (shots[j].e.clic) { prevPos = shots[j].e.clic; break; }
  const r = recorteDe(cur.e);
  const inicio = prevPos ?? { x: r.x + r.w * 0.62, y: r.y + r.h * 0.78 };
  if (!cur.e.clic) return prevPos ? { ...prevPos, press: 0, ripple: 0 } : null;
  const at = cur.from + clicAt(cur.e);
  const p = ramp(t, at - 0.8, 0.7, glide);
  const press = Math.sin(Math.PI * Math.min(1, Math.max(0, (t - at + 0.06) / 0.22)));
  return { x: lerp(inicio.x, cur.e.clic.x, p), y: lerp(inicio.y, cur.e.clic.y, p), press, ripple: t >= at ? ramp(t, at, 0.55) : 0 };
}

export const Ventana: React.FC = () => {
  const t = useT();
  const L = useLinea();
  const f = useFormato();
  const tramo = L.vtramos.find((x) => t >= x.desde - 0.1 && t <= x.hasta + 0.45);
  if (!tramo) return null;
  const M = MARCO[f];
  const shots = L.vshots;
  let i = shots.findIndex((s) => s.from >= tramo.desde);
  while (i + 1 < shots.length && shots[i + 1].from <= t && shots[i + 1].from < tramo.hasta) i++;
  const cur = shots[i];
  const primero = cur.from === tramo.desde;
  const cam = camara(shots, i, t, M.w, M.h);
  const fade = primero ? 1 : ramp(t, cur.from, 0.35, easeIO);
  const prev = !primero && fade < 1 ? shots[i - 1] : null;
  const ent = ramp(t, tramo.desde, 0.8, glide);
  const sal = ramp(t, tramo.hasta - 0.1, 0.45, easeIO);
  const cursor = cursorEn(shots, i, t);
  return (
    <div style={{ position: "absolute", left: M.x, top: M.y, width: M.w, height: M.h, borderRadius: 22, overflow: "hidden", background: "#1A1A1A",
      boxShadow: `0 40px 100px ${sombra(0.35)}, 0 0 0 2px ${sombra(0.25)}`, opacity: Math.min(1, ent * 1.4) * (1 - sal),
      transform: `translateX(${(1 - ent) * 220}px) scale(${1 - 0.04 * sal})` }}>
      {prev && <Capa v={prev} cam={cam} W={M.w} H={M.h} opacity={1} cursor={null} />}
      <Capa v={cur} cam={cam} W={M.w} H={M.h} opacity={fade} cursor={cursor} />
    </div>
  );
};

export const captura: DefEscena = {
  dur: (e) => e.dur ?? 4.5,
  numerada: true,
  ventana: true,
  titulos: (e) => (e.titulo ? [{ from: 0.15, to: (e.dur ?? 4.5) - 0.3, title: e.titulo, texto: e.texto, align: "left" as const }] : []),
  sfx: (e) => [
    { at: 0, f: "whoosh", v: 0.35 },
    ...(e.clic ? [{ at: clicAt(e), f: "click" as const, v: 0.9 }] : []),
    ...(e.escribir ? Array.from({ length: Math.min(8, Math.ceil(e.escribir.texto.length / 3)) }, (_, j) => ({ at: (e.escribir.at ?? 1.4) + j * 0.12, f: "click" as const, v: 0.25 })) : []),
    ...(e.chat ? (e.chat.mensajes as any[]).map((_, j) => ({ at: (e.chat.inicio ?? 0.5) + j * (e.chat.paso ?? 1.4), f: "pop" as const, v: 0.4 })) : []),
  ],
};
export { pop };
