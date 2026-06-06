// All of Wisp's styling, delivered from JavaScript. There are no .css files;
// the rules below are injected into a <style> element at boot, and the document
// head (title, meta, fonts, favicon) is assembled here too. CSS is still the
// browser's only styling mechanism, but nothing here is authored as a separate
// stylesheet — it is one JS module.

export const CSS = String.raw`
/* Reset ---------------------------------------------------------------- */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  -webkit-text-size-adjust: 100%;
  scroll-behavior: smooth;
}

body {
  min-height: 100%;
  line-height: 1.55;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

img,
picture,
svg,
canvas {
  display: block;
  max-width: 100%;
}

button,
input,
select,
textarea {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
}

button {
  cursor: pointer;
}

a {
  color: inherit;
  text-decoration: none;
}

ul {
  list-style: none;
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 3px;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
/* Design tokens ------------------------------------------------------- */
:root {
  /* Type */
  --font-display: "Fraunces", "Iowan Old Style", Georgia, serif;
  --font-ui: "Hanken Grotesk", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Spline Sans Mono", ui-monospace, "SFMono-Regular", monospace;

  /* Radii */
  --r-sm: 8px;
  --r: 12px;
  --r-lg: 18px;
  --r-pill: 999px;

  /* Motion */
  --ease: cubic-bezier(0.2, 0.7, 0.2, 1);
  --dur: 0.35s;

  /* Dark theme (default) */
  --ink: #08090c;
  --ink-2: #0c0e12;
  --surface: #101319;
  --surface-2: #161a22;
  --surface-3: #1d222c;
  --hairline: rgba(233, 230, 222, 0.09);
  --hairline-2: rgba(233, 230, 222, 0.16);
  --text: #e9e6de;
  --text-2: #a6abb4;
  --text-3: #6b7079;
  --accent: #e8a33d;
  --accent-2: #f4c275;
  --accent-press: #d4912e;
  --accent-ink: #160f02;
  --glow: rgba(232, 163, 61, 0.45);
  --shadow: 0 24px 60px -28px rgba(0, 0, 0, 0.75);
  --shadow-lg: 0 40px 100px -40px rgba(0, 0, 0, 0.85);
  --grain-opacity: 0.05;
}

:root[data-theme="light"] {
  --ink: #ece6da;
  --ink-2: #e5dece;
  --surface: #f4efe6;
  --surface-2: #fbf8f1;
  --surface-3: #ffffff;
  --hairline: rgba(26, 20, 8, 0.12);
  --hairline-2: rgba(26, 20, 8, 0.22);
  --text: #20201c;
  --text-2: #5a554c;
  --text-3: #8a8478;
  --accent: #b56b16;
  --accent-2: #c9842c;
  --accent-press: #99590f;
  --accent-ink: #fff7ea;
  --glow: rgba(181, 107, 22, 0.3);
  --shadow: 0 24px 60px -32px rgba(60, 45, 20, 0.35);
  --shadow-lg: 0 40px 100px -44px rgba(60, 45, 20, 0.4);
  --grain-opacity: 0.035;
}
/* Base ---------------------------------------------------------------- */
body {
  font-family: var(--font-ui);
  color: var(--text);
  background-color: var(--ink);
  background-image:
    radial-gradient(1200px 700px at 78% -8%, color-mix(in oklab, var(--accent) 16%, transparent), transparent 60%),
    radial-gradient(900px 600px at 8% 4%, rgba(80, 130, 160, 0.12), transparent 55%);
  background-attachment: fixed;
  transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease);
  overflow-x: hidden;
}

/* Fine film grain over everything for tactile atmosphere. */
body::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: var(--grain-opacity);
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

h1, h2, h3 {
  font-family: var(--font-display);
  font-weight: 380;
  line-height: 1.02;
  letter-spacing: -0.015em;
  font-optical-sizing: auto;
}

.mono {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--text-3);
}

::selection {
  background: var(--accent);
  color: var(--accent-ink);
}

/* Scrollbar */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--hairline-2) transparent;
}
*::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
*::-webkit-scrollbar-thumb {
  background: var(--hairline-2);
  border-radius: var(--r-pill);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
/* Layout -------------------------------------------------------------- */
.wrap {
  width: min(1240px, 100% - 3rem);
  margin-inline: auto;
}

/* Top bar */
.topbar {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem clamp(1rem, 3vw, 2rem);
  backdrop-filter: blur(14px) saturate(1.2);
  background: color-mix(in oklab, var(--ink) 62%, transparent);
  border-bottom: 1px solid var(--hairline);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--font-display);
  font-size: 1.32rem;
  letter-spacing: -0.02em;
}
.brand__mark {
  color: var(--accent);
  font-size: 1.1rem;
  filter: drop-shadow(0 0 10px var(--glow));
}

.nav {
  display: flex;
  align-items: center;
  gap: clamp(0.6rem, 2vw, 1.8rem);
}
.nav__link {
  font-size: 0.86rem;
  color: var(--text-2);
  transition: color var(--dur) var(--ease);
}
.nav__link:hover { color: var(--text); }
.nav__sep { width: 1px; height: 20px; background: var(--hairline-2); }

@media (max-width: 720px) {
  .nav__link.is-collapsible { display: none; }
}

/* Hero */
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.hero__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
.hero::before { /* legibility vignette */
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(to top, var(--ink) 2%, transparent 42%),
    radial-gradient(120% 90% at 30% 110%, color-mix(in oklab, var(--ink) 70%, transparent), transparent 60%);
  pointer-events: none;
}
.hero__content {
  position: relative;
  z-index: 2;
  width: min(1240px, 100% - 3rem);
  margin: 0 auto;
  padding-block: clamp(3rem, 8vh, 7rem);
}
.hero__title {
  font-size: clamp(3.2rem, 13vw, 10.5rem);
  max-width: 14ch;
}
.hero__title em {
  font-style: italic;
  color: var(--accent);
  font-weight: 340;
}
.hero__lede {
  margin-top: 1.4rem;
  max-width: 46ch;
  color: var(--text-2);
  font-size: clamp(1rem, 1.5vw, 1.2rem);
}
.hero__cta {
  margin-top: 2.2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}
.hero__scroll {
  position: absolute;
  right: clamp(1rem, 3vw, 2rem);
  bottom: 1.6rem;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--text-3);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
.hero__scroll span { writing-mode: vertical-rl; }

/* Section scaffolding */
.section {
  padding-block: clamp(4rem, 10vh, 8rem);
}
.section__head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 2.4rem;
  flex-wrap: wrap;
}
.section__title {
  font-size: clamp(2rem, 5vw, 3.4rem);
}
.section__note {
  max-width: 38ch;
  color: var(--text-2);
}

/* Studio: stage + control rail */
.studio__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 1.5rem;
  align-items: start;
}
@media (max-width: 980px) {
  .studio__grid { grid-template-columns: 1fr; }
}
.stage {
  position: relative;
  border: 1px solid var(--hairline-2);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  background: #08090c;
}
.stage__canvas {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 11;
  cursor: crosshair;
}
@media (max-width: 980px) {
  .stage__canvas { aspect-ratio: 4 / 3; }
}
.stage__readout {
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.2rem;
  padding: 0.7rem 0.9rem;
  background: linear-gradient(to top, rgba(4, 5, 7, 0.86), transparent);
  pointer-events: none;
}
.stage__corner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 1px solid var(--accent);
  opacity: 0.5;
  pointer-events: none;
}
.stage__corner--tl { top: 12px; left: 12px; border-right: 0; border-bottom: 0; }
.stage__corner--tr { top: 12px; right: 12px; border-left: 0; border-bottom: 0; }
.stage__corner--bl { bottom: 12px; left: 12px; border-right: 0; border-top: 0; }
.stage__corner--br { bottom: 12px; right: 12px; border-left: 0; border-top: 0; }

.rail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Gallery */
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

/* About */
.about__grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: clamp(1.5rem, 5vw, 4rem);
}
@media (max-width: 820px) {
  .about__grid { grid-template-columns: 1fr; }
}
.prose p { color: var(--text-2); margin-top: 1rem; max-width: 60ch; }
.prose p:first-child { margin-top: 0; }
.prose strong { color: var(--text); font-weight: 600; }

/* Footer */
.footer {
  border-top: 1px solid var(--hairline);
  padding-block: 2.4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  color: var(--text-3);
  font-size: 0.85rem;
}
/* Components ---------------------------------------------------------- */

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 1.15rem;
  border-radius: var(--r-pill);
  border: 1px solid var(--hairline-2);
  background: var(--surface-2);
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  transition: transform var(--dur) var(--ease), background var(--dur) var(--ease),
    border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
}
.btn:hover { transform: translateY(-1px); border-color: var(--hairline-2); background: var(--surface-3); }
.btn:active { transform: translateY(0); }

.btn--primary {
  background: var(--accent);
  color: var(--accent-ink);
  border-color: transparent;
  box-shadow: 0 8px 26px -10px var(--glow);
}
.btn--primary:hover { background: var(--accent-2); }

.btn--ghost { background: transparent; }

.btn--icon {
  width: 42px;
  height: 42px;
  padding: 0;
  border-radius: var(--r);
}

.btn--block { width: 100%; }

/* Theme toggle */
.theme-toggle {
  width: 42px;
  height: 42px;
  border-radius: var(--r-pill);
  border: 1px solid var(--hairline-2);
  display: grid;
  place-items: center;
  color: var(--text-2);
  transition: color var(--dur) var(--ease), border-color var(--dur) var(--ease);
}
.theme-toggle:hover { color: var(--accent); border-color: var(--accent); }
.theme-toggle .icon-sun { display: none; }
.theme-toggle .icon-moon { display: block; }
:root[data-theme="light"] .theme-toggle .icon-sun { display: block; }
:root[data-theme="light"] .theme-toggle .icon-moon { display: none; }

/* Panel */
.panel {
  background: color-mix(in oklab, var(--surface) 88%, transparent);
  border: 1px solid var(--hairline);
  border-radius: var(--r-lg);
  padding: 1.1rem 1.15rem 1.25rem;
  box-shadow: var(--shadow);
}
.panel__title {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--text-3);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.panel__title::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--hairline);
}

/* Field (slider) group */
.field {
  margin-bottom: 1.05rem;
}
.field:last-child { margin-bottom: 0; }
.field__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 0.45rem;
}
.field__label { font-size: 0.86rem; color: var(--text); }
.field__value {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--accent);
  background: color-mix(in oklab, var(--accent) 12%, transparent);
  padding: 0.05rem 0.45rem;
  border-radius: var(--r-sm);
}

/* Range slider */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 22px;
  background: transparent;
  cursor: pointer;
}
input[type="range"]::-webkit-slider-runnable-track {
  height: 3px;
  border-radius: var(--r-pill);
  background: linear-gradient(to right, var(--accent), var(--accent) 0%, var(--hairline-2) 0%);
  background: var(--hairline-2);
}
input[type="range"]::-moz-range-track {
  height: 3px;
  border-radius: var(--r-pill);
  background: var(--hairline-2);
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  margin-top: -6.5px;
  border-radius: 50%;
  background: var(--accent);
  border: 3px solid var(--surface);
  box-shadow: 0 0 0 1px var(--accent), 0 0 14px -2px var(--glow);
  transition: transform 0.15s var(--ease);
}
input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent);
  border: 3px solid var(--surface);
  box-shadow: 0 0 0 1px var(--accent);
}
input[type="range"]:hover::-webkit-slider-thumb { transform: scale(1.15); }
input[type="range"]:active::-webkit-slider-thumb { transform: scale(0.95); }

/* Swatches (palette) */
.swatches {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}
.swatch {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.4rem;
  border-radius: var(--r);
  border: 1px solid var(--hairline);
  transition: border-color var(--dur) var(--ease), transform var(--dur) var(--ease);
}
.swatch:hover { transform: translateY(-2px); border-color: var(--hairline-2); }
.swatch__chip {
  height: 34px;
  border-radius: var(--r-sm);
  border: 1px solid var(--hairline);
}
.swatch__name {
  font-size: 0.72rem;
  color: var(--text-2);
  text-align: center;
}
.swatch.is-active {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent), 0 0 18px -6px var(--glow);
}
.swatch.is-active .swatch__name { color: var(--text); }

/* Segmented control (symmetry) */
.segmented {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.segmented button {
  flex: 1 1 auto;
  padding: 0.45rem 0.6rem;
  font-size: 0.78rem;
  border-radius: var(--r-sm);
  border: 1px solid var(--hairline);
  color: var(--text-2);
  background: var(--surface-2);
  transition: all var(--dur) var(--ease);
  white-space: nowrap;
}
.segmented button:hover { color: var(--text); border-color: var(--hairline-2); }
.segmented button.is-active {
  color: var(--accent-ink);
  background: var(--accent);
  border-color: transparent;
}

/* Seed input */
.seed {
  display: flex;
  gap: 0.5rem;
}
.seed__input {
  flex: 1;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  padding: 0.6rem 0.7rem;
  border-radius: var(--r);
  border: 1px solid var(--hairline-2);
  background: var(--ink-2);
  color: var(--text);
  transition: border-color var(--dur) var(--ease);
}
.seed__input:focus { outline: none; border-color: var(--accent); }

/* Readout */
.read {
  display: inline-flex;
  align-items: baseline;
  gap: 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.74rem;
}
.read__k { color: var(--text-3); text-transform: uppercase; letter-spacing: 0.12em; }
.read__v { color: var(--accent-2); }

/* Cards (gallery presets) */
.card {
  display: flex;
  flex-direction: column;
  text-align: left;
  border-radius: var(--r-lg);
  overflow: hidden;
  border: 1px solid var(--hairline);
  background: var(--surface);
  transition: transform var(--dur) var(--ease), border-color var(--dur) var(--ease),
    box-shadow var(--dur) var(--ease);
}
.card:hover {
  transform: translateY(-4px);
  border-color: var(--hairline-2);
  box-shadow: var(--shadow);
}
.card__art {
  display: block;
  height: 130px;
  filter: saturate(1.1) contrast(1.05);
  position: relative;
}
.card__art::after {
  content: "";
  position: absolute;
  inset: 0;
  box-shadow: inset 0 -40px 50px -30px rgba(0, 0, 0, 0.6);
}
.card__body { padding: 0.85rem 0.95rem 1rem; display: flex; flex-direction: column; gap: 0.3rem; }
.card__name { font-family: var(--font-display); font-size: 1.25rem; }
.card__blurb { font-size: 0.85rem; color: var(--text-2); }
.card__meta {
  margin-top: 0.35rem;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-3);
}

/* Keyboard legend */
.keys { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 1.4rem; }
.keys li { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--text-2); font-size: 0.85rem; }
kbd {
  font-family: var(--font-mono);
  font-size: 0.74rem;
  min-width: 1.7rem;
  text-align: center;
  padding: 0.2rem 0.45rem;
  border-radius: var(--r-sm);
  border: 1px solid var(--hairline-2);
  border-bottom-width: 2px;
  background: var(--surface-2);
  color: var(--text);
}

/* Toast */
.toast {
  position: fixed;
  left: 50%;
  bottom: 2rem;
  z-index: 200;
  transform: translate(-50%, 130%);
  padding: 0.7rem 1.1rem;
  border-radius: var(--r-pill);
  background: var(--surface-3);
  border: 1px solid var(--hairline-2);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  box-shadow: var(--shadow);
  opacity: 0;
  transition: transform 0.45s var(--ease), opacity 0.45s var(--ease);
}
.toast.is-visible { transform: translate(-50%, 0); opacity: 1; }

.export-row { display: flex; gap: 0.5rem; align-items: stretch; }
.select {
  border: 1px solid var(--hairline-2);
  border-radius: var(--r-pill);
  background: var(--surface-2);
  padding: 0 0.85rem;
  font-size: 0.85rem;
  color: var(--text);
}

/* Load-in reveal */
@keyframes rise {
  from { opacity: 0; transform: translateY(22px); }
  to { opacity: 1; transform: translateY(0); }
}
.reveal { opacity: 0; animation: rise 0.9s var(--ease) forwards; }
.reveal-1 { animation-delay: 0.15s; }
.reveal-2 { animation-delay: 0.32s; }
.reveal-3 { animation-delay: 0.5s; }
.reveal-4 { animation-delay: 0.66s; }

@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; animation: none; }
}
`;

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..500&family=Hanken+Grotesk:wght@400;500;600;700&family=Spline+Sans+Mono:wght@400;500&display=swap";

const DESCRIPTION =
  "Wisp is a generative-art studio. Paint with flow fields, tune the currents, " +
  "and export the drift as a high-resolution print. Every artwork is reproducible from a seed.";

function meta(attrs) {
  const el = document.createElement("meta");
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.head.appendChild(el);
}

function linkTag(attrs) {
  const el = document.createElement("link");
  for (const [k, v] of Object.entries(attrs)) {
    if (v === true) el.setAttribute(k, "");
    else if (v != null) el.setAttribute(k, String(v));
  }
  document.head.appendChild(el);
}

// Assemble <head> and inject the stylesheet. Called once at boot.
export function injectStyles() {
  const root = document.documentElement;
  root.lang = "en";
  if (!root.dataset.theme) root.dataset.theme = "dark";

  document.title = "Wisp — a generative-art studio";
  meta({ name: "viewport", content: "width=device-width, initial-scale=1.0" });
  meta({ name: "description", content: DESCRIPTION });
  meta({ name: "color-scheme", content: "dark light" });

  linkTag({ rel: "icon", type: "image/svg+xml", href: "assets/favicon.svg" });
  linkTag({ rel: "preconnect", href: "https://fonts.googleapis.com" });
  linkTag({ rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: true });
  linkTag({ rel: "stylesheet", href: FONTS_HREF });

  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);
}
