// THE RULEBOOK
// Each rule: { id, text, type, smart?, resolve(picks) }
//   picks: [{ id, n, t }]  n = number 1-10, t = lock-in order (0 = first)
//   resolve returns { winners: [ids], pointChanges: { id: delta }, notes }
//   smart(): the number an "overthinking" bot would pick (optional)
// To add a rule: copy one block below, give it a new id, write resolve(). Done.

// ---------- helpers ----------
const countOf = (picks) => {
  const m = new Map();
  for (const p of picks) m.set(p.n, (m.get(p.n) || 0) + 1);
  return m;
};
const uniques = (picks) => {
  const c = countOf(picks);
  return picks.filter((p) => c.get(p.n) === 1);
};
const idsWhere = (picks, f) => picks.filter(f).map((p) => p.id);
const none = (notes) => ({ winners: [], pointChanges: {}, notes });
const win = (winners, notes, pointChanges = {}) => ({ winners, pointChanges, notes });
const closestTo = (picks, target) => {
  if (!picks.length) return [];
  const best = Math.min(...picks.map((p) => Math.abs(p.n - target)));
  return idsWhere(picks, (p) => Math.abs(p.n - target) === best);
};
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

export const RULES = [
  {
    id: 'lowest-unique',
    type: 'logic',
    text: 'Lowest UNIQUE number wins',
    smart: () => rand(1, 3),
    resolve(picks) {
      const u = uniques(picks);
      if (!u.length) return none('No unique number. Jackpot rolls over!');
      const min = Math.min(...u.map((p) => p.n));
      return win(idsWhere(u, (p) => p.n === min), `${min} was the lowest unique number`);
    },
  },
  {
    id: 'highest-unique',
    type: 'logic',
    text: 'Highest UNIQUE number wins',
    smart: () => rand(8, 10),
    resolve(picks) {
      const u = uniques(picks);
      if (!u.length) return none('No unique number. Jackpot rolls over!');
      const max = Math.max(...u.map((p) => p.n));
      return win(idsWhere(u, (p) => p.n === max), `${max} was the highest unique number`);
    },
  },
  {
    id: 'closest-to-5',
    type: 'logic',
    text: 'Closest to 5 wins',
    smart: () => 5,
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      return win(closestTo(picks, 5), 'Closest to 5 takes it');
    },
  },
  {
    id: 'closest-to-average',
    type: 'logic',
    text: 'Closest to the AVERAGE of everyone wins',
    smart: () => rand(4, 6),
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      const avg = picks.reduce((s, p) => s + p.n, 0) / picks.length;
      return win(closestTo(picks, avg), `Average was ${avg.toFixed(1)}`);
    },
  },
  {
    id: 'lucky-seven',
    type: 'chaos',
    text: 'Pick 7 to win. Two 7s? Both LOSE 5',
    smart: () => (Math.random() < 0.5 ? 7 : rand(1, 10)),
    resolve(picks) {
      const sevens = idsWhere(picks, (p) => p.n === 7);
      if (sevens.length === 1) return win(sevens, 'Only one brave 7!');
      if (sevens.length === 0) return none('No 7s. Jackpot rolls over!');
      const pc = {};
      for (const id of sevens) pc[id] = -5;
      return win([], `${sevens.length} sevens clashed. Minus 5 each!`, pc);
    },
  },
  {
    id: 'odd-only',
    type: 'chaos',
    text: 'Only ODD numbers score',
    smart: () => [1, 3, 5, 7, 9][rand(0, 4)],
    resolve(picks) {
      const odd = idsWhere(picks, (p) => p.n % 2 === 1);
      if (!odd.length) return none('All even. Nobody scores!');
      return win(odd, 'Odd numbers take the points');
    },
  },
  {
    id: 'no-twins',
    type: 'chaos',
    text: 'Same number as someone? You LOSE 5',
    smart: () => rand(1, 10),
    resolve(picks) {
      const c = countOf(picks);
      const pc = {};
      for (const p of picks) if (c.get(p.n) > 1) pc[p.id] = -5;
      const solo = idsWhere(picks, (p) => c.get(p.n) === 1);
      const clashes = Object.keys(pc).length;
      return win(solo, clashes ? `${clashes} copycats lose 5` : 'No twins. Everyone wins!', pc);
    },
  },
  {
    id: 'last-to-lock',
    type: 'chaos',
    text: 'LAST person to lock in wins',
    smart: () => rand(1, 10),
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      const maxT = Math.max(...picks.map((p) => p.t));
      return win(idsWhere(picks, (p) => p.t === maxT), 'Slow and steady wins!');
    },
  },
  {
    id: 'ten-flips',
    type: 'chaos',
    text: 'Highest wins. But if anyone picks 10, LOWEST wins',
    smart: () => (Math.random() < 0.5 ? 1 : 9),
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      const flipped = picks.some((p) => p.n === 10);
      const target = flipped ? Math.min(...picks.map((p) => p.n)) : Math.max(...picks.map((p) => p.n));
      return win(idsWhere(picks, (p) => p.n === target), flipped ? 'A 10 flipped it. Lowest wins!' : 'No 10. Highest wins!');
    },
  },
  {
    id: 'second-highest',
    type: 'logic',
    text: 'SECOND highest number wins',
    smart: () => rand(7, 9),
    resolve(picks) {
      const vals = [...new Set(picks.map((p) => p.n))].sort((a, b) => b - a);
      if (vals.length < 2) return none('Everyone picked the same. No second place!');
      return win(idsWhere(picks, (p) => p.n === vals[1]), `${vals[1]} was second highest`);
    },
  },
];

export const RULES_BY_ID = Object.fromEntries(RULES.map((r) => [r.id, r]));

// Pick `count` different random rules, avoiding `excludeId` if possible.
export function randomRules(count, excludeId) {
  const pool = RULES.filter((r) => r.id !== excludeId);
  const src = pool.length >= count ? pool : RULES;
  const shuffled = [...src].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
