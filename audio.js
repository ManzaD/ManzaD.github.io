/* LifeMOD — sonidos sintetizados con Web Audio API (sin archivos) */
(function (G) {
  'use strict';
  const AU = { on: true, vol: 0.7 };
  let ctx = null, master = null, verb = null;

  AU.init = () => {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); return true; }
    const AC = G.AudioContext || G.webkitAudioContext;
    if (!AC) return false;
    try {
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = AU.vol; master.connect(ctx.destination);
      // reverberación simple generada
      verb = ctx.createConvolver();
      const len = ctx.sampleRate * 1.6, buf = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
      verb.buffer = buf;
      const vg = ctx.createGain(); vg.gain.value = 0.28; verb.connect(vg); vg.connect(master);
    } catch (e) { ctx = null; return false; }
    return true;
  };
  AU.setVolume = v => { AU.vol = v; if (master) master.gain.value = v; };
  const ready = () => AU.on && AU.init() && ctx;

  function tone(f, t, dur, o) {
    o = o || {};
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'triangle';
    osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    const peak = o.gain === undefined ? 0.25 : o.gain;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + (o.atk || 0.008));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = osc;
    if (o.lp) { const f2 = ctx.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = o.lp; osc.connect(f2); node = f2; }
    node.connect(g); g.connect(master);
    if (o.verb && verb) g.connect(verb);
    osc.start(t); osc.stop(t + dur + 0.05);
  }
  function noise(t, dur, o) {
    o = o || {};
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur)), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = o.type || 'lowpass'; f.frequency.setValueAtTime(o.f || 800, t);
    if (o.fTo) f.frequency.exponentialRampToValueAtTime(o.fTo, t + dur);
    const g = ctx.createGain(); const peak = o.gain || 0.3;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + (o.atk || 0.01)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master); if (o.verb && verb) g.connect(verb);
    src.start(t); src.stop(t + dur + 0.05);
  }
  const N = n => 440 * Math.pow(2, (n - 69) / 12); // MIDI → Hz

  const S = {
    tap() { const t = ctx.currentTime; tone(1400, t, 0.04, { type: 'square', gain: 0.05, lp: 3000 }); },
    complete() { const t = ctx.currentTime; [72, 76, 79, 84].forEach((n, i) => tone(N(n), t + i * 0.055, 0.22, { gain: 0.2, verb: 1 })); tone(N(96), t + 0.22, 0.25, { type: 'sine', gain: 0.08, verb: 1 }); },
    crit() { const t = ctx.currentTime; [76, 79, 83, 88, 91].forEach((n, i) => tone(N(n), t + i * 0.045, 0.3, { gain: 0.18, verb: 1 })); noise(t, 0.25, { type: 'highpass', f: 6000, gain: 0.08 }); },
    levelup() {
      const t = ctx.currentTime;
      [60, 64, 67].forEach((n, i) => tone(N(n), t + i * 0.09, 0.18, { type: 'square', gain: 0.1, lp: 2200 }));
      [72, 76, 79, 84].forEach(n => tone(N(n), t + 0.32, 1.1, { type: 'sawtooth', gain: 0.07, lp: 2600, atk: 0.02, verb: 1 }));
      [84, 88, 91, 96].forEach((n, i) => tone(N(n), t + 0.34 + i * 0.07, 0.5, { type: 'sine', gain: 0.1, verb: 1 }));
      noise(t + 0.3, 0.6, { type: 'highpass', f: 5000, gain: 0.06, verb: 1 });
    },
    damage() { const t = ctx.currentTime; tone(160, t, 0.28, { type: 'sine', to: 50, gain: 0.5 }); noise(t, 0.22, { f: 900, fTo: 200, gain: 0.35 }); tone(110, t + 0.02, 0.18, { type: 'square', gain: 0.08, lp: 600 }); },
    death() {
      const t = ctx.currentTime;
      [67, 63, 60, 55, 51].forEach((n, i) => tone(N(n), t + i * 0.28, 0.6, { type: 'triangle', gain: 0.18, verb: 1 }));
      tone(N(36), t + 0.2, 2.4, { type: 'sawtooth', gain: 0.08, lp: 300, atk: 0.4, verb: 1 });
      noise(t, 1.6, { f: 300, gain: 0.1, atk: 0.4 });
    },
    revive() { const t = ctx.currentTime; [60, 64, 67, 72, 76, 79, 84].forEach((n, i) => tone(N(n), t + i * 0.09, 0.8, { type: 'sine', gain: 0.14, verb: 1 })); noise(t, 1.2, { type: 'bandpass', f: 1500, fTo: 6000, gain: 0.08, verb: 1 }); },
    buy() { const t = ctx.currentTime; tone(N(88), t, 0.09, { type: 'square', gain: 0.08, lp: 5000 }); tone(N(95), t + 0.08, 0.35, { type: 'square', gain: 0.08, lp: 5000, verb: 1 }); },
    claim() { const t = ctx.currentTime; [79, 84, 88].forEach((n, i) => tone(N(n), t + i * 0.07, 0.5, { type: 'sine', gain: 0.18, verb: 1 })); },
    achievement() { const t = ctx.currentTime; [76, 80, 83, 88].forEach((n, i) => tone(N(n), t + i * 0.1, 0.7, { type: 'triangle', gain: 0.14, verb: 1 })); },
    error() { const t = ctx.currentTime; tone(180, t, 0.12, { type: 'square', gain: 0.07, lp: 900 }); tone(140, t + 0.12, 0.16, { type: 'square', gain: 0.07, lp: 900 }); },
    bosshit() { const t = ctx.currentTime; noise(t, 0.15, { f: 2400, fTo: 300, gain: 0.25 }); tone(220, t, 0.15, { type: 'square', to: 90, gain: 0.08, lp: 1200 }); },
    charge() { const t = ctx.currentTime; noise(t, 1.1, { type: 'bandpass', f: 400, fTo: 5000, gain: 0.14, atk: 0.5 }); tone(N(48), t, 1.1, { type: 'sawtooth', to: N(72), gain: 0.04, lp: 1600, atk: 0.4 }); },
    flip() { const t = ctx.currentTime; noise(t, 0.08, { type: 'highpass', f: 3000, gain: 0.08 }); },
    gacha(r) {
      const t = ctx.currentTime;
      if (r <= 0) { tone(N(72), t, 0.18, { gain: 0.15 }); return; }
      if (r === 1) { tone(N(74), t, 0.2, { gain: 0.15 }); tone(N(81), t + 0.08, 0.3, { gain: 0.15, verb: 1 }); return; }
      if (r === 2) { [76, 80, 83, 88].forEach((n, i) => tone(N(n), t + i * 0.06, 0.5, { type: 'sine', gain: 0.15, verb: 1 })); noise(t, 0.4, { type: 'highpass', f: 6000, gain: 0.06, verb: 1 }); return; }
      if (r === 3) {
        [67, 71, 74, 79].forEach((n, i) => tone(N(n), t + i * 0.08, 0.25, { type: 'square', gain: 0.07, lp: 2400 }));
        [79, 83, 86, 91].forEach(n => tone(N(n), t + 0.34, 1.6, { type: 'sawtooth', gain: 0.05, lp: 3000, atk: 0.03, verb: 1 }));
        [91, 95, 98, 103].forEach((n, i) => tone(N(n), t + 0.4 + i * 0.09, 0.8, { type: 'sine', gain: 0.09, verb: 1 }));
        noise(t + 0.3, 1, { type: 'highpass', f: 6000, gain: 0.07, verb: 1 });
        return;
      }
      for (let i = 0; i < 14; i++) tone(N(72 + i * 2), t + i * 0.035, 0.4, { type: 'sine', gain: 0.07, verb: 1 });
      [72, 76, 79, 83, 86].forEach(n => tone(N(n), t + 0.5, 2.2, { type: 'sawtooth', gain: 0.045, lp: 3400, atk: 0.05, verb: 1 }));
      [96, 100, 103, 108].forEach((n, i) => tone(N(n), t + 0.6 + i * 0.12, 1, { type: 'triangle', gain: 0.08, verb: 1 }));
      noise(t + 0.4, 1.6, { type: 'bandpass', f: 2000, fTo: 9000, gain: 0.08, verb: 1 });
    }
  };
  AU.play = (name, arg) => { if (!ready()) return; try { S[name] && S[name](arg); } catch (e) { /* silencio */ } };
  G.LMAU = AU;
})(typeof window !== 'undefined' ? window : globalThis);
