// The flow field. Thousands of particles are advected through the simplex
// vector field, leaving luminous, fading trails. Supports symmetry mirrors,
// pointer interaction, and deterministic high-resolution export.

import { Rng } from "./prng.js";
import { SimplexNoise } from "./noise.js";
import { PALETTES, samplePalette } from "./palettes.js";

const TAU = Math.PI * 2;

export const DEFAULT_CONFIG = {
  seed: "wisp-1000",
  palette: "tide",
  particles: 1800,
  noiseScale: 0.002, // smaller = smoother, broader currents
  speed: 1.2, // step length / time evolution
  persistence: 0.05, // backdrop fade alpha per frame (lower = longer trails)
  lineWidth: 1.1,
  symmetry: "none", // none | mirror-x | mirror-y | quad | kaleido
  curl: 1.0, // turbulence multiplier on the flow angle
};

export class FlowField {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = 0;
    this.h = 0;
    this.time = 0;

    this.pointer = { x: 0, y: 0, active: false };

    this._buildNoise();
    this.resize();
    this._buildTransforms();
    this._allocParticles();
    this.clear();
  }

  // --- setup ---------------------------------------------------------------

  _buildNoise() {
    this.noise = new SimplexNoise(this.config.seed);
    this.rng = new Rng(`field:${this.config.seed}`);
  }

  _allocParticles() {
    const n = this.config.particles;
    this.px = new Float32Array(n);
    this.py = new Float32Array(n);
    this.age = new Float32Array(n);
    this.life = new Float32Array(n);
    for (let i = 0; i < n; i++) this._spawn(i, true);
  }

  _spawn(i, initial = false) {
    this.px[i] = this.rng.range(0, this.w || 1);
    this.py[i] = this.rng.range(0, this.h || 1);
    this.life[i] = this.rng.range(40, 240);
    this.age[i] = initial ? this.rng.range(0, this.life[i]) : 0;
  }

  _buildTransforms() {
    const cx = this.w / 2;
    const cy = this.h / 2;
    const id = (x, y, out) => { out[0] = x; out[1] = y; };
    const mx = (x, y, out) => { out[0] = 2 * cx - x; out[1] = y; };
    const my = (x, y, out) => { out[0] = x; out[1] = 2 * cy - y; };
    const both = (x, y, out) => { out[0] = 2 * cx - x; out[1] = 2 * cy - y; };

    switch (this.config.symmetry) {
      case "mirror-x": this.transforms = [id, mx]; break;
      case "mirror-y": this.transforms = [id, my]; break;
      case "quad": this.transforms = [id, mx, my, both]; break;
      case "kaleido": {
        const rots = [];
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * TAU;
          const cos = Math.cos(a);
          const sin = Math.sin(a);
          rots.push((x, y, out) => {
            const dx = x - cx;
            const dy = y - cy;
            out[0] = cx + dx * cos - dy * sin;
            out[1] = cy + dx * sin + dy * cos;
          });
        }
        this.transforms = rots;
        break;
      }
      default: this.transforms = [id];
    }
  }

  // --- lifecycle -----------------------------------------------------------

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.w = Math.max(1, Math.floor(rect.width));
    this.h = Math.max(1, Math.floor(rect.height));
    this.canvas.width = Math.floor(this.w * this.dpr);
    this.canvas.height = Math.floor(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this._buildTransforms();
    this.clear();
  }

  clear() {
    const ctx = this.ctx;
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.fillStyle = PALETTES[this.config.palette].backdrop;
    ctx.fillRect(0, 0, this.w, this.h);
  }

  setConfig(patch) {
    const prev = this.config;
    this.config = { ...prev, ...patch };

    if (patch.seed !== undefined && patch.seed !== prev.seed) {
      this._buildNoise();
      this._allocParticles();
      this.clear();
    }
    if (patch.particles !== undefined && patch.particles !== prev.particles) {
      this._allocParticles();
    }
    if (patch.symmetry !== undefined && patch.symmetry !== prev.symmetry) {
      this._buildTransforms();
    }
    if (patch.palette !== undefined && patch.palette !== prev.palette) {
      this.clear();
    }
  }

  setPointer(x, y) {
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.active = true;
  }

  clearPointer() {
    this.pointer.active = false;
  }

  // --- per-frame -----------------------------------------------------------

  step(dtMs) {
    const ctx = this.ctx;
    const cfg = this.config;
    const palette = PALETTES[cfg.palette];
    const dt = Math.min(dtMs / 16.67, 2.2);
    this.time += dt * cfg.speed * 0.6;
    const z = this.time * 0.01;

    // Fade the previous frame toward the backdrop to create trails.
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = cfg.persistence;
    ctx.fillStyle = palette.backdrop;
    ctx.fillRect(0, 0, this.w, this.h);

    // Strands glow additively against the dark wash.
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = cfg.lineWidth;
    ctx.lineCap = "round";

    const ns = cfg.noiseScale;
    const stepLen = 1.4 * cfg.speed;
    const out0 = [0, 0];
    const out1 = [0, 0];
    const transforms = this.transforms;
    const pointer = this.pointer;

    for (let i = 0; i < this.px.length; i++) {
      const x = this.px[i];
      const y = this.py[i];

      const n = this.noise.noise3D(x * ns, y * ns, z);
      const angle = n * TAU * cfg.curl;
      let vx = Math.cos(angle) * stepLen * dt;
      let vy = Math.sin(angle) * stepLen * dt;

      // Pointer adds a tangential swirl within a radius.
      if (pointer.active) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const d2 = dx * dx + dy * dy;
        const R = 150;
        if (d2 < R * R) {
          const falloff = 1 - Math.sqrt(d2) / R;
          vx += -dy * 0.06 * falloff * dt;
          vy += dx * 0.06 * falloff * dt;
        }
      }

      const nx = x + vx;
      const ny = y + vy;

      const color = samplePalette(palette, (n + 1) * 0.5);
      ctx.strokeStyle = color;

      for (let t = 0; t < transforms.length; t++) {
        transforms[t](x, y, out0);
        transforms[t](nx, ny, out1);
        ctx.beginPath();
        ctx.moveTo(out0[0], out0[1]);
        ctx.lineTo(out1[0], out1[1]);
        ctx.stroke();
      }

      this.px[i] = nx;
      this.py[i] = ny;
      this.age[i] += dt;

      if (
        this.age[i] > this.life[i] ||
        nx < -10 || nx > this.w + 10 ||
        ny < -10 || ny > this.h + 10
      ) {
        this._spawn(i, false);
      }
    }
  }

  // --- export --------------------------------------------------------------

  /**
   * Render a crisp, dense version off-screen and return a PNG data URL.
   * Deterministic: same seed + config always yields the same image.
   */
  exportPNG(scale = 2, steps = 900) {
    const W = this.w * scale;
    const H = this.h * scale;
    const off = document.createElement("canvas");
    off.width = W;
    off.height = H;
    const ctx = off.getContext("2d");

    const cfg = this.config;
    const palette = PALETTES[cfg.palette];
    ctx.fillStyle = palette.backdrop;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = cfg.lineWidth * scale * 0.9;
    ctx.lineCap = "round";

    const rng = new Rng(`export:${cfg.seed}`);
    const noise = this.noise;
    const ns = cfg.noiseScale / scale;
    const n = cfg.particles;

    const xs = new Float32Array(n);
    const ys = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      xs[i] = rng.range(0, W);
      ys[i] = rng.range(0, H);
    }

    // Rebuild symmetry transforms at export resolution.
    const cx = W / 2;
    const cy = H / 2;
    const transforms = this._exportTransforms(cx, cy);
    const out0 = [0, 0];
    const out1 = [0, 0];
    const stepLen = 1.4 * cfg.speed * scale;

    for (let s = 0; s < steps; s++) {
      const z = s * 0.01 * cfg.speed * 0.6;
      for (let i = 0; i < n; i++) {
        const x = xs[i];
        const y = ys[i];
        const nval = noise.noise3D(x * ns, y * ns, z);
        const angle = nval * TAU * cfg.curl;
        const nx = x + Math.cos(angle) * stepLen;
        const ny = y + Math.sin(angle) * stepLen;

        ctx.strokeStyle = samplePalette(palette, (nval + 1) * 0.5);
        for (let t = 0; t < transforms.length; t++) {
          transforms[t](x, y, out0);
          transforms[t](nx, ny, out1);
          ctx.beginPath();
          ctx.moveTo(out0[0], out0[1]);
          ctx.lineTo(out1[0], out1[1]);
          ctx.stroke();
        }

        if (nx < 0 || nx > W || ny < 0 || ny > H) {
          xs[i] = rng.range(0, W);
          ys[i] = rng.range(0, H);
        } else {
          xs[i] = nx;
          ys[i] = ny;
        }
      }
    }

    return off.toDataURL("image/png");
  }

  _exportTransforms(cx, cy) {
    const id = (x, y, o) => { o[0] = x; o[1] = y; };
    const mx = (x, y, o) => { o[0] = 2 * cx - x; o[1] = y; };
    const my = (x, y, o) => { o[0] = x; o[1] = 2 * cy - y; };
    const both = (x, y, o) => { o[0] = 2 * cx - x; o[1] = 2 * cy - y; };
    switch (this.config.symmetry) {
      case "mirror-x": return [id, mx];
      case "mirror-y": return [id, my];
      case "quad": return [id, mx, my, both];
      case "kaleido": {
        const rots = [];
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * TAU;
          const cos = Math.cos(a);
          const sin = Math.sin(a);
          rots.push((x, y, o) => {
            const dx = x - cx;
            const dy = y - cy;
            o[0] = cx + dx * cos - dy * sin;
            o[1] = cy + dx * sin + dy * cos;
          });
        }
        return rots;
      }
      default: return [id];
    }
  }
}
