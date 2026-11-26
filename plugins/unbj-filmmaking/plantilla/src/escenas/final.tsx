// Descargas (3,0 s), Diploma (3,4 s) y los tres cierres (3,2 s).
import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { C, TITLE, BODY, MARCA, sombra } from "../motor/marca";
import { useT, useTl, ramp, easeIO, glide, pop, lerp, cabe } from "../motor/tiempo";
import { Check, CoverCard, IsoBlock, Mask, img, W, B, SW, SH, S, Confetti } from "../motor/piezas";
import { Centro, useCentro } from "../motor/formato";
import { DefEscena } from "../motor/linea";

// ======================= Descargas: sin conexión + descarga =======================
// e.etiqueta · e.titulo · e.pantalla · e.aviso {titulo, texto} · e.archivo {portada, titulo, detalle} · e.listo ("Descargada")
const Offline: React.FC<{ o: number; e: any }> = ({ o, e }) => {
  const t = useTl(o);
  if (t < 0.05 || t > 3.3) return null;
  const io = (at: number, i: number) => {
    const p = ramp(t, at, 0.6, glide);
    const q = ramp(t, 2.65 + i * 0.07, 0.4, easeIO);
    return { opacity: Math.min(1, p * 1.5) * (1 - q), transform: `translateX(${(1 - p) * -220 - q * 160}px)` };
  };
  const arcs = ["M8 34a42 42 0 0 1 68 0", "M18 46a28 28 0 0 1 48 0", "M28 58a14 14 0 0 1 28 0"];
  const pct = ramp(t, 0.8, 1.05, easeIO);
  const done = ramp(t, 1.9, 0.3);
  const card: React.CSSProperties = { position: "absolute", left: 50, background: C.card, borderRadius: 30, border: `2px solid ${C.line}`, boxShadow: `0 26px 60px ${sombra(0.16)}` };
  return (
    <>
      <div style={{ ...card, top: 650, display: "flex", alignItems: "center", gap: 24, padding: "26px 36px 26px 28px", ...io(0.15, 0) }}>
        <svg width="84" height="84" viewBox="0 0 84 84">
          {arcs.map((d, j) => (
            <path key={j} d={d} stroke={C.text} strokeWidth="7" fill="none" strokeLinecap="round" opacity={1 - 0.75 * ramp(t, 0.65 + (2 - j) * 0.1, 0.25)} />
          ))}
          <circle cx="42" cy="70" r="6" fill={C.text} />
          <path d="M14 12L72 74" stroke={C.lime} strokeWidth="8" strokeLinecap="round" strokeDasharray={86} strokeDashoffset={86 * (1 - ramp(t, 0.95, 0.35))} />
        </svg>
        <div>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 38, color: C.text }}>{e.aviso?.titulo ?? "Sin conexión"}</div>
          <div style={{ fontFamily: TITLE, fontStyle: "italic", fontSize: 30, color: C.muted, marginTop: 4 }}>{e.aviso?.texto ?? ""}</div>
        </div>
      </div>
      <div style={{ ...card, top: 900, width: 540, padding: 26, ...io(0.45, 1) }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <Img src={img(e.archivo.portada)} style={{ width: 120, height: 75, borderRadius: 12, objectFit: "cover" }} />
          <div>
            <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 28, color: C.text, lineHeight: 1.2 }}>{e.archivo.titulo}</div>
            <div style={{ fontFamily: BODY, fontSize: 24, color: C.muted, marginTop: 4 }}>{e.archivo.detalle}</div>
          </div>
        </div>
        <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 18, height: 52 }}>
          <div style={{ position: "relative", flex: 1, height: 12, borderRadius: 9, background: C.cream }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct * 100}%`, borderRadius: 9, background: done > 0.5 ? C.violet : C.lime }} />
          </div>
          {done < 0.5 ? (
            <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 28, color: C.text, minWidth: 80, textAlign: "right" }}>{Math.round(pct * 100)}%</div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 18px 8px 10px", borderRadius: 99, background: `${C.violet}1f`, fontFamily: BODY,
              fontWeight: 700, fontSize: 24, color: C.violet, transform: `scale(${pop(t, 1.9, 0.45)})` }}>
              <Check size={32} bg={C.violet} draw={ramp(t, 2.0, 0.3)} />
              {e.listo ?? "Descargada"}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export const descargas: DefEscena = {
  dur: () => 3.0,
  numerada: true,
  Capa: Offline,
  telefono: (e) => ({
    keys: [{ at: -0.7, d: 0.9, x: 680, y: 620, s: 0.8, ry: -12, rz: 1, z: 0 }],
    shots: [{ from: -0.2, src: e.pantalla.archivo, h: e.pantalla.alto, tr: "push", keys: [{ at: -0.2, cy: 422 }, { at: 1.5, d: 1.0, cy: 680 }] }],
  }),
  mundo: () => [
    { at: -0.3, d: 0.8, x: 0, y: 30, s: 0.97, rx: 12, rz: 0 }, // mirando la mesa desde arriba
    { at: 2.8, d: 0.8, x: 0, y: 0, s: 1, rx: 0, rz: 0 },
  ],
  titulos: (e) => [{ from: 0.1, to: 2.7, title: e.titulo, align: "left" }],
  sfx: () => [{ at: -0.7, f: "whoosh", v: 0.75 }, { at: 0.95, f: "click", v: 0.6 }, { at: 1.9, f: "ding", v: 0.6 }],
};

// ======================= Diploma: confeti, el diploma se levanta del plano e insignia =======================
// e.etiqueta · e.titulo · e.pantalla · e.imagen (diploma o premio, horizontal) · e.proporcion (alto/ancho, 1700/2200)
const DiplomaV: React.FC<{ o: number; fin: number; e: any }> = ({ o, fin, e }) => {
  const t = useTl(o);
  if (t < 0.75 || t > fin - o + 0.3) return null;
  const d = ramp(t, 0.8, 1.1, glide);
  const cx = lerp(620, 540, d);
  const cy = lerp(1560, 1180, d) + 8 * Math.sin((t + o) * 1.6);
  const w = 900;
  const h = Math.round(w * (e.proporcion ?? 1700 / 2200));
  const sp = pop(t, 1.55, 0.55);
  return (
    <div style={{ position: "absolute", left: cx - w / 2, top: cy - h / 2, width: w, height: h, opacity: Math.min(1, d * 2.5),
      transform: `perspective(2400px) rotateX(${lerp(64, 0, d)}deg) rotateZ(${lerp(-36, -4, d)}deg) scale(${lerp(0.5, 1, d)})`,
      boxShadow: `0 ${lerp(10, 40, d)}px ${lerp(30, 100, d)}px ${sombra(0.35)}`, borderRadius: 8 }}>
      <Img src={img(e.imagen)} style={{ width: "100%", height: "100%", borderRadius: 8 }} />
      <div style={{ position: "absolute", right: -46, top: -56, width: 170, height: 170, borderRadius: 999, background: C.text, border: `8px solid ${C.lime}`,
        display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 18px 40px ${sombra(0.35)}`, opacity: Math.min(1, sp * 1.5),
        transform: `scale(${sp}) rotate(${(1 - sp) * -120 + 6}deg)` }}>
        <Check size={96} bg={C.violet} draw={ramp(t, 1.75, 0.35)} />
      </div>
    </div>
  );
};
export const diploma: DefEscena = {
  dur: () => 3.4,
  numerada: true,
  finNumero: (d) => d - 0.3,
  Capa: ({ o, fin, e, i, n }) => (
    <>
      <DiplomaV o={o} fin={fin} e={e} />
      <Confetti at={o + 0.45} />
    </>
  ),
  telefono: (e) => ({
    keys: [{ at: -0.1, d: 0.8, x: 540, y: 600, s: 0.8, ry: 0, rz: 0, z: 0 }],
    shots: e.pantalla ? [{ from: 0.15, src: e.pantalla.archivo, h: e.pantalla.alto, tr: "push", keys: [{ at: 0.15, cy: 422 }] }] : [],
  }),
  mundo: () => [{ at: 0.7, d: 2.0, x: 0, y: -20, s: 1.07, rx: 0, rz: 0 }],
  titulos: (e) => [{ from: 0.2, to: 2.9, title: e.titulo }],
  sfx: () => [{ at: -0.1, f: "whoosh", v: 0.75 }, { at: 0.45, f: "boom", v: 0.45 }, { at: 0.8, f: "whoosh", v: 0.7 }, { at: 1.55, f: "pop" }],
};

// ======================= Cierres =======================
// e.variante: "navegador" (C, el elegido en el original) | "maqueta" (A) | "editorial" (B)
// e.etiqueta · e.titulo ("Inscríbete *gratis*") · e.sitio · e.portadas · e.pantalla (navegador) · e.lineas y e.cinta (editorial)
const LOCK = (color: string, size = 40) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" fill={color} />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke={color} strokeWidth="2.4" fill="none" />
  </svg>
);
const typedAt = (txt: string, t: number, at: number, dur = 0.8) => txt.slice(0, Math.round(txt.length * ramp(t, at, dur, (x) => x)));
const Caret: React.FC<{ t: number; h: number; color?: string }> = ({ t, h, color = C.lime }) => (
  <span style={{ display: "inline-block", width: 4, height: h, marginLeft: 4, verticalAlign: `-${h * 0.14}px`, background: color, opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0 }} />
);
const Signature: React.FC<{ color: string; dot?: string; style: React.CSSProperties }> = ({ color, dot = C.lime, style }) =>
  MARCA.firma ? (
    <div style={{ position: "absolute", left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 22, fontSize: 40, color, ...style }}>
      <span style={{ fontFamily: BODY, fontWeight: 700, letterSpacing: 3 }}>{MARCA.firma.izquierda}</span>
      <span style={{ width: 12, height: 12, borderRadius: 99, background: dot }} />
      <span style={{ fontFamily: TITLE, fontStyle: "italic" }}>{MARCA.firma.derecha}</span>
    </div>
  ) : null;
// título con la palabra en cursiva (*palabra*) que entra girando
const Headline: React.FC<{ t: number; at: number; color: string; em: string; size?: number; texto: string }> = ({ t, at, color, em, size = 96, texto }) => {
  const gp = ramp(t, at + 0.2, 0.5, glide);
  const m = texto.match(/^(.*?)\*([^*]+)\*(.*)$/);
  const [antes, cursiva, despues] = m ? [m[1].trim(), m[2], m[3].trim()] : [texto, "", ""];
  return (
    <div style={{ fontFamily: TITLE, fontWeight: 700, fontSize: size, lineHeight: 1.06, letterSpacing: -1.5, color }}>
      {antes && <><Mask p={ramp(t, at, 0.45)} style={{ display: "inline-block", verticalAlign: "bottom" }}>{antes}</Mask>{" "}</>}
      {cursiva && (
        <span style={{ display: "inline-block", fontStyle: "italic", color: em, opacity: Math.min(1, gp * 1.5), transform: `translateY(${(1 - gp) * 40}px) rotate(${(1 - gp) * -8}deg)` }}>
          {cursiva}
        </span>
      )}
      {despues && <> <Mask p={ramp(t, at + 0.1, 0.45)} style={{ display: "inline-block", verticalAlign: "bottom" }}>{despues}</Mask></>}
    </div>
  );
};

const FLOAT = [
  { x: 130, y: 640, r: -10 },
  { x: 950, y: 600, r: 9 },
  { x: 120, y: 1150, r: 8 },
  { x: 960, y: 1120, r: -8 },
];
const CierreNavegador: React.FC<{ o: number; e: any }> = ({ o: f, e }) => {
  const t = useT();
  const c = useCentro();
  if (t < f - 0.4) return null;
  const URL = e.sitio ?? MARCA.sitio;
  const r = 2400 * ramp(t, f - 0.35, 0.6, easeIO) * Math.max(1, c.width / 1080);
  const cc = c.punto(950, 860);
  const ph = ramp(t, f + 0.15, 0.8, glide);
  const ps = 0.64;
  const px = 540;
  const py = 470;
  const ry = -14 * (1 - ph) + 6 * Math.sin((t - f) * 1.4);
  const load = ramp(t, f + 1.15, 0.35, easeIO);
  const page = ramp(t, f + 1.45, 0.45);
  const lp = pop(t, f + 1.7, 0.55);
  const bar = 132;
  const covers = (e.portadas ?? []).slice(0, 4) as string[];
  return (
    <AbsoluteFill style={{ clipPath: `circle(${r}px at ${cc.x}px ${cc.y}px)`, background: C.lime }}>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.14) 1.5px, transparent 1.5px)", backgroundSize: "36px 36px" }} />
      <Centro>
        <AbsoluteFill style={{ alignItems: "center" }}>
          <div style={{ position: "absolute", top: 250, left: 60, right: 60, textAlign: "center" }}>
            <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 28, letterSpacing: 5, color: "rgba(255,255,255,.85)", opacity: ramp(t, f + 0.1, 0.4) }}>{e.etiqueta}</div>
            <div style={{ marginTop: 10 }}><Headline t={t} at={f + 0.15} color="#fff" em={C.text} size={92} texto={e.titulo} /></div>
          </div>
          {covers.map((src, i) => {
            const k = FLOAT[i];
            const ee = ramp(t, f + 0.35 + i * 0.08, 0.8, glide);
            return (
              <CoverCard key={i} src={src} w={250}
                style={{ left: k.x - 125, top: k.y - 78 + 12 * Math.sin(t * 1.3 + i * 1.9), opacity: Math.min(1, ee * 1.4),
                  transform: `perspective(1600px) rotateY(${(i % 2 ? -1 : 1) * 25}deg) rotate(${k.r * (1 + (1 - ee))}deg) scale(${0.5 + 0.5 * ee})`, boxShadow: "0 26px 60px rgba(0,0,0,.3)" }} />
            );
          })}
          {/* celular con navegador: se escribe la dirección, carga y aparece la página */}
          <div style={{ position: "absolute", left: px - W / 2, top: py, width: W, height: SH + B * 2, transformOrigin: "50% 0", borderRadius: 72, background: C.text, padding: B,
            opacity: Math.min(1, ph * 1.5), boxShadow: `0 60px 120px ${C.sombraCierre}`,
            transform: `perspective(2400px) translateY(${(1 - ph) * 700}px) scale(${ps}) rotateY(${ry}deg) rotateX(${(1 - ph) * 25}deg)` }}>
            <div style={{ position: "relative", width: SW, height: SH, borderRadius: 60, overflow: "hidden", background: C.paper2 }}>
              {e.pantalla && (
                <div style={{ position: "absolute", left: 0, right: 0, top: bar, bottom: 0, overflow: "hidden" }}>
                  <Img src={img(e.pantalla.archivo)} style={{ position: "absolute", left: 0, top: lerp(60, 0, page) - 70 * S * ramp(t, f + 2.2, 0.8, easeIO),
                    width: SW, height: e.pantalla.alto * S, opacity: page }} />
                </div>
              )}
              <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: bar, background: C.card, borderBottom: `2px solid ${C.cream}`, display: "flex", alignItems: "flex-end",
                padding: "0 26px 20px" }}>
                <div style={{ flex: 1, height: 64, borderRadius: 20, background: C.cream, display: "flex", alignItems: "center", gap: 12, padding: "0 20px",
                  fontFamily: BODY, fontWeight: 600, fontSize: cabe(URL, 32, 420, 0.55), color: C.text, whiteSpace: "nowrap", overflow: "hidden" }}>
                  {LOCK(C.muted, 26)}
                  {typedAt(URL, t, f + 0.5, 0.6)}
                  {t < f + 1.2 && <Caret t={t} h={34} />}
                </div>
              </div>
              <div style={{ position: "absolute", left: 0, top: bar - 4, height: 6, width: `${load * 100}%`, background: C.lime, opacity: 1 - page }} />
            </div>
          </div>
          <Img src={img(MARCA.logoBlanco)} style={{ position: "absolute", top: 1330, height: 130, opacity: Math.min(1, lp * 1.5), transform: `scale(${0.7 + 0.3 * lp})` }} />
          <Signature color="#fff" dot={C.text} style={{ top: 1500, opacity: ramp(t, f + 1.9, 0.5) }} />
        </AbsoluteFill>
      </Centro>
    </AbsoluteFill>
  );
};

const CierreMaqueta: React.FC<{ o: number; e: any }> = ({ o: f, e }) => {
  const t = useT();
  const c = useCentro();
  if (t < f - 0.4) return null;
  const URL = e.sitio ?? MARCA.sitio;
  const r = 2400 * ramp(t, f - 0.35, 0.6, easeIO) * Math.max(1, c.width / 1080);
  const cc = c.punto(950, 860);
  const lp = pop(t, f + 0.15, 0.6);
  const ap = pop(t, f + 0.7, 0.55);
  const done = t > f + 1.75;
  const ring = ramp(t, f + 1.75, 0.4);
  const rz = -48 + 14 * ramp(t, f, 3.4, (x) => x); // la plataforma gira despacio como una maqueta
  const slab = ramp(t, f + 0.25, 0.7, glide);
  const tiles = (e.portadas ?? []).slice(0, 6) as string[];
  return (
    <AbsoluteFill style={{ clipPath: `circle(${r}px at ${cc.x}px ${cc.y}px)`, background: C.text }}>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.07) 1.5px, transparent 1.5px)", backgroundSize: "36px 36px" }} />
      <Centro>
        <AbsoluteFill style={{ alignItems: "center" }}>
          <Img src={img(MARCA.logoBlanco)} style={{ position: "absolute", top: 250, height: 190, opacity: Math.min(1, lp * 1.5), transform: `scale(${0.7 + 0.3 * lp})` }} />
          <div style={{ position: "absolute", top: 480, left: 60, right: 60, textAlign: "center" }}>
            <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 28, letterSpacing: 5, color: C.lime, opacity: ramp(t, f + 0.3, 0.4) }}>{e.etiqueta}</div>
            <div style={{ marginTop: 12 }}><Headline t={t} at={f + 0.35} color="#fff" em={C.lime} texto={e.titulo} /></div>
          </div>
          <div style={{ position: "absolute", top: 700, display: "flex", alignItems: "center", gap: 22, padding: "26px 46px 26px 34px", borderRadius: 30, background: C.card,
            boxShadow: `0 0 0 ${8 * ring}px ${C.lime}55, 0 30px 70px rgba(0,0,0,.45)`, opacity: Math.min(1, ap * 1.5),
            transform: `scale(${(0.8 + 0.2 * ap) * (done ? 1 + 0.03 * Math.sin(Math.PI * ring) : 1)})` }}>
            {LOCK(C.text)}
            <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: cabe(URL, 56, 700, 0.55), color: C.text, minWidth: 455, whiteSpace: "nowrap" }}>
              {typedAt(URL, t, f + 0.9)}
              <Caret t={t} h={56} />
            </div>
          </div>
          <Signature color="#fff" style={{ top: 880, opacity: ramp(t, f + 1.8, 0.5) }} />
          <div style={{ position: "absolute", left: 540, top: 1330, transformStyle: "preserve-3d", opacity: Math.min(1, slab * 1.5),
            transform: `perspective(2600px) translateY(${(1 - slab) * 260}px) rotateX(58deg) rotateZ(${rz}deg) scale(${0.8 + 0.2 * slab})` }}>
            <IsoBlock x={-400} y={-290} w={800} d={580} h={46} z={-46} south="#121211" west="#191917"
              topStyle={{ background: "#2B2B29", backgroundImage: "radial-gradient(rgba(255,255,255,.1) 2px, transparent 2px)", backgroundSize: "40px 40px", borderRadius: 6 }} />
            {tiles.map((src, i) => {
              const col = i % 3;
              const row = Math.floor(i / 3);
              const drop = ramp(t, f + 0.45 + i * 0.1, 0.55);
              const h = 34 * ramp(t, f + 0.6 + i * 0.1, 0.6, glide);
              const w = 230;
              const d = 144;
              return (
                <IsoBlock key={i} x={-375 + col * 255} y={-215 + row * 270} w={w} d={d} h={h} z={(1 - drop) * 500 + 5 * Math.sin(t * 2 + i)} south="#BDB9AE" west="#D6D2C8"
                  style={{ opacity: Math.min(1, drop * 2) }}>
                  <CoverCard src={src} w={w} style={{ left: 0, top: 0, padding: 4, boxShadow: "none", borderRadius: 16 }} />
                </IsoBlock>
              );
            })}
          </div>
        </AbsoluteFill>
      </Centro>
    </AbsoluteFill>
  );
};

const Band: React.FC<{ t: number; at: number; top: number; rot: number; dir: 1 | -1; bg: string; italic?: boolean; words: string[] }> = ({ t, at, top, rot, dir, bg, italic, words }) => {
  const p = ramp(t, at, 0.6, easeIO);
  const items = [...words, ...words, ...words];
  return (
    <div style={{ position: "absolute", left: -300, width: 1680, top, height: 112, background: bg, overflow: "hidden", display: "flex", alignItems: "center",
      transform: `rotate(${rot}deg) translateX(${(1 - p) * dir * -1700}px)`, boxShadow: `0 20px 50px ${sombra(0.18)}` }}>
      <div style={{ display: "flex", gap: 40, whiteSpace: "nowrap", transform: `translateX(${dir * (-200 + ((t * 260) % 900))}px)`,
        fontFamily: italic ? TITLE : BODY, fontStyle: italic ? "italic" : "normal", fontWeight: italic ? 700 : 900, fontSize: italic ? 56 : 46, letterSpacing: italic ? 0 : 4, color: "#fff" }}>
        {items.map((w, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 40 }}>
            {italic ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toUpperCase()}
            <span style={{ width: 14, height: 14, borderRadius: 99, background: italic ? C.text : C.lime }} />
          </span>
        ))}
      </div>
    </div>
  );
};
const CierreEditorial: React.FC<{ o: number; e: any }> = ({ o: f, e }) => {
  const t = useT();
  const c = useCentro();
  if (t < f - 0.4) return null;
  const URL = e.sitio ?? MARCA.sitio;
  const [l1, l2, l3] = (e.lineas ?? ["Tu", "campus", "TE ESPERA."]) as string[];
  const words = (e.cinta ?? []) as string[];
  const cur = ramp(t, f - 0.35, 0.55, easeIO); // cortina de papel que sube desde abajo
  const lp = pop(t, f + 0.1, 0.5);
  const btn = pop(t, f + 1.0, 0.55);
  const tapAt = f + 2.05;
  const fa = ramp(t, tapAt - 0.5, 0.35);
  const fo = ramp(t, tapAt + 0.25, 0.3);
  const press = 1 - 0.06 * Math.sin(Math.PI * Math.min(1, Math.max(0, (t - tapAt + 0.05) / 0.25)));
  const rp = ramp(t, tapAt, 0.6);
  return (
    <AbsoluteFill style={{ background: C.bg, transform: `translateY(${(1 - cur) * c.height}px)`, overflow: "hidden",
      boxShadow: `0 -40px 80px ${sombra(0.28)}`, borderTop: cur < 1 ? `14px solid ${C.lime}` : undefined }}>
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${C.line}80 1.5px, transparent 1.5px)`, backgroundSize: "36px 36px" }} />
      <Centro>
        <AbsoluteFill style={{ alignItems: "center" }}>
          {words.length > 0 && <Band t={t} at={f + 0.55} top={1250} rot={-7} dir={1} bg={C.text} words={words} />}
          {words.length > 0 && <Band t={t} at={f + 0.7} top={1390} rot={5} dir={-1} bg={C.lime} italic words={words} />}
          <Img src={img(MARCA.logo)} style={{ position: "absolute", top: 240, height: 150, opacity: Math.min(1, lp * 1.5), transform: `scale(${0.7 + 0.3 * lp})` }} />
          <div style={{ position: "absolute", top: 420, left: 0, right: 0, textAlign: "center" }}>
            <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 28, letterSpacing: 5, color: C.lime, opacity: ramp(t, f + 0.15, 0.4) }}>{e.etiqueta}</div>
            <Mask p={ramp(t, f + 0.2, 0.45)}>
              <div style={{ fontFamily: TITLE, fontWeight: 700, fontSize: cabe(l1, 140, 1000, 0.5), lineHeight: 1, color: C.text, letterSpacing: -2 }}>{l1}</div>
            </Mask>
            <Mask p={ramp(t, f + 0.32, 0.5)}>
              <div style={{ fontFamily: TITLE, fontStyle: "italic", fontWeight: 700, fontSize: cabe(l2, 250, 1000, 0.48), lineHeight: 1.12, color: C.lime, letterSpacing: -4, marginTop: -30, marginBottom: -20 }}>{l2}</div>
            </Mask>
            <Mask p={ramp(t, f + 0.44, 0.5)}>
              <div style={{ fontFamily: BODY, fontWeight: 900, fontSize: cabe(l3, 130, 1000, 0.62), lineHeight: 1, color: C.text, letterSpacing: -5 }}>{l3}</div>
            </Mask>
          </div>
          <div style={{ position: "absolute", top: 1030, opacity: Math.min(1, btn * 1.5), transform: `scale(${(0.8 + 0.2 * btn) * press})` }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 20, padding: "28px 50px", borderRadius: 99, background: C.text, overflow: "hidden",
              boxShadow: `0 26px 60px ${sombra(0.3)}`, fontFamily: BODY, fontWeight: 700, fontSize: cabe(URL, 54, 760, 0.56), color: "#fff", whiteSpace: "nowrap" }}>
              <div style={{ position: "absolute", left: "50%", top: "50%", width: 900 * rp, height: 900 * rp, marginLeft: -450 * rp, marginTop: -450 * rp, borderRadius: 999,
                background: C.lime, opacity: t >= tapAt ? 1 : 0 }} />
              <span style={{ position: "relative" }}>{URL}</span>
              <svg width="44" height="44" viewBox="0 0 24 24" style={{ position: "relative", transform: `translateX(${8 * Math.sin(t * 6)}px)` }}>
                <path d="M5 12h13M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div style={{ position: "absolute", left: 680 + (1 - fa) * 60, top: 1100 + (1 - fa) * 90, width: 76, height: 76, borderRadius: 999, background: "rgba(255,255,255,.75)",
            border: `3px solid ${sombra(0.3)}`, boxShadow: `0 10px 26px ${sombra(0.3)}`, opacity: fa * (1 - fo), transform: `scale(${press})` }} />
          <Signature color={C.text} style={{ top: 1545, opacity: ramp(t, f + 1.3, 0.5) }} />
        </AbsoluteFill>
      </Centro>
    </AbsoluteFill>
  );
};

// Solo marca: círculo de acento, el logo blanco salta y el nombre con una palabra en cursiva. Sin llamado ni sitio.
// e.titulo ("UNBJ *Filmmaking*"; por defecto el nombre de la marca)
const CierreMarca: React.FC<{ o: number; e: any }> = ({ o: f, e }) => {
  const t = useT();
  const c = useCentro();
  if (t < f - 0.4) return null;
  const r = 2400 * ramp(t, f - 0.35, 0.6, easeIO) * Math.max(1, c.width / 1080);
  const cc = c.punto(540, 960);
  const lp = pop(t, f + 0.3, 0.6);
  const lineP = ramp(t, f + 1.2, 0.6, easeIO);
  return (
    <AbsoluteFill style={{ clipPath: `circle(${r}px at ${cc.x}px ${cc.y}px)`, background: C.lime }}>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.14) 1.5px, transparent 1.5px)", backgroundSize: "36px 36px" }} />
      <Centro>
        <AbsoluteFill style={{ alignItems: "center" }}>
          <Img src={img(MARCA.logoBlanco)} style={{ position: "absolute", top: 560, height: 260, opacity: Math.min(1, lp * 1.5), transform: `scale(${0.6 + 0.4 * lp})` }} />
          <div style={{ position: "absolute", top: 900, left: 40, right: 40, textAlign: "center" }}>
            <Headline t={t} at={f + 0.6} color="#fff" em={C.text} size={130} texto={e.titulo ?? MARCA.nombre} />
          </div>
          <div style={{ position: "absolute", top: 1110, left: 540 - 160, width: 320, height: 6, borderRadius: 3, background: "#fff", opacity: 0.85, transform: `scaleX(${lineP})` }} />
        </AbsoluteFill>
      </Centro>
    </AbsoluteFill>
  );
};

export const cierre: DefEscena = {
  dur: () => 3.2,
  sfxSinRedondeo: true,
  Arriba: ({ o, e }) =>
    e.variante === "marca" ? <CierreMarca o={o} e={e} /> : e.variante === "maqueta" ? <CierreMaqueta o={o} e={e} /> : e.variante === "editorial" ? <CierreEditorial o={o} e={e} /> : <CierreNavegador o={o} e={e} />,
  sfx: () => [
    { at: -0.35, f: "whoosh" },
    { at: 0.15, f: "whoosh", v: 0.6 },
    ...Array.from({ length: 4 }, (_, i) => ({ at: 0.4 + i * 0.08, f: "pop" as const, v: 0.35 })),
    ...Array.from({ length: 5 }, (_, i) => ({ at: 0.5 + i * 0.12, f: "click" as const, v: 0.3 })),
    { at: 1.45, f: "ding" },
    { at: 1.7, f: "pop", v: 0.7 },
  ],
};
