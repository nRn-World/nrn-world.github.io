'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ALL_PROJECTS } from '@/data/projectsData';
import type { Project } from '@/types';

// Dither-porträtt (WebGL2) + projekt som snurrar i en ellips. Under musen visar punkterna fotots färger.
const PORTRAIT_SRC = '/images/profil-dither.jpg';
const PORTRAIT_ASPECT = 565 / 961;
// Bred bana på desktop (som ugurkeskekci.com), hög bana på mobil.
const LAYOUTS = {
  wide: { W: 1000, H: 720, ORBIT: { cx: 500, cy: 470, rx: 430, ry: 170, tilt: 6 }, PORTRAIT: { w: 520, y: -30, dx: 0 } },
  tall: { W: 1000, H: 1060, ORBIT: { cx: 500, cy: 770, rx: 350, ry: 220, tilt: 6 }, PORTRAIT: { w: 760, y: 0, dx: 90 } },
};
type Layout = (typeof LAYOUTS)['wide'];

const GLSL = `
const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);
const float BAYER[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);
float fadeAt(vec2 uv) {
  float sideMask = 1.0 - smoothstep(0.12, 0.38, abs(uv.x - 0.52));
  float sides = mix(1.0, sideMask, smoothstep(0.44, 0.68, uv.y));
  return (1.0 - smoothstep(0.6, 0.86, uv.y)) * sides;
}
float densityAt(sampler2D tex, vec2 uv, float lod) {
  vec4 s = textureLod(tex, uv, lod);
  vec4 sb = textureLod(tex, uv, lod + 2.0);
  float lum = s.a > 0.002 ? dot(s.rgb, LUMA) / s.a : 0.0;
  float lumBlur = sb.a > 0.002 ? dot(sb.rgb, LUMA) / sb.a : lum;
  float detailed = lum + 0.7 * (lum - lumBlur);
  float l = clamp((detailed - 0.03) * 1.05, 0.0, 1.0);
  return pow(l, 0.78) * fadeAt(uv) * smoothstep(0.15, 0.85, s.a);
}`;

const VS = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform float uCell;
uniform int uCols;
uniform float uLod;
uniform float uProgress;
uniform vec3 uInk;
uniform vec2 uLens;
uniform float uLensR;
out vec4 vColor;
${GLSL}
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}
void hide() { gl_Position = vec4(-2.0, -2.0, 0.0, 1.0); gl_PointSize = 0.0; vColor = vec4(0.0); }
void main() {
  vec2 cell = vec2(float(gl_VertexID % uCols), float(gl_VertexID / uCols));
  vec2 home = (cell + 0.5) * uCell;
  float density = densityAt(uTex, home / uRes, uLod);
  vec2 b = mod(cell, 4.0);
  float threshold = (BAYER[int(b.y) * 4 + int(b.x)] + 0.5) / 16.0;
  vec4 photo = textureLod(uTex, home / uRes, uLod);
  vec3 rgb = photo.a > 0.01 ? photo.rgb / photo.a : vec3(0.0);
  float grey = dot(rgb, LUMA);
  rgb = clamp(mix(vec3(grey), rgb, 1.35) * 1.18, 0.0, 1.0);
  float d = distance(home, uLens);
  float lens = uLensR > 0.5 ? 1.0 - smoothstep(uLensR * 0.35, uLensR, d) : 0.0;
  vec2 g = hash2(cell + 17.0);
  float local = clamp((uProgress - g.x * 0.35) / 0.65, 0.0, 1.0);
  density = min(1.0, density * (1.0 + 0.35 * lens));
  if (density <= threshold) { hide(); return; }
  vec2 h = hash2(cell);
  vec2 start = vec2(h.x * 1.3 - 0.15, h.y * 1.15 - 0.1) * uRes;
  float ease = 1.0 - pow(1.0 - local, 3.0);
  vec2 pos = mix(start, home, ease);
  vec2 clip = pos / uRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = uCell;
  float alpha = smoothstep(0.0, 0.3, local);
  vColor = vec4(mix(uInk, rgb, lens) * alpha, alpha);
}`;

const FS = `#version 300 es
precision highp float;
in vec4 vColor;
out vec4 outColor;
void main() { outColor = vColor; }`;

function DitherCanvas({ onFail }: { onFail: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
    if (!canvas || !gl) return onFail();

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return onFail();

    const u = (n: string) => gl.getUniformLocation(prog, n);
    gl.bindVertexArray(gl.createVertexArray());
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const k = window.devicePixelRatio || 1;
    const T = k / Math.ceil(k / 1.5);
    const L = Math.max(2, Math.floor(2.5 * T));
    // Pekskärm saknar mus: låt färglinsen vandra över ansiktet av sig själv.
    const auto = !reduce && window.matchMedia('(hover: none)').matches;
    let progress = reduce ? 1 : 0;
    let texW = 1;
    let ready = false;
    let visible = false;
    let raf = 0;
    let last = 0;
    const lens = { x: 0, y: 0, r: 0 };
    const target = { x: 0, y: 0, r: 0 };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(r.width * T));
      const h = Math.max(1, Math.round(r.height * T));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
    };

    const draw = () => {
      if (!ready) return;
      const w = canvas.width;
      const h = canvas.height;
      const cols = Math.ceil(w / L);
      const rows = Math.ceil(h / L);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);
      gl.uniform2f(u('uRes'), w, h);
      gl.uniform1f(u('uCell'), L);
      gl.uniform1i(u('uCols'), cols);
      gl.uniform1f(u('uLod'), Math.max(0, Math.log2((texW / w) * L)));
      gl.uniform1f(u('uProgress'), progress);
      gl.uniform2f(u('uLens'), lens.x, lens.y);
      gl.uniform1f(u('uLensR'), lens.r);
      gl.uniform3f(u('uInk'), 1, 1, 1);
      gl.drawArrays(gl.POINTS, 0, cols * rows);
    };

    const frame = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) {
        last = 0;
        return;
      }
      const dt = last ? Math.min(now - last, 50) : 16;
      last = now;
      if (progress < 1) progress = Math.min(1, progress + dt / 1200);
      if (auto && progress >= 1) {
        const t = now / 1000;
        target.x = canvas.width * (0.5 + 0.16 * Math.sin(t * 0.7));
        target.y = canvas.height * (0.3 + 0.08 * Math.sin(t * 1.1 + 1));
        target.r = canvas.width * 0.3;
      }
      lens.x += (target.x - lens.x) * (1 - Math.pow(0.78, dt / 16));
      lens.y += (target.y - lens.y) * (1 - Math.pow(0.78, dt / 16));
      lens.r += (target.r - lens.r) * (1 - Math.pow(0.86, dt / 16));
      if (lens.r < 0.5 && target.r === 0) lens.r = 0;
      const moving = Math.abs(target.r - lens.r) > 0.5 || Math.hypot(target.x - lens.x, target.y - lens.y) > 0.5;
      draw();
      if (progress < 1 || moving || auto) raf = requestAnimationFrame(frame);
      else last = 0;
    };
    const kick = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) * T;
      const y = (e.clientY - r.top) * T;
      const inside = x > 0 && y > 0 && x < r.width * T && y < r.height * T * 0.8;
      if (inside && progress >= 1) {
        if (target.r === 0) {
          lens.x = x;
          lens.y = y;
        }
        target.x = x;
        target.y = y;
        target.r = r.width * T * 0.3;
      } else target.r = 0;
      kick();
    };
    const onLeave = () => {
      target.r = 0;
      kick();
    };

    const img = new Image();
    img.decoding = 'async';
    img.src = PORTRAIT_SRC;
    img.decode().then(() => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      texW = img.naturalWidth;
      ready = true;
      resize();
      draw();
      kick();
    }).catch(onFail);

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      kick();
    });
    io.observe(canvas);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.addEventListener('visibilitychange', kick);
    const lost = (e: Event) => {
      e.preventDefault();
      onFail();
    };
    canvas.addEventListener('webglcontextlost', lost);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', kick);
      canvas.removeEventListener('webglcontextlost', lost);
    };
  }, [onFail]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full [image-rendering:pixelated]" />;
}

// Punkt på ellipsen: vinkel i grader, 90° = längst fram (nederst).
function orbitPoint(deg: number, { W, H, ORBIT, PORTRAIT }: Layout) {
  const a = (deg * Math.PI) / 180;
  const t = (ORBIT.tilt * Math.PI) / 180;
  const ex = ORBIT.rx * Math.cos(a);
  const ey = ORBIT.ry * Math.sin(a);
  const x = ORBIT.cx + ex * Math.cos(t) - ey * Math.sin(t);
  const y = ORBIT.cy + ex * Math.sin(t) + ey * Math.cos(t);
  const s = Math.sin(a);
  const back = s < -0.08;
  return {
    left: (x / W) * 100,
    top: (y / H) * 100,
    back,
    behind: back && Math.abs(x - ORBIT.cx) < PORTRAIT.w * 0.4,
    depth: (s + 1) / 2,
  };
}

const PIN_IDS = ['flash-video-downloader', 'private-link-saver', 'done-together', 'parkisthlm', 'octos-army', 'secret-prompts'];
const PINS = PIN_IDS.map((id) => ALL_PROJECTS.find((p) => p.id === id)).filter((p): p is Project => !!p && !!p.images[0]);
const startAngle = (i: number) => -126 + (360 * i) / PINS.length;

function place(el: HTMLElement, deg: number, c: Layout) {
  const p = orbitPoint(deg, c);
  el.style.left = `${p.left}%`;
  el.style.top = `${p.top}%`;
  el.style.zIndex = p.back ? '2' : '20';
  el.style.opacity = String(0.8 + 0.2 * p.depth);
  el.dataset.behind = String(p.behind);
}

export function DitherOrbit({ className }: { className?: string }) {
  const [fallback, setFallback] = useState(false);
  const pinRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const held = useRef(false);
  const onFail = useCallback(() => setFallback(true), []);
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  const c = wide ? LAYOUTS.wide : LAYOUTS.tall;
  const { W, H, ORBIT, PORTRAIT } = c;

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let rot = 0;
    let last = 0;
    let raf = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (document.hidden || now - last < 33) return;
      if (last && !held.current) {
        rot += ((now - last) / 1e5) * 360;
        pinRefs.current.forEach((el, i) => el && place(el, startAngle(i) + rot, c));
      }
      last = now;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [c]);

  const ring = `M ${ORBIT.cx - ORBIT.rx} ${ORBIT.cy} A ${ORBIT.rx} ${ORBIT.ry} 0 0`;
  const ringEnd = `${ORBIT.cx + ORBIT.rx} ${ORBIT.cy}`;
  const ringProps = { fill: 'none', stroke: 'rgba(96,165,250,0.55)', strokeWidth: 1.5 } as const;
  const svgClass = 'pointer-events-none absolute inset-0 h-full w-full';
  const rot = `rotate(${ORBIT.tilt} ${ORBIT.cx} ${ORBIT.cy})`;

  return (
    <div className={className} style={{ aspectRatio: `${W} / ${H}` }}>
      <style>{`@keyframes pinFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
      <svg viewBox={`0 0 ${W} ${H}`} className={svgClass} style={{ zIndex: 1 }} aria-hidden>
        <path d={`${ring} 1 ${ringEnd}`} transform={rot} {...ringProps} />
      </svg>

      <div
        className="absolute z-[5]"
        style={{
          left: `${(((W - PORTRAIT.w) / 2 + PORTRAIT.dx) / W) * 100}%`,
          top: `${(PORTRAIT.y / H) * 100}%`,
          width: `${(PORTRAIT.w / W) * 100}%`,
          aspectRatio: String(PORTRAIT_ASPECT),
        }}
        aria-hidden
      >
        {fallback ? (
          <img src={PORTRAIT_SRC} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 grayscale" />
        ) : (
          <DitherCanvas onFail={onFail} />
        )}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className={svgClass} style={{ zIndex: 10 }} aria-hidden>
        <path d={`${ring} 0 ${ringEnd}`} transform={rot} {...ringProps} />
      </svg>

      {PINS.map((p, i) => {
        const pt = orbitPoint(startAngle(i), c);
        const name = p.name.split(':')[0];
        return (
          <a
            key={p.id}
            ref={(el) => {
              pinRefs.current[i] = el;
              if (el) place(el, startAngle(i), c);
            }}
            href={p.liveDemoUrl || p.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
            onPointerEnter={() => (held.current = true)}
            onPointerLeave={() => (held.current = false)}
            onFocus={() => (held.current = true)}
            onBlur={() => (held.current = false)}
            className="group absolute w-max -translate-x-1/2 -translate-y-1/2 outline-none hover:!z-30 hover:!opacity-100 focus-visible:!z-30"
            style={{ left: `${pt.left}%`, top: `${pt.top}%`, zIndex: pt.back ? 2 : 20 }}
          >
            <span className="block" style={{ animation: `pinFloat 5s ease-in-out ${-1.3 * i}s infinite` }}>
              <span className="block rounded-[14px] bg-gradient-to-br from-blue-400 to-indigo-600 p-[2px] shadow-lg shadow-blue-900/40 transition-transform duration-300 group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-white">
                <img src={p.images[0]} alt="" loading="lazy" className="block size-10 shrink-0 rounded-[12px] bg-neutral-900 object-cover sm:size-12 lg:size-14" />
              </span>
              <span className="pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/70 px-2 py-1 text-[10px] leading-none text-white backdrop-blur-md transition-opacity group-data-[behind=true]:opacity-0 group-hover:!opacity-100 sm:text-xs">
                {name}
              </span>
            </span>
          </a>
        );
      })}
    </div>
  );
}
