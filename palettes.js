// Curated palettes. Each has a backdrop (the canvas wash) and a set of ink
// stops that strands are coloured from, sampled smoothly along the flow.

export const PALETTES = {
  ember: {
    name: "Ember",
    backdrop: "#0b0907",
    stops: ["#3a0d0d", "#a8321f", "#ef7a32", "#ffce6b", "#fff2cf"],
  },
  tide: {
    name: "Tide",
    backdrop: "#04090f",
    stops: ["#08263b", "#0f6f8c", "#27c1c8", "#9af2e3", "#e8fff7"],
  },
  orchid: {
    name: "Orchid",
    backdrop: "#0a0610",
    stops: ["#2a0b3f", "#7b1f8f", "#c64fb0", "#ff9ad1", "#ffe3f3"],
  },
  meadow: {
    name: "Meadow",
    backdrop: "#060a06",
    stops: ["#16361f", "#3f7a32", "#86bb43", "#d3e86f", "#f6ffd8"],
  },
  graphite: {
    name: "Graphite",
    backdrop: "#08090b",
    stops: ["#1c2024", "#454c55", "#7c8794", "#bcc6cf", "#f2f5f8"],
  },
  solar: {
    name: "Solar",
    backdrop: "#0c0500",
    stops: ["#3d1500", "#b3470a", "#ff8a00", "#ffd23f", "#fff5d6"],
  },
};

export const PALETTE_KEYS = Object.keys(PALETTES);

/** Parse "#rrggbb" into [r, g, b]. */
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Sample a palette at t in [0, 1], returning an "rgb(...)" string.
 * Interpolates linearly between adjacent stops.
 */
export function samplePalette(palette, t) {
  const stops = palette.stops;
  const clamped = t <= 0 ? 0 : t >= 1 ? 0.999999 : t;
  const scaled = clamped * (stops.length - 1);
  const idx = Math.floor(scaled);
  const frac = scaled - idx;

  const a = hexToRgb(stops[idx]);
  const b = hexToRgb(stops[idx + 1]);
  const r = Math.round(a[0] + (b[0] - a[0]) * frac);
  const g = Math.round(a[1] + (b[1] - a[1]) * frac);
  const bl = Math.round(a[2] + (b[2] - a[2]) * frac);
  return `rgb(${r}, ${g}, ${bl})`;
}
