// Round commentary. {w} = winner, {l} = roasted player, {n} = number, {j} = jackpot, {k} = tied count.
const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fill = (s, v) => s.replace(/\{(\w)\}/g, (_, k) => (v[k] ?? ''));

const WIN = [
  '{w} takes the round.',
  'Clean win for {w}.',
  '{w} read the room perfectly.',
  'Nobody saw that coming. Point to {w}.',
  '{w} makes it look easy.',
  'Right number, right moment. Well played, {w}.',
];
const TIE = [
  '{k} players matched and cancelled each other out. Jackpot is now {j}.',
  'A dead heat. Nobody scores, and the jackpot climbs to {j}.',
  'Great minds think alike, and they all walk away empty. Jackpot: {j}.',
];
const NO_WIN = [
  'No winner this round. The jackpot grows to {j}.',
  'Nobody cracked it. {j} points now sit in the jackpot.',
  'The rule wins this one. Jackpot rises to {j}.',
];
const ROAST = [
  '{l} went with {n}. Bold choice.',
  '{n}, {l}? The rule had other plans.',
  'Not your round, {l}. {n} never stood a chance.',
  '{l} picked {n} and is already regretting it.',
];
const REPEAT = [
  '{n} again, {l}? Creature of habit.',
  '{l} is loyal to {n}. The rule is not.',
];
const GROUP = [
  'The rule pays out. Check who gained and who got burned.',
  'Points fly everywhere. The scoreboard just got spicy.',
  'Group payout! Some smiles, some groans.',
];
const REVENGE = [
  '{w} picked the rule and won with it. Sweet revenge.',
];

export function commentary({ winners, tiedCount, jackpot, roaster, roastNumber, repeated, revenge, group }) {
  const lines = [];
  if (group) return pickOne(GROUP);
  if (revenge) lines.push(fill(pickOne(REVENGE), { w: winners[0] }));
  else if (winners.length) lines.push(fill(pickOne(WIN), { w: winners[0] }));
  else if (tiedCount) lines.push(fill(pickOne(TIE), { k: tiedCount, j: jackpot }));
  else lines.push(fill(pickOne(NO_WIN), { j: jackpot }));
  if (roaster && !tiedCount) lines.push(fill(pickOne(repeated ? REPEAT : ROAST), { l: roaster, n: roastNumber }));
  return lines.join(' ');
}
