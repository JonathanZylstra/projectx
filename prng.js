// Deterministic randomness. Everything Wisp draws is reproducible from a seed,
// so a string like "aurora-7" always paints the exact same field.

/** Hash an arbitrary string into a 32-bit unsigned integer (xfnv1a). */
export function hashSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mulberry32: a tiny, fast, decent-quality seeded PRNG. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A small random helper bundle built from a seed string. */
export class Rng {
  constructor(seedString) {
    this.seedString = String(seedString);
    this._next = mulberry32(hashSeed(this.seedString));
  }

  /** Float in [0, 1). */
  float() {
    return this._next();
  }

  /** Float in [min, max). */
  range(min, max) {
    return min + this._next() * (max - min);
  }

  /** Integer in [min, max]. */
  int(min, max) {
    return Math.floor(this.range(min, max + 1));
  }

  /** Pick a random element from an array. */
  pick(items) {
    return items[Math.floor(this._next() * items.length)];
  }
}

/** Generate a fresh, human-readable random seed string. */
export function randomSeed() {
  const animals = [
    "wisp", "drift", "ember", "tide", "moth", "comet", "willow",
    "quartz", "harbor", "lichen", "ravel", "umbra", "cinder", "halcyon",
  ];
  const a = animals[Math.floor(Math.random() * animals.length)];
  const n = Math.floor(Math.random() * 9000) + 1000;
  return `${a}-${n}`;
}
