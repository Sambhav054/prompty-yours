// Pure scoring logic: given a rule, the picks and the game state, work out points.
import { CONFIG } from './config.js';

const uniq = (a) => [...new Set(a || [])];

// House rule, applied to every rule in the rulebook:
// 1. The rule picks its winner(s) from everyone's numbers.
// 2. If more than one player "wins", players who picked the SAME number knock each other out,
//    and the rule is replayed on the remaining (unmatched) numbers.
// 3. If different numbers are still level (e.g. 1 and 9 are both 4 away from 5), nobody wins
//    and the points roll into the jackpot.
export function decide(rule, picks, ctx = {}) {
  const r1 = rule.resolve(picks, ctx) || { winners: [], pointChanges: {}, notes: '' };
  // Group rules ("everyone who…") pay exactly what they say: no knock-outs, no tie-cancel.
  if (r1.group) return { pointChanges: { ...(r1.pointChanges || {}) }, knocked: [], tied: [], winners: [], notes: r1.notes || '', group: true, jackpotX2: r1.jackpotX2 };
  const w1 = uniq(r1.winners);
  const base = { pointChanges: { ...(r1.pointChanges || {}) }, knocked: [], tied: [], jackpotX2: r1.jackpotX2 };
  const count = new Map();
  for (const p of picks) count.set(p.n, (count.get(p.n) || 0) + 1);
  const numOf = (id) => picks.find((p) => p.id === id)?.n;
  // A single winner only stands if nobody else picked the same number (e.g. "first to lock in"
  // with a shared number): a shared number is always knocked out, never rewarded.
  if (w1.length === 0 || (w1.length === 1 && count.get(numOf(w1[0])) === 1)) return { ...base, winners: w1, notes: r1.notes || '' };
  const knocked = picks.filter((p) => count.get(p.n) > 1).map((p) => p.id);
  const rest = picks.filter((p) => count.get(p.n) === 1);
  if (knocked.length && rest.length) {
    const r2 = rule.resolve(rest, ctx) || { winners: [] };
    const w2 = uniq(r2.winners);
    if (w2.length === 1) {
      // Keep only penalties from the first pass; bonuses belonged to players who were knocked out.
      const pc = Object.fromEntries(Object.entries(base.pointChanges).filter(([, v]) => v < 0));
      delete pc[w2[0]];
      if (r2.pointChanges?.[w2[0]]) pc[w2[0]] = r2.pointChanges[w2[0]];
      const nums = uniq(picks.filter((p) => knocked.includes(p.id)).map((p) => p.n)).join(', ');
      return { pointChanges: pc, knocked, tied: [], winners: w2, jackpotX2: r1.jackpotX2, notes: `Matching ${nums} knocked each other out. ${r2.notes || ''}`.trim() };
    }
  }
  const penalties = Object.fromEntries(Object.entries(base.pointChanges).filter(([, v]) => v < 0));
  return { ...base, pointChanges: penalties, winners: [], tied: w1, notes: `${w1.length} players tied, so they cancel out.` };
}

// state: { streaks: {id: n}, jackpot: n }
// returns { winners, tied, knocked, deltas: {id: n}, notes, jackpot, streaks }  (does not mutate state)
export function scoreRound(rule, picks, state, cfg = CONFIG, ctx = {}) {
  const res = decide(rule, picks, ctx);
  const winners = res.winners;
  const deltas = {};
  for (const p of picks) deltas[p.id] = 0;
  for (const [id, d] of Object.entries(res.pointChanges || {})) deltas[id] = (deltas[id] || 0) + d;
  // House rule, enforced for every rule: only the single winner can GAIN points in a round.
  // Everyone else can only stay level or lose (penalties still apply).
  for (const id of Object.keys(deltas)) if (!winners.includes(id) && deltas[id] > 0) deltas[id] = 0;

  let jackpot = state.jackpot || 0;
  const streaks = { ...(state.streaks || {}) };
  if (res.jackpotX2) jackpot *= 2; // jackpot-doubling rules
  if (winners.length) {
    for (const id of winners) {
      streaks[id] = (streaks[id] || 0) + 1;
      let pts = cfg.ROUND_POINTS + jackpot;
      if (streaks[id] >= 3) pts += cfg.STREAK_BONUS;
      deltas[id] = (deltas[id] || 0) + pts;
    }
    jackpot = 0;
  } else {
    jackpot += cfg.ROUND_POINTS; // nobody won: the points roll over
  }
  for (const p of picks) if (!winners.includes(p.id)) streaks[p.id] = 0;

  return { winners, tied: res.tied, knocked: res.knocked, group: !!res.group, deltas, notes: res.notes, jackpot, streaks };
}

// Who picks the next rule, fairly: someone from the bottom half of the scoreboard,
// never the same person twice in a row, preferring whoever has chosen least so far,
// then the lowest score. Anything still level is random.
export function findLoser(players, scores, { lastChooserId = null, chooseCounts = {} } = {}) {
  if (!players.length) return null;
  const score = (p) => scores[p.id] || 0;
  const eligible = players.length > 1 ? players.filter((p) => p.id !== lastChooserId) : players;
  const sorted = [...eligible].sort((a, b) => score(a) - score(b));
  const cutoff = score(sorted[Math.max(0, Math.ceil(players.length / 2) - 1)] || sorted[0]);
  const bottom = sorted.filter((p) => score(p) <= cutoff);
  const fewest = Math.min(...bottom.map((p) => chooseCounts[p.id] || 0));
  const least = bottom.filter((p) => (chooseCounts[p.id] || 0) === fewest);
  const low = Math.min(...least.map(score));
  const tied = least.filter((p) => score(p) === low);
  return tied[Math.floor(Math.random() * tied.length)];
}
