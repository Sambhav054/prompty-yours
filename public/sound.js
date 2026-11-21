// Synthesized sounds (WebAudio, no files). Design, based on reward-sound research:
// - wins are rich, bright and rising (a major arpeggio with sparkle): the moment people replay for;
// - anticipation builds: each reveal flip climbs a major pentatonic scale;
// - losses stay soft and short (no harsh buzzer), so a bad round never feels like a punishment;
// - taps are tiny, tactile clicks. Nothing pretends a loss is a win.
let ctx = null;
let master = null;
function ac() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    // gentle limiter so stacked notes never clip harshly
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 4; comp.attack.value = 0.005; comp.release.value = 0.2;
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(comp).connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// One soft note: quick attack, smooth exponential release (no clicks).
function note(midi, { dur = 0.25, type = 'sine', vol = 0.12, when = 0, detune = 0 } = {}) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + when;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(hz(midi), t);
  o.detune.value = detune;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}
// A bell-ish tone: fundamental + soft octave + slightly detuned shimmer.
function bell(midi, when = 0, vol = 0.1, dur = 0.6) {
  note(midi, { when, vol, dur });
  note(midi + 12, { when, vol: vol * 0.35, dur: dur * 0.7, type: 'triangle' });
  note(midi, { when, vol: vol * 0.4, dur, detune: 7 });
}

const PENTA = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93]; // C major pentatonic, rising

export const sound = {
  unlock: () => ac(),
  tick: () => note(96, { dur: 0.05, type: 'triangle', vol: 0.05 }),
  lock: () => { note(79, { dur: 0.12, vol: 0.12 }); note(86, { dur: 0.16, vol: 0.1, when: 0.06 }); },
  flip: (i = 0) => bell(PENTA[Math.min(i, PENTA.length - 1)], 0, 0.08, 0.35),
  win: () => {
    [72, 76, 79, 84].forEach((m, i) => bell(m, i * 0.09, 0.11, 0.7)); // C E G C
    bell(88, 0.4, 0.09, 1.1);                                          // ring out on the high E
    for (let k = 0; k < 6; k++) note(96 + ((k * 5) % 12), { when: 0.45 + k * 0.05, dur: 0.18, vol: 0.035, type: 'triangle' }); // sparkle
  },
  lose: () => { note(67, { dur: 0.22, vol: 0.07 }); note(64, { dur: 0.35, vol: 0.06, when: 0.14 }); }, // soft, short, no buzzer
  spotlight: () => { bell(76, 0, 0.09, 0.5); bell(81, 0.12, 0.09, 0.7); },
};
