// Pure scoring logic: given a rule, the picks and the game state, work out points.
import { CONFIG } from './config.js';

// state: { scores: {id: n}, streaks: {id: n}, jackpot: n }
// returns { winners, deltas: {id: n}, notes, jackpot }  (does not mutate state)
export function scoreRound(rule, picks, state, cfg = CONFIG) {
  const res = rule.resolve(picks) || { winners: [], pointChanges: {}, notes: '' };
  let winners = [...new Set(res.winners || [])];
  let notes = res.notes || '';
  // House rule: one winner per round. A tie cancels out and the points roll into the jackpot.
  const tied = winners.length > 1 ? winners : [];
  if (tied.length) {
    winners = [];
    notes = `${tied.length} players tied, so they cancel out.`;
  }
  const deltas = {};
  for (const p of picks) deltas[p.id] = 0;
  for (const [id, d] of Object.entries(res.pointChanges || {})) deltas[id] = (deltas[id] || 0) + d;

  let jackpot = state.jackpot || 0;
  const streaks = { ...(state.streaks || {}) };
  if (winners.length) {
    for (const id of winners) {
      streaks[id] = (streaks[id] || 0) + 1;
      let pts = cfg.ROUND_POINTS + jackpot;
      if (streaks[id] >= 3) pts += cfg.STREAK_BONUS;
      deltas[id] = (deltas[id] || 0) + pts;
    }
    jackpot = 0;
  } else {
    jackpot += cfg.ROUND_POINTS;
  }
  for (const p of picks) if (!winners.includes(p.id)) streaks[p.id] = 0;

  return { winners, tied, deltas, notes, jackpot, streaks };
}

// Last place = lowest score. Ties broken at random.
export function findLoser(players, scores) {
  if (!players.length) return null;
  const min = Math.min(...players.map((p) => scores[p.id] || 0));
  const tied = players.filter((p) => (scores[p.id] || 0) === min);
  return tied[Math.floor(Math.random() * tied.length)];
}
