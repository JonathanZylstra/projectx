// Wires the DOM controls to the FlowField engine and keeps the readout in sync.

import { PALETTES } from "./palettes.js";
import { randomSeed } from "./prng.js";

const SYMMETRY_LABELS = {
  none: "None",
  "mirror-x": "Mirror X",
  "mirror-y": "Mirror Y",
  quad: "Quad",
  kaleido: "Kaleidoscope",
};

const qs = (sel) => document.querySelector(sel);

export class Controls {
  /**
   * @param {FlowField} field
   * @param {{ isPlaying: () => boolean, setPlaying: (b: boolean) => void,
   *           toast: (msg: string) => void }} actions
   */
  constructor(field, actions) {
    this.field = field;
    this.actions = actions;

    this._bindSliders();
    this._bindPalette();
    this._bindSymmetry();
    this._bindSeed();
    this._bindButtons();
    this._bindKeyboard();

    this.syncInputs();
    this.updateReadout();
  }

  // Sliders map 1:1 to config keys (their min/max live in the HTML), except
  // "trails", which inverts to a backdrop-fade alpha.
  _bindSliders() {
    const direct = [
      ["#ctl-turbulence", "curl", (v) => v.toFixed(2)],
      ["#ctl-scale", "noiseScale", (v) => v.toFixed(4)],
      ["#ctl-speed", "speed", (v) => v.toFixed(2) + "\u00d7"],
      ["#ctl-particles", "particles", (v) => String(Math.round(v))],
      ["#ctl-weight", "lineWidth", (v) => v.toFixed(1) + " px"],
    ];
    for (const [sel, key, fmt] of direct) {
      const el = qs(sel);
      el.addEventListener("input", () => {
        const value = key === "particles" ? parseInt(el.value, 10) : parseFloat(el.value);
        this.field.setConfig({ [key]: value });
        qs(sel.replace("ctl-", "val-")).textContent = fmt(value);
        if (key === "particles") this.updateReadout();
      });
    }

    // Trails: 0–100 (longer) -> persistence 0.16 (short) .. 0.02 (long).
    const trails = qs("#ctl-trails");
    trails.addEventListener("input", () => {
      const t = parseInt(trails.value, 10) / 100;
      const persistence = 0.16 - t * (0.16 - 0.02);
      this.field.setConfig({ persistence });
      qs("#val-trails").textContent = trails.value + "%";
    });
  }

  _bindPalette() {
    const container = qs("#palette-swatches");
    container.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-palette]");
      if (!btn) return;
      const key = btn.dataset.palette;
      this.field.setConfig({ palette: key });
      this._activate(container, "[data-palette]", btn);
      this.updateReadout();
    });
  }

  _bindSymmetry() {
    const container = qs("#symmetry-control");
    container.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-symmetry]");
      if (!btn) return;
      this.field.setConfig({ symmetry: btn.dataset.symmetry });
      this._activate(container, "[data-symmetry]", btn);
      this.updateReadout();
    });
  }

  _bindSeed() {
    const input = qs("#seed-input");
    const apply = () => {
      const seed = input.value.trim() || randomSeed();
      input.value = seed;
      this.field.setConfig({ seed });
      this.updateReadout();
    };
    input.addEventListener("change", apply);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { apply(); input.blur(); }
    });
    qs("#seed-random").addEventListener("click", () => {
      input.value = randomSeed();
      apply();
      this.actions.toast(`New seed \u00b7 ${input.value}`);
    });
  }

  _bindButtons() {
    qs("#btn-play").addEventListener("click", () => this._togglePlay());
    qs("#btn-regenerate").addEventListener("click", () => {
      this.field.setConfig({ seed: this.field.config.seed }); // no-op merge
      this.field.clear();
      this.actions.toast("Field regenerated");
    });
    qs("#btn-export").addEventListener("click", () => this.exportImage());
  }

  _bindKeyboard() {
    document.addEventListener("keydown", (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          this._togglePlay();
          break;
        case "r":
        case "R": {
          const seed = randomSeed();
          qs("#seed-input").value = seed;
          this.field.setConfig({ seed });
          this.updateReadout();
          this.actions.toast(`New seed \u00b7 ${seed}`);
          break;
        }
        case "e":
        case "E":
          this.exportImage();
          break;
        case "c":
        case "C":
          this.field.clear();
          break;
      }
    });
  }

  _togglePlay() {
    const next = !this.actions.isPlaying();
    this.actions.setPlaying(next);
    const btn = qs("#btn-play");
    btn.dataset.playing = String(next);
    btn.querySelector(".btn-label").textContent = next ? "Pause" : "Play";
    btn.setAttribute("aria-pressed", String(next));
  }

  _activate(container, selector, active) {
    for (const el of container.querySelectorAll(selector)) {
      const on = el === active;
      el.setAttribute("aria-pressed", String(on));
      el.classList.toggle("is-active", on);
    }
  }

  exportImage() {
    const scale = parseInt(qs("#export-scale").value, 10) || 2;
    this.actions.toast(`Rendering ${scale}\u00d7 \u2026`);
    // Let the toast paint before the synchronous render blocks the thread.
    setTimeout(() => {
      const url = this.field.exportPNG(scale);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wisp-${this.field.config.seed}-${scale}x.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      this.actions.toast("Saved to downloads");
    }, 40);
  }

  /** Push the entire config into the DOM controls (used on load + presets). */
  syncInputs() {
    const c = this.field.config;
    qs("#ctl-turbulence").value = c.curl;
    qs("#val-turbulence").textContent = c.curl.toFixed(2);
    qs("#ctl-scale").value = c.noiseScale;
    qs("#val-scale").textContent = c.noiseScale.toFixed(4);
    qs("#ctl-speed").value = c.speed;
    qs("#val-speed").textContent = c.speed.toFixed(2) + "\u00d7";
    qs("#ctl-particles").value = c.particles;
    qs("#val-particles").textContent = String(c.particles);
    qs("#ctl-weight").value = c.lineWidth;
    qs("#val-weight").textContent = c.lineWidth.toFixed(1) + " px";

    const trails = Math.round(((0.16 - c.persistence) / (0.16 - 0.02)) * 100);
    qs("#ctl-trails").value = trails;
    qs("#val-trails").textContent = trails + "%";

    qs("#seed-input").value = c.seed;

    this._activate(qs("#palette-swatches"), "[data-palette]",
      qs(`[data-palette="${c.palette}"]`));
    this._activate(qs("#symmetry-control"), "[data-symmetry]",
      qs(`[data-symmetry="${c.symmetry}"]`));
  }

  /** Apply a full preset config and refresh the UI. */
  applyConfig(config) {
    this.field.setConfig(config);
    this.field.clear();
    this.syncInputs();
    this.updateReadout();
  }

  updateReadout() {
    const c = this.field.config;
    qs("#read-seed").textContent = c.seed;
    qs("#read-particles").textContent = String(c.particles);
    qs("#read-symmetry").textContent = SYMMETRY_LABELS[c.symmetry] || c.symmetry;
    qs("#read-palette").textContent = PALETTES[c.palette].name;
  }
}
