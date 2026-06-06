// Bootstraps Wisp: builds the palette + gallery UI from data, creates the
// ambient hero field and the interactive studio field, and runs the loop.

import { FlowField } from "./field.js";
import { Controls } from "./controls.js";
import { FpsMeter } from "./stats.js";
import { PALETTES, PALETTE_KEYS } from "./palettes.js";
import { PRESETS } from "./presets.js";
import { randomSeed } from "./prng.js";
import { injectStyles } from "./styles.js";
import { buildView } from "./view.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// --- build data-driven UI ---------------------------------------------------

function gradientFor(palette) {
  return `linear-gradient(135deg, ${palette.stops.join(", ")})`;
}

function buildPalette() {
  const container = document.querySelector("#palette-swatches");
  container.innerHTML = PALETTE_KEYS.map((key) => {
    const p = PALETTES[key];
    return `
      <button class="swatch" data-palette="${key}" aria-pressed="false" title="${p.name}">
        <span class="swatch__chip" style="background:${gradientFor(p)}"></span>
        <span class="swatch__name">${p.name}</span>
      </button>`;
  }).join("");
}

function buildGallery(onPick) {
  const gallery = document.querySelector("#gallery");
  gallery.innerHTML = PRESETS.map((preset) => {
    const p = PALETTES[preset.config.palette];
    return `
      <button class="card" data-preset="${preset.id}">
        <span class="card__art" style="background:${gradientFor(p)}"></span>
        <span class="card__body">
          <span class="card__name">${preset.name}</span>
          <span class="card__blurb">${preset.blurb}</span>
          <span class="card__meta">${PALETTES[preset.config.palette].name} \u00b7 ${preset.config.symmetry}</span>
        </span>
      </button>`;
  }).join("");

  gallery.addEventListener("click", (e) => {
    const card = e.target.closest("[data-preset]");
    if (!card) return;
    const preset = PRESETS.find((p) => p.id === card.dataset.preset);
    if (preset) onPick(preset);
  });
}

// --- visibility-aware stepping ----------------------------------------------

function observeVisibility(canvas, onChange) {
  const io = new IntersectionObserver(
    ([entry]) => onChange(entry.isIntersecting),
    { threshold: 0.01 }
  );
  io.observe(canvas);
}

// --- main --------------------------------------------------------------------

function main() {
  // Single-language bootstrap: assemble <head> + stylesheet, then the whole
  // page body — all in JavaScript — before binding the engine to it.
  injectStyles();
  buildView();

  buildPalette();

  const heroCanvas = document.querySelector("#hero-canvas");
  const studioCanvas = document.querySelector("#field-canvas");

  // Ambient hero field: gentle, fewer particles, always drifting.
  const heroField = new FlowField(heroCanvas, {
    seed: "wisp-hero",
    palette: "tide",
    particles: 1000,
    noiseScale: 0.0016,
    speed: 0.9,
    persistence: 0.045,
    lineWidth: 1.0,
    symmetry: "mirror-x",
    curl: 1.0,
  });

  // Interactive studio field.
  const studioField = new FlowField(studioCanvas, {
    seed: randomSeed(),
    palette: "ember",
    particles: 1800,
    noiseScale: 0.0022,
    speed: 1.2,
    persistence: 0.05,
    lineWidth: 1.1,
    symmetry: "none",
    curl: 1.1,
  });

  let playing = !reduceMotion;
  const fps = new FpsMeter();
  const fpsEl = document.querySelector("#read-fps");

  const toastEl = document.querySelector("#toast");
  let toastTimer = null;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 1800);
  };

  const controls = new Controls(studioField, {
    isPlaying: () => playing,
    setPlaying: (b) => {
      playing = b;
      const btn = document.querySelector("#btn-play");
      btn.dataset.playing = String(b);
      btn.querySelector(".btn-label").textContent = b ? "Pause" : "Play";
    },
    toast,
  });

  buildGallery((preset) => {
    controls.applyConfig(preset.config);
    toast(`Loaded \u00b7 ${preset.name}`);
    document.querySelector("#studio").scrollIntoView({ behavior: "smooth" });
  });

  // Visibility gating so off-screen canvases don't burn CPU.
  let heroVisible = true;
  let studioVisible = true;
  observeVisibility(heroCanvas, (v) => (heroVisible = v));
  observeVisibility(studioCanvas, (v) => (studioVisible = v));

  // Pointer interaction on the studio canvas.
  const updatePointer = (e) => {
    const rect = studioCanvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    studioField.setPointer(point.clientX - rect.left, point.clientY - rect.top);
  };
  studioCanvas.addEventListener("pointermove", updatePointer);
  studioCanvas.addEventListener("pointerleave", () => studioField.clearPointer());

  // Resize (debounced).
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      heroField.resize();
      studioField.resize();
    }, 120);
  });

  // Hero CTAs.
  document.querySelector("#cta-enter").addEventListener("click", () => {
    document.querySelector("#studio").scrollIntoView({ behavior: "smooth" });
  });
  document.querySelector("#cta-shuffle").addEventListener("click", () => {
    const seed = randomSeed();
    controls.applyConfig({ ...studioField.config, seed });
    heroField.setConfig({ seed: `hero-${seed}` });
    toast(`New seed \u00b7 ${seed}`);
  });

  // Theme toggle (persisted; guarded for restricted environments).
  const themeToggle = document.querySelector("#theme-toggle");
  const setTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    themeToggle.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
    try { localStorage.setItem("wisp-theme", theme); } catch { /* ignore */ }
  };
  let initialTheme = "dark";
  try { initialTheme = localStorage.getItem("wisp-theme") || "dark"; } catch { /* ignore */ }
  setTheme(initialTheme);
  themeToggle.addEventListener("click", () => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });

  // Animation loop.
  let last = performance.now();
  function frame(now) {
    const dt = now - last;
    last = now;

    if (heroVisible) heroField.step(dt);
    if (playing && studioVisible) studioField.step(dt);

    fpsEl.textContent = Math.round(fps.tick(now)) + " fps";
    requestAnimationFrame(frame);
  }

  if (reduceMotion) {
    // Honour reduced motion: paint a few frames, then hold a still image.
    for (let i = 0; i < 160; i++) {
      heroField.step(16);
      studioField.step(16);
    }
    fpsEl.textContent = "paused";
    const btn = document.querySelector("#btn-play");
    btn.dataset.playing = "false";
    btn.querySelector(".btn-label").textContent = "Play";
  } else {
    requestAnimationFrame(frame);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
