// Reproductor: el video sale de la pantalla del celular y se agranda con sus controles (2,85 s).
//   e.etiqueta · e.titulo · e.pantalla · e.portada (imagen del video) · e.chip ("LECCIÓN 2.1 · 22 MIN") · e.desde ("4:12") · e.total ("22:00")
// Ruta: escalera isométrica de módulos; la marca con iniciales salta al módulo actual (2,6 s).
//   e.etiqueta · e.titulo · e.modulos [{texto, estado:"hecho"|"actual"|"siguiente"}] (3) · e.iniciales · e.aquiVas ("· aquí vas")
import React from "react";
import { Img } from "remotion";
import { C, TITLE, BODY, sombra } from "../motor/marca";
import { useT, useTl, r6, ramp, easeIO, easeIn, glide, pop, lerp } from "../motor/tiempo";
import { Check, IsoBlock, img, usePhone, W, B, S } from "../motor/piezas";
import { DefEscena } from "../motor/linea";

const seg = (s: string) => {
  const [m, x] = String(s).split(":").map(Number);
  return m * 60 + (x || 0);
};
const mmss = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

const POP_W = 980;
const POP_H = Math.round((POP_W * 180) / 390); // misma proporción que el reproductor (390x180 pt)
const VideoPop: React.FC<{ o: number; e: any }> = ({ o, e }) => {
  const t = useTl(o);
  const T = useT();
  const p = usePhone();
  const k = ramp(t, 0.95, 0.8, glide) * (1 - ramp(t, 2.6, 0.5, easeIO));
  if (k <= 0.002 || !p) return null;
  const sc = p.s * S;
  const src = { x: p.x + (-W / 2 + B) * p.s, y: p.y + B * p.s + 60 * sc, w: 390 * sc };
  const x = lerp(src.x, 50, k);
  const y = lerp(src.y, 600, k);
  const w = lerp(src.w, POP_W, k);
  const total = seg(e.total ?? "22:00");
  // con el tiempo absoluto (como el original): restar dos veces redondea distinto justo al cambiar de segundo
  const sec = Math.floor(seg(e.desde ?? "4:12") + Math.max(0, T - r6(o + 1.35)) * 12);
  const ctl = ramp(t, 1.4, 0.35);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: POP_W, height: POP_H, transformOrigin: "0 0", transform: `scale(${w / POP_W})`,
      borderRadius: 34, overflow: "hidden", background: C.text, boxShadow: `0 ${40 * k}px ${110 * k}px ${sombra(0.35 * k)}` }}>
      <Img src={img(e.portada)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.02 + 0.05 * ramp(t, 1.05, 2.0, easeIO)})` }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${sombra(0)} 55%, ${sombra(0.75)} 100%)`, opacity: ctl }} />
      {e.chip && (
        <div style={{ position: "absolute", left: 28, top: 26, padding: "10px 20px", borderRadius: 99, background: "rgba(255,255,255,.94)", fontFamily: BODY, fontWeight: 700,
          fontSize: 22, letterSpacing: 2, color: C.lime, opacity: ctl }}>
          {e.chip}
        </div>
      )}
      <div style={{ position: "absolute", left: 32, right: 32, bottom: 26, display: "flex", alignItems: "center", gap: 22, opacity: ctl }}>
        <svg width="34" height="34" viewBox="0 0 24 24"><rect x="5" y="4" width="4.5" height="16" rx="1.5" fill="#fff" /><rect x="14.5" y="4" width="4.5" height="16" rx="1.5" fill="#fff" /></svg>
        <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 26, color: "#fff", minWidth: 170 }}>
          {mmss(sec)} / {mmss(total)}
        </div>
        <div style={{ position: "relative", flex: 1, height: 8, borderRadius: 9, background: "rgba(255,255,255,.35)" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(sec / total) * 100}%`, borderRadius: 9, background: C.lime }} />
          <div style={{ position: "absolute", left: `${(sec / total) * 100}%`, top: -7, width: 22, height: 22, marginLeft: -11, borderRadius: 99, background: "#fff" }} />
        </div>
      </div>
    </div>
  );
};

export const reproductor: DefEscena = {
  dur: () => 2.85,
  numerada: true,
  Capa: VideoPop,
  telefono: (e) => ({
    keys: [{ at: 0.05, d: 0.85, x: 540, y: 600, s: 0.88, ry: 0, rz: 0, z: 0 }],
    shots: [{ from: -0.05, src: e.pantalla.archivo, h: e.pantalla.alto, tr: "push", keys: [{ at: -0.05, cy: 422 }] }],
  }),
  titulos: (e) => [{ from: 0.8, to: 2.75, title: e.titulo }],
  sfx: () => [{ at: 0.95, f: "whoosh", v: 0.7 }, { at: 2.6, f: "whoosh", v: 0.5 }],
};

const Steps: React.FC<{ o: number; e: any }> = ({ o, e }) => {
  const t = useTl(o);
  if (t < 0.1 || t > 2.9) return null;
  const est = (s: string) => (s === "hecho" || s === "done" ? "done" : s === "actual" || s === "now" ? "now" : "next");
  const MODS = (e.modulos as any[]).slice(0, 3).map((m) => {
    const s = est(m.estado);
    return s === "done"
      ? { top: C.violet, south: C.secSur, west: C.secOeste, ink: "#fff", label: m.texto, state: s }
      : s === "now"
        ? { top: C.lime, south: C.accentDark, west: C.acOeste, ink: "#fff", label: m.texto, state: s }
        : { top: C.card, south: C.line, west: C.vacioOeste, ink: C.text, label: m.texto, state: s };
  });
  const out = ramp(t, 2.3, 0.45, easeIn);
  const size = 210;
  const gap = 24;
  const hOf = (i: number) => (i + 1) * 80 * ramp(t, 0.35 + i * 0.18, 0.75, glide);
  const xOf = (i: number) => (i - 1) * (size + gap) - size / 2;
  // la marca con iniciales salta del último módulo hecho al actual
  const from = Math.max(0, MODS.findIndex((m) => m.state === "now") - 1);
  const to = Math.min(MODS.length - 1, from + 1);
  const hop = ramp(t, 1.45, 0.55, easeIO);
  const mx = lerp(xOf(from), xOf(to), hop) + size / 2;
  const mz = lerp(hOf(from), hOf(to), hop) + 150 * Math.sin(Math.PI * hop) + 10;
  const mIn = pop(t, 0.9, 0.5);
  return (
    <>
      <div style={{ position: "absolute", left: 560, top: 1040, transformStyle: "preserve-3d", opacity: 1 - out,
        transform: `perspective(3000px) translateY(${out * -300}px) rotateX(${58 - 10 * out}deg) rotateZ(${-38 + 20 * (1 - ramp(t, 0.2, 1.6, easeIO))}deg)` }}>
        <div style={{ position: "absolute", left: -420, top: -170, width: 840, height: 340, borderRadius: 40, background: sombra(0.1), filter: "blur(30px)" }} />
        {MODS.map((m, i) => (
          <IsoBlock key={i} x={xOf(i)} y={-size / 2} w={size} d={size} h={hOf(i)} south={m.south} west={m.west}
            topStyle={{ background: m.top, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: m.state === "next" ? `inset 0 0 0 3px ${C.line}` : undefined }}>
            <div style={{ fontFamily: TITLE, fontStyle: "italic", fontWeight: 700, fontSize: 110, color: m.ink }}>0{i + 1}</div>
          </IsoBlock>
        ))}
        {e.iniciales && (
          <div style={{ position: "absolute", left: mx - 45, top: -45, width: 90, height: 90, transformStyle: "preserve-3d",
            transform: `translateZ(${mz}px) rotateZ(38deg) rotateX(-58deg) translateY(-45px) scale(${mIn})` }}>
            <div style={{ width: 90, height: 90, borderRadius: 99, background: C.text, border: "5px solid #fff", boxShadow: `0 14px 30px ${sombra(0.35)}`,
              display: "flex", alignItems: "center", justifyContent: "center", fontFamily: BODY, fontWeight: 700, fontSize: 30, color: "#fff" }}>
              {e.iniciales}
            </div>
          </div>
        )}
      </div>
      <div style={{ position: "absolute", left: 60, top: 1390 }}>
        {MODS.map((m, i) => {
          const p = ramp(t, 0.6 + i * 0.18, 0.5, glide);
          const q = ramp(t, 2.2 + i * 0.05, 0.35, easeIO);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, height: 62, opacity: Math.min(1, p * 1.5) * (1 - q), transform: `translateX(${(1 - p) * -80}px)`,
              fontFamily: BODY, fontWeight: 600, fontSize: 34, color: m.state === "next" ? C.muted : C.text, whiteSpace: "nowrap" }}>
              {m.state === "done" ? (
                <Check size={38} bg={C.violet} />
              ) : (
                <div style={{ width: 38, height: 38, borderRadius: 99, border: `4px solid ${m.state === "now" ? C.lime : C.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {m.state === "now" && <div style={{ width: 14, height: 14, borderRadius: 99, background: C.lime }} />}
                </div>
              )}
              {m.label}
              {m.state === "now" && e.aquiVas !== "" && <span style={{ fontFamily: TITLE, fontStyle: "italic", fontWeight: 400, color: C.lime }}>{e.aquiVas ?? "· aquí vas"}</span>}
            </div>
          );
        })}
      </div>
    </>
  );
};

export const ruta: DefEscena = {
  dur: () => 2.6,
  numerada: true,
  Capa: Steps,
  // el celular sale volando a la izquierda para dejarle espacio a la escalera
  telefono: () => ({ keys: [{ at: 0, d: 0.8, x: -380, y: 700, s: 0.6, ry: 45, rz: -8, z: 0 }] }),
  titulos: (e) => [{ from: 0.2, to: 2.35, title: e.titulo }],
  sfx: (e) => [
    { at: 0, f: "whoosh", v: 0.6 },
    ...(e.modulos as any[]).slice(0, 3).map((_, i) => ({ at: 0.4 + i * 0.18, f: "pop" as const, v: 0.5 })),
    { at: 2.0, f: "ding", v: 0.45 },
  ],
};
