// Hinglish cricket-commentator lines. {w} = winner, {l} = loser, {n} = number, {j} = jackpot.
const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fill = (s, v) => s.replace(/\{(\w)\}/g, (_, k) => (v[k] ?? ''));

const WIN = [
  '{w} ne maara chhakka! 🏏',
  'Kya shot hai {w}! Seedha boundary ke bahar!',
  '{w} is on fire. Koi rokho isko!',
  'Pure luck, but {w} will call it strategy.',
  '{w} takes it. Crowd goes wild! 📣',
];
const MULTI_WIN = [
  'Partnership! {w} share the points.',
  '{w} all win. Sharing is caring, bhai.',
];
const NO_WIN = [
  'Nobody won! Jackpot ab {j} points ka hai 💰',
  'Dot ball! Jackpot grows to {j}.',
  'Sab fail. Jackpot {j} points pe pahunch gaya!',
];
const LOSER = [
  '{l} picked {n}? Bhai, kya soch ke?',
  '{l}, {n}? Even Nani would not do that.',
  'Clean bowled! {l} with a {n}. 😬',
  '{l} is batting like it is a Test match.',
];
const REPEAT = [
  '{n}? Phir se? Predictable, {l}.',
  '{l} loves {n}. Shaadi kar lo usse.',
];

export function commentary({ winners, jackpot, roaster, roastNumber, repeated }) {
  const lines = [];
  if (!winners.length) lines.push(fill(pickOne(NO_WIN), { j: jackpot }));
  else if (winners.length === 1) lines.push(fill(pickOne(WIN), { w: winners[0] }));
  else lines.push(fill(pickOne(MULTI_WIN), { w: winners.join(' & ') }));
  if (roaster) lines.push(fill(pickOne(repeated ? REPEAT : LOSER), { l: roaster, n: roastNumber }));
  return lines.join(' ');
}
