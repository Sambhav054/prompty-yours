// Tiny synthesized sounds with WebAudio. No audio files.
let ctx = null;
function ac() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
function tone(freq, dur = 0.12, type = 'sine', vol = 0.15, when = 0) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + when;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur);
}
export const sound = {
  unlock: () => ac(),
  tick: () => tone(880, 0.05, 'square', 0.05),
  lock: () => tone(520, 0.08, 'triangle', 0.15),
  flip: () => tone(300 + Math.random() * 200, 0.07, 'triangle', 0.1),
  win: () => { tone(660, 0.12, 'sine', 0.2); tone(880, 0.12, 'sine', 0.2, 0.12); tone(1320, 0.25, 'sine', 0.2, 0.24); },
  lose: () => { tone(220, 0.25, 'sawtooth', 0.12); tone(160, 0.35, 'sawtooth', 0.12, 0.2); },
  spotlight: () => { tone(330, 0.15, 'triangle', 0.15); tone(440, 0.3, 'triangle', 0.15, 0.15); },
};
