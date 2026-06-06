// A minimal frame-rate meter, smoothed so the readout doesn't flicker.

export class FpsMeter {
  constructor(smoothing = 0.9) {
    this.smoothing = smoothing;
    this.fps = 60;
    this._last = performance.now();
  }

  /** Call once per frame; returns the smoothed FPS. */
  tick(now = performance.now()) {
    const dt = now - this._last;
    this._last = now;
    if (dt > 0) {
      const instant = 1000 / dt;
      this.fps = this.fps * this.smoothing + instant * (1 - this.smoothing);
    }
    return this.fps;
  }
}
