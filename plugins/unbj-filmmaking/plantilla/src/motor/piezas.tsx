// Piezas comunes del estilo (sacadas tal cual del reel de Campus UNBJ, con la marca como variables).
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useVideoConfig } from "remotion";
import { C, TITLE, BODY, sombra } from "./marca";
import { useT, ramp, pop, track, lerp, easeIO, easeIn, glide } from "./tiempo";
import { useLinea, Shot, Sfx, Cap, Badge } from "./linea";
import { useFormato } from "./formato";

export const img = (p: string) => staticFile(p);

// texto que sube desde una máscara (entra con `p`, sale hacia arriba con `q`)
export const Mask: React.FC<{ p: number; q?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ p, q = 0, style, children }) => (
  <div style={{ overflow: "hidden", paddingBottom: "0.08em", ...style }}>
    <div style={{ transform: `translateY(${(1 - p) * 110 - q * 110}%)` }}>{children}</div>
  </div>
);

export const Check: React.FC<{ size: number; bg: string; draw?: number }> = ({ size, bg, draw = 1 }) => (
  <div style={{ width: size, height: size, borderRadius: 99, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24">
      <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={24} strokeDashoffset={24 * (1 - draw)} />
    </svg>
  </div>
);

// bloque isométrico (CSS 3D): cara superior + caras sur y oeste
export const IsoBlock: React.FC<{ x: number; y: number; w: number; d: number; h: number; z?: number; south: string; west: string; topStyle?: React.CSSProperties;
  style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, d, h, z = 0, south, west, topStyle, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: d, transformStyle: "preserve-3d", transform: `translateZ(${z}px)`, ...style }}>
    <div style={{ position: "absolute", left: 0, top: d, width: w, height: h, background: south, transformOrigin: "top", transform: "rotateX(90deg)" }} />
    <div style={{ position: "absolute", left: 0, top: 0, width: h, height: d, background: west, transformOrigin: "left", transform: "rotateY(-90deg)" }} />
    <div style={{ position: "absolute", inset: 0, transform: `translateZ(${h}px)`, ...topStyle }}>{children}</div>
  </div>
);

// portada (tarjeta plana 16:10, reutilizada en la plataforma y en el cierre)
export const CoverCard: React.FC<{ src: string; label?: string; w: number; style: React.CSSProperties }> = ({ src, label, w, style }) => (
  <div style={{ position: "absolute", width: w, height: w * 0.625, padding: 6, borderRadius: 24, background: C.card, boxShadow: `0 26px 60px ${sombra(0.22)}`, ...style }}>
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 18, overflow: "hidden" }}>
      <Img src={img(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      {label && (
        <div style={{ position: "absolute", left: 12, bottom: 12, padding: "6px 16px", borderRadius: 99, background: "rgba(255,255,255,.94)",
          fontFamily: BODY, fontWeight: 600, fontSize: 22, color: C.text }}>
          {label}
        </div>
      )}
    </div>
  </div>
);

// ---------- sonido ----------
export const Sounds: React.FC<{ list: Sfx[] }> = ({ list }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {list.map((s, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(s.at * fps))} durationInFrames={fps}>
          <Audio src={staticFile(`sfx/${s.f}.wav`)} volume={(s.v ?? 1) * 0.35} />
        </Sequence>
      ))}
    </>
  );
};

// ---------- fondo papel con manchas que se reacomodan en cada sección ----------
const POS_A = [{ x: -380, y: -420, s: 1 }, { x: 260, y: -360, s: 1.15 }, { x: -460, y: 120, s: 0.95 }, { x: 120, y: -460, s: 1.2 }, { x: -420, y: -200, s: 1 }, { x: 0, y: -380, s: 1.1 }];
const POS_B = [{ x: 420, y: 1300, s: 1 }, { x: -300, y: 1200, s: 0.9 }, { x: 480, y: 1100, s: 1.1 }, { x: -200, y: 1350, s: 1 }, { x: 400, y: 1250, s: 1.15 }, { x: 0, y: 1300, s: 1.2 }];
const morph = (t: number, ph: number) => {
  const v = (k: number) => Math.round(50 + 14 * Math.sin(t * 0.7 + ph + k));
  return `${v(0)}% ${100 - v(0)}% ${v(1)}% ${100 - v(1)}% / ${v(2)}% ${v(3)}% ${100 - v(3)}% ${100 - v(2)}%`;
};
export const PaperBg: React.FC = () => {
  const t = useT();
  const L = useLinea();
  const { width, height } = useVideoConfig();
  const sx = width / 1080;
  const sy = height / 1920;
  const keys = (P: typeof POS_A) => [{ at: 0, ...P[0] }, ...L.starts.map((at, i) => ({ at, d: 1.4, ...P[1 + (i % 5)] }))];
  const a = track(keys(POS_A), t, easeIO);
  const b = track(keys(POS_B), t, easeIO);
  const k = Math.max(sx, sy);
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: a.x * sx, top: a.y * sy, width: 1300 * k, height: 1300 * k, transform: `scale(${a.s})`, borderRadius: morph(t, 0),
        background: `radial-gradient(circle at 50% 50%, ${C.paper2} 0%, ${C.paper2}00 68%)` }} />
      <div style={{ position: "absolute", left: b.x * sx, top: b.y * sy, width: 1100 * k, height: 1100 * k, transform: `scale(${b.s})`, borderRadius: morph(t, 2),
        background: `radial-gradient(circle at 50% 50%, ${C.lime}26 0%, ${C.lime}00 66%)` }} />
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${C.line}80 1.5px, transparent 1.5px)`, backgroundSize: "36px 36px" }} />
    </AbsoluteFill>
  );
};

// número grande de sección, al fondo
export const BigNums: React.FC = () => {
  const t = useT();
  const L = useLinea();
  return (
    <>
      {L.nums.filter((s) => t > s.from - 0.1 && t < s.to + 0.6).map((s) => {
        const p = ramp(t, s.from + 0.2, 1.0);
        const o = ramp(t, s.to - 0.1, 0.5, easeIO);
        return (
          <div key={s.n + s.from} style={{ position: "absolute", top: 1020, [s.side]: -40, fontFamily: TITLE, fontStyle: "italic", fontWeight: 700, fontSize: 600, lineHeight: 1,
            color: C.text, opacity: 0.055 * p * (1 - o), transform: `translateY(${(1 - p) * 160 - o * 120}px)` }}>
            {s.n}
          </div>
        );
      })}
    </>
  );
};

// ---------- títulos de escena (palabra por palabra; *palabra* = cursiva en color de acento) ----------
export const Caption: React.FC<Cap> = ({ from, to, eyebrow, title, texto, align = "center" }) => {
  const t = useT();
  const f = useFormato();
  if (t < from - 0.05 || t > to + 0.4) return null;
  const out = ramp(t, to, 0.35, easeIO);
  const ep = ramp(t, from, 0.45);
  const h = f === "horizontal";
  const al = h ? "left" : align;
  const pos: React.CSSProperties = h ? { top: 330, left: 110, width: 640 } : { top: 250, left: 60, right: 60 };
  return (
    <div style={{ position: "absolute", ...pos, textAlign: al, opacity: 1 - out, transform: `translateY(${-40 * out}px)` }}>
      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 28, letterSpacing: 5, color: C.lime, opacity: ep, transform: `translateX(${(al === "left" ? -30 : 0) * (1 - ep)}px)` }}>
        {eyebrow}
      </div>
      <div style={{ marginTop: 14, fontFamily: TITLE, fontWeight: 700, fontSize: 86, lineHeight: 1.08, letterSpacing: -1.5, color: C.text }}>
        {title.split(" ").map((raw, i) => {
          const em = raw.startsWith("*");
          const w = raw.replace(/\*/g, "");
          const p = ramp(t, from + 0.12 + i * 0.07, 0.55, glide);
          return (
            <span key={i} style={{ display: "inline-block", marginRight: "0.24em", opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 50}px) rotate(${em ? (1 - p) * -6 : 0}deg)`,
              filter: `blur(${Math.max(0, 1 - p) * 8}px)`, ...(em ? { fontStyle: "italic", color: C.lime, fontSize: 94 } : {}) }}>
              {w}
            </span>
          );
        })}
      </div>
      {texto && (
        <div style={{ marginTop: 22, fontFamily: BODY, fontSize: 34, lineHeight: 1.4, color: C.muted, opacity: ramp(t, from + 0.5, 0.5), transform: `translateY(${(1 - ramp(t, from + 0.5, 0.5)) * 20}px)` }}>
          {texto.split(/(\*[^*]+\*)/).map((w, i) => (w.startsWith("*") ? <b key={i} style={{ color: C.text, fontWeight: 700 }}>{w.replace(/\*/g, "")}</b> : w))}
        </div>
      )}
    </div>
  );
};

// ---------- insignia flotante ----------
export const BadgeV: React.FC<Badge> = ({ from, to, text, top }) => {
  const t = useT();
  if (t < from - 0.05 || t > to + 0.3) return null;
  const p = pop(t, from, 0.5);
  const o = Math.min(1, p * 1.5) * (1 - ramp(t, to, 0.25));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "22px 36px 22px 24px", borderRadius: 26, background: C.card, border: `2px solid ${C.line}`,
        boxShadow: `0 24px 60px ${sombra(0.18)}`, fontFamily: BODY, fontWeight: 600, fontSize: 40, color: C.text, transform: `scale(${0.8 + 0.2 * p})` }}>
        <Check size={52} bg={C.violet} />
        {text}
      </div>
    </div>
  );
};

// ---------- cámara global ----------
// transformOrigin en el centro del escenario; x/y = desplazamiento final. rx/rz = vista isométrica.
export const World: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const t = useT();
  const L = useLinea();
  const w = track(L.world, t, easeIO);
  return (
    <AbsoluteFill style={{ perspective: 3200, perspectiveOrigin: "540px 960px" }}>
      <AbsoluteFill style={{ transformStyle: "preserve-3d", transformOrigin: "540px 960px",
        transform: `translate(${w.x}px, ${w.y}px) scale(${w.s}) rotateX(${w.rx}deg) rotateZ(${w.rz}deg)` }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- celular ----------
export const W = 600;
export const B = 12;
export const R = 72;
export const SW = W - B * 2; // 576
export const SH = Math.round((SW * 844) / 390); // 1246
export const S = SW / 390; // px por punto de diseño (las pantallas se diseñan a 390 de ancho)

/** Punto (en el escenario) de una coordenada de la pantalla, con el celular en la pose `p`. */
export const puntoEnPantalla = (p: { x: number; y: number; s: number }, x: number, y: number) => ({
  x: p.x + (B + x * S - W / 2) * p.s,
  y: p.y + (B + y * S) * p.s,
});

const ShotImg: React.FC<{ shot: Shot; t: number; style?: React.CSSProperties }> = ({ shot, t, style }) => {
  const k = track(shot.keys, t, easeIO);
  const top = Math.min(0, Math.max(SH - shot.h * S, SH / 2 - k.cy * S));
  return <Img src={img(shot.src)} style={{ position: "absolute", left: 0, top, width: SW, height: shot.h * S, ...style }} />;
};

const Layer: React.FC<{ shot: Shot; t: number; p: number }> = ({ shot, t, p }) => {
  if (shot.tr === "sheet") {
    const st = (shot.sheetTop ?? 0) * S;
    return (
      <>
        <div style={{ position: "absolute", inset: 0, background: C.text, opacity: 0.45 * p }} />
        <ShotImg shot={shot} t={t} style={{ clipPath: `inset(${st}px 0 0 0)`, transform: `translateY(${(1 - p) * (SH - st)}px)` }} />
      </>
    );
  }
  if (shot.tr === "fade") return <ShotImg shot={shot} t={t} style={{ opacity: p }} />;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - p) * SW}px)`, boxShadow: p < 1 ? `-20px 0 40px ${sombra(0.25)}` : "none" }}>
      <ShotImg shot={shot} t={t} />
    </div>
  );
};

const TapV: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const t = useT();
  if (t < at - 0.55 || t > at + 0.7) return null;
  const a = ramp(t, at - 0.55, 0.4);
  const out = ramp(t, at + 0.25, 0.3);
  const press = 1 - 0.2 * Math.sin(Math.PI * Math.min(1, Math.max(0, (t - at + 0.06) / 0.24)));
  const rp = ramp(t, at, 0.6);
  const X = x * S;
  const Y = y * S;
  return (
    <>
      <div style={{ position: "absolute", left: X - 100 * rp, top: Y - 100 * rp, width: 200 * rp, height: 200 * rp, borderRadius: 999,
        background: C.lime, opacity: t >= at ? 0.4 * (1 - rp) : 0 }} />
      <div style={{ position: "absolute", left: X - 36 + (1 - a) * 60, top: Y - 36 + (1 - a) * 90, width: 72, height: 72, borderRadius: 999,
        background: "rgba(255,255,255,.7)", border: `3px solid ${sombra(0.28)}`, boxShadow: `0 10px 26px ${sombra(0.3)}`,
        opacity: a * (1 - out), transform: `scale(${press})` }} />
    </>
  );
};

export const usePhone = () => {
  const t = useT();
  const L = useLinea();
  return L.phone.length ? track(L.phone, t) : null;
};

export const Phone: React.FC = () => {
  const t = useT();
  const L = useLinea();
  if (!L.phone.length || !L.shots.length || t < L.phoneDesde || t > L.phoneHasta - 0.05) return null;
  const p = track(L.phone, t);
  const SHOTS = L.shots;
  let i = 0;
  while (i + 1 < SHOTS.length && SHOTS[i + 1].from <= t) i++;
  const cur = SHOTS[i];
  const tp = i > 0 ? ramp(t, cur.from, cur.tr === "sheet" ? 0.5 : cur.tr === "fade" ? 0.25 : 0.6, easeIO) : 1;
  // la hoja inferior deja ver la pantalla anterior detrás del velo
  const prev = i > 0 && (tp < 1 || cur.tr === "sheet") ? SHOTS[i - 1] : null;
  return (
    <div style={{ position: "absolute", left: p.x - W / 2, top: p.y, width: W, height: SH + B * 2, transformOrigin: "50% 0",
      transform: `translateZ(${p.z}px) perspective(2400px) scale(${p.s}) rotateY(${p.ry}deg) rotateZ(${p.rz}deg)`, borderRadius: R, background: C.text, padding: B,
      opacity: Math.min(1, ramp(t, L.phoneDesde, 0.3) * 1.2),
      boxShadow: `${-p.ry * 2.5}px 60px 120px ${sombra(0.3)}, 0 0 0 2px ${sombra(0.6)}` }}>
      <div style={{ position: "relative", width: SW, height: SH, borderRadius: R - B, overflow: "hidden", background: C.bg }}>
        {prev && (
          <div style={{ position: "absolute", inset: 0, transform: cur.tr === "push" ? `translateX(${-0.28 * tp * SW}px)` : undefined }}>
            {prev.tr === "sheet" && i >= 2 ? (
              <>
                <ShotImg shot={SHOTS[i - 2]} t={t} />
                <Layer shot={prev} t={t} p={1} />
              </>
            ) : (
              <ShotImg shot={prev} t={t} />
            )}
          </div>
        )}
        {prev && cur.tr === "push" && <div style={{ position: "absolute", inset: 0, background: C.text, opacity: 0.22 * tp * (1 - tp) * 4 }} />}
        <Layer shot={cur} t={t} p={tp} />
        {L.taps.map((k) => <TapV key={k.at} {...k} />)}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
          background: `linear-gradient(115deg, rgba(255,255,255,0) ${30 + p.ry}%, rgba(255,255,255,.14) ${42 + p.ry}%, rgba(255,255,255,0) ${54 + p.ry}%)` }} />
      </div>
    </div>
  );
};

// ---------- confeti ----------
const rnd = (i: number, n: number) => {
  const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
export const Confetti: React.FC<{ at: number }> = ({ at }) => {
  const t = useT();
  if (t < at || t > at + 2.6) return null;
  const colors = [C.lime, C.violet, C.text, C.warn, C.accentDark, "#FFFFFF"];
  const kd = 1.6;
  return (
    <>
      {Array.from({ length: 96 }, (_, i) => {
        const left = i % 2 === 0;
        const ang = ((left ? -100 - rnd(i, 1) * 55 : -80 + rnd(i, 1) * 55) * Math.PI) / 180;
        const v = 1300 + rnd(i, 2) * 1100;
        const c = { x0: left ? 360 : 720, y0: 900, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, delay: rnd(i, 3) * 0.12, w: 12 + rnd(i, 4) * 12, h: 18 + rnd(i, 5) * 16,
          spin: (rnd(i, 6) - 0.5) * 1400, color: colors[i % colors.length], round: rnd(i, 7) > 0.75 };
        const dt = t - at - c.delay;
        if (dt <= 0) return null;
        const f = (1 - Math.exp(-kd * dt)) / kd;
        const x = c.x0 + c.vx * f;
        const y = c.y0 + c.vy * f + 0.5 * 1500 * dt * dt;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: c.w, height: c.round ? c.w : c.h, borderRadius: c.round ? 99 : 3, background: c.color,
            opacity: 1 - ramp(dt, 1.7, 0.5), transform: `rotate(${c.spin * dt}deg) rotateX(${c.spin * dt * 0.7}deg)`,
            boxShadow: c.color === "#FFFFFF" ? `0 0 0 1px ${C.line}` : undefined }} />
        );
      })}
    </>
  );
};

export { lerp, easeIn, glide };
