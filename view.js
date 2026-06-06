// Builds Wisp's entire page in JavaScript — no hand-written HTML body. Every
// element, id, and class mirrors the original markup so the engine, controls,
// and main loop bind to it unchanged. Called once at boot, after injectStyles().

import { h, s } from "./h.js";

// --- small SVG icon factories ----------------------------------------------

function brandMark() {
  return s(
    "svg",
    { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 1.7, "stroke-linecap": "round" },
    s("path", { d: "M3 16c4 0 4-8 8-8s4 8 8 8" }),
    s("path", { d: "M5 11c3 0 3-5 6-5", opacity: 0.5 })
  );
}

function moonIcon() {
  return s(
    "svg",
    { class: "icon-moon", width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 1.7, "stroke-linecap": "round", "stroke-linejoin": "round" },
    s("path", { d: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" })
  );
}

function sunIcon() {
  return s(
    "svg",
    { class: "icon-sun", width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 1.7, "stroke-linecap": "round" },
    s("circle", { cx: 12, cy: 12, r: 4 }),
    s("path", { d: "M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" })
  );
}

function diceIcon() {
  return s(
    "svg",
    { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 1.7, "stroke-linejoin": "round" },
    s("rect", { x: 3, y: 3, width: 18, height: 18, rx: 4 }),
    s("circle", { cx: 8, cy: 8, r: 1.3, fill: "currentColor" }),
    s("circle", { cx: 16, cy: 8, r: 1.3, fill: "currentColor" }),
    s("circle", { cx: 12, cy: 12, r: 1.3, fill: "currentColor" }),
    s("circle", { cx: 8, cy: 16, r: 1.3, fill: "currentColor" }),
    s("circle", { cx: 16, cy: 16, r: 1.3, fill: "currentColor" })
  );
}

// --- composite pieces -------------------------------------------------------

function topbar() {
  return h(
    "header",
    { class: "topbar" },
    h(
      "a",
      { class: "brand", href: "#top", "aria-label": "Wisp home" },
      h("span", { class: "brand__mark", "aria-hidden": "true" }, brandMark()),
      "Wisp"
    ),
    h(
      "nav",
      { class: "nav" },
      h("a", { class: "nav__link is-collapsible", href: "#studio" }, "Studio"),
      h("a", { class: "nav__link is-collapsible", href: "#gallery" }, "Gallery"),
      h("a", { class: "nav__link is-collapsible", href: "#about" }, "About"),
      h("span", { class: "nav__sep is-collapsible", "aria-hidden": "true" }),
      h(
        "button",
        { id: "theme-toggle", class: "theme-toggle", type: "button", "aria-label": "Switch theme" },
        moonIcon(),
        sunIcon()
      )
    )
  );
}

function hero() {
  return h(
    "section",
    { class: "hero" },
    h("canvas", { id: "hero-canvas", class: "hero__canvas", "aria-hidden": "true" }),
    h(
      "div",
      { class: "hero__content" },
      h("p", { class: "eyebrow reveal reveal-1" }, "Generative art studio"),
      h("h1", { class: "hero__title reveal reveal-2" }, "Paint with ", h("em", null, "currents.")),
      h(
        "p",
        { class: "hero__lede reveal reveal-3" },
        "Wisp advects thousands of particles through an invisible field of noise. " +
          "Tune the turbulence, fold it through symmetry, and capture the drift — " +
          "every piece reproducible from a single seed."
      ),
      h(
        "div",
        { class: "hero__cta reveal reveal-4" },
        h("button", { id: "cta-enter", class: "btn btn--primary", type: "button" }, "Enter the studio"),
        h("button", { id: "cta-shuffle", class: "btn btn--ghost", type: "button" }, "Shuffle the field")
      )
    ),
    h("div", { class: "hero__scroll", "aria-hidden": "true" }, h("span", null, "scroll"))
  );
}

function sectionHead(eyebrow, title, note) {
  return h(
    "div",
    { class: "section__head" },
    h("div", null, h("p", { class: "eyebrow" }, eyebrow), h("h2", { class: "section__title" }, title)),
    h("p", { class: "section__note" }, note)
  );
}

function slider({ id, label, value, display, min, max, step }) {
  return h(
    "div",
    { class: "field" },
    h(
      "div",
      { class: "field__head" },
      h("label", { class: "field__label", for: `ctl-${id}` }, label),
      h("span", { class: "field__value", id: `val-${id}` }, display)
    ),
    h("input", { type: "range", id: `ctl-${id}`, min, max, step, value })
  );
}

function readout(key, valueId) {
  return h(
    "span",
    { class: "read" },
    h("span", { class: "read__k" }, key),
    h("span", { class: "read__v", id: valueId }, "—")
  );
}

function symmetryButton(value, label, pressed) {
  return h("button", { type: "button", "data-symmetry": value, "aria-pressed": String(pressed) }, label);
}

function studio() {
  const stage = h(
    "div",
    { class: "stage" },
    h("canvas", { id: "field-canvas", class: "stage__canvas", "aria-label": "Generative artwork canvas" }),
    h("span", { class: "stage__corner stage__corner--tl" }),
    h("span", { class: "stage__corner stage__corner--tr" }),
    h("span", { class: "stage__corner stage__corner--bl" }),
    h("span", { class: "stage__corner stage__corner--br" }),
    h(
      "div",
      { class: "stage__readout" },
      readout("seed", "read-seed"),
      readout("palette", "read-palette"),
      readout("symmetry", "read-symmetry"),
      readout("particles", "read-particles"),
      readout("render", "read-fps")
    )
  );

  const fieldPanel = h(
    "div",
    { class: "panel" },
    h("p", { class: "panel__title" }, "Field"),
    slider({ id: "turbulence", label: "Turbulence", value: "1.1", display: "1.10", min: "0.4", max: "2", step: "0.05" }),
    slider({ id: "scale", label: "Field scale", value: "0.0022", display: "0.0022", min: "0.0008", max: "0.004", step: "0.0001" }),
    slider({ id: "speed", label: "Flow speed", value: "1.2", display: "1.20×", min: "0.4", max: "2.4", step: "0.05" }),
    slider({ id: "trails", label: "Trails", value: "79", display: "79%", min: "0", max: "100", step: "1" }),
    slider({ id: "particles", label: "Particles", value: "1800", display: "1800", min: "400", max: "3600", step: "100" }),
    slider({ id: "weight", label: "Line weight", value: "1.1", display: "1.1 px", min: "0.5", max: "2.5", step: "0.1" })
  );

  const palettePanel = h(
    "div",
    { class: "panel" },
    h("p", { class: "panel__title" }, "Palette"),
    h("div", { id: "palette-swatches", class: "swatches" })
  );

  const symmetryPanel = h(
    "div",
    { class: "panel" },
    h("p", { class: "panel__title" }, "Symmetry"),
    h(
      "div",
      { id: "symmetry-control", class: "segmented" },
      symmetryButton("none", "None", true),
      symmetryButton("mirror-x", "Mirror X", false),
      symmetryButton("mirror-y", "Mirror Y", false),
      symmetryButton("quad", "Quad", false),
      symmetryButton("kaleido", "Kaleido", false)
    )
  );

  const seedPanel = h(
    "div",
    { class: "panel" },
    h("p", { class: "panel__title" }, "Seed"),
    h(
      "div",
      { class: "seed" },
      h("input", {
        type: "text",
        id: "seed-input",
        class: "seed__input",
        spellcheck: "false",
        autocomplete: "off",
        "aria-label": "Seed string",
        placeholder: "seed string",
      }),
      h(
        "button",
        { type: "button", id: "seed-random", class: "btn btn--icon", "aria-label": "Random seed", title: "Random seed" },
        diceIcon()
      )
    )
  );

  const capturePanel = h(
    "div",
    { class: "panel" },
    h("p", { class: "panel__title" }, "Capture"),
    h(
      "button",
      { type: "button", id: "btn-play", class: "btn btn--primary btn--block", "data-playing": "true", "aria-pressed": "true", style: "margin-bottom:0.6rem" },
      h("span", { class: "btn-label" }, "Pause")
    ),
    h("button", { type: "button", id: "btn-regenerate", class: "btn btn--ghost btn--block", style: "margin-bottom:0.6rem" }, "Regenerate"),
    h(
      "div",
      { class: "export-row" },
      h(
        "select",
        { id: "export-scale", class: "select", "aria-label": "Export resolution" },
        h("option", { value: "1" }, "1×"),
        h("option", { value: "2", selected: true }, "2×"),
        h("option", { value: "4" }, "4×")
      ),
      h("button", { type: "button", id: "btn-export", class: "btn btn--primary", style: "flex:1" }, "Export PNG")
    )
  );

  const rail = h("div", { class: "rail" }, fieldPanel, palettePanel, symmetryPanel, seedPanel, capturePanel);

  return h(
    "section",
    { id: "studio", class: "section wrap" },
    sectionHead(
      "01 — Studio",
      "Tune the field",
      "Drag your cursor across the canvas to disturb the flow. Adjust the controls and the field responds live."
    ),
    h("div", { class: "studio__grid" }, stage, rail)
  );
}

function gallery() {
  return h(
    "section",
    { class: "section wrap" },
    sectionHead("02 — Gallery", "Starting points", "Load a preset to drop its exact recipe into the studio, then make it your own."),
    h("div", { id: "gallery", class: "gallery" })
  );
}

function about() {
  const keys = h(
    "ul",
    { class: "keys" },
    h("li", null, h("kbd", null, "Space"), " play / pause"),
    h("li", null, h("kbd", null, "R"), " new seed"),
    h("li", null, h("kbd", null, "E"), " export"),
    h("li", null, h("kbd", null, "C"), " clear")
  );

  const prose = h(
    "div",
    { class: "prose" },
    h(
      "p",
      null,
      "Beneath the canvas lives an invisible ",
      h("strong", null, "vector field"),
      " generated by 3D simplex noise. Each particle reads the field at its position, turns to face the local current, and steps forward — leaving a luminous trail that fades into the dark."
    ),
    h(
      "p",
      null,
      "The third noise dimension is ",
      h("strong", null, "time"),
      ", so the whole field breathes and evolves. Symmetry folds the strands across mirrors or rotational axes; the palette colours them by the angle of flow."
    ),
    h(
      "p",
      null,
      "Because the noise and particle placement are driven by a ",
      h("strong", null, "seeded generator"),
      ", a seed string always paints the same picture — and export re-runs that recipe at full resolution for a crisp print."
    )
  );

  return h(
    "section",
    { id: "about", class: "section wrap" },
    h(
      "div",
      { class: "about__grid" },
      h(
        "div",
        null,
        h("p", { class: "eyebrow" }, "03 — About"),
        h("h2", { class: "section__title", style: "margin-top:0.6rem" }, "How it works"),
        keys
      ),
      prose
    )
  );
}

function footer() {
  return h(
    "footer",
    { class: "footer wrap" },
    h("span", null, "Wisp · generative-art studio"),
    h("span", { class: "mono" }, "no dependencies · pure canvas · pure JavaScript")
  );
}

// Mount the whole interface onto document.body.
export function buildView() {
  const main = h("main", { id: "top" }, hero(), studio(), gallery(), about());
  document.body.append(topbar(), main, footer(), h("div", { id: "toast", class: "toast", role: "status", "aria-live": "polite" }));
}
