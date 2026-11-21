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
    id: 'lucky-seven', type: 'chaos', text: 'Closest to 7 wins. Two 7s? Both LOSE 5',
    smart: () => rand(6, 8),
    resolve(picks) {
      const sevens = picks.filter((p) => p.n === 7);
      const pc = {};
      if (sevens.length > 1) for (const p of sevens) pc[p.id] = -5;
      const pool = sevens.length > 1 ? picks.filter((p) => p.n !== 7) : picks;
      if (!pool.length) return win([], 'Every 7 clashed. Minus 5 each!', pc);
      return win(closestTo(pool, 7), sevens.length > 1 ? `${sevens.length} sevens clashed and lose 5` : 'Closest to lucky 7', pc);
    },
  },
  {
    id: 'odd-only',
    type: 'chaos',
    text: 'Highest ODD number wins',
    smart: () => [5, 7, 9][rand(0, 2)],
    resolve(picks) {
      const odd = picks.filter((p) => p.n % 2 === 1);
      if (!odd.length) return none('All even. Nobody scores!');
      const max = Math.max(...odd.map((p) => p.n));
      return win(idsWhere(odd, (p) => p.n === max), `${max} was the highest odd number`);
    },
  },
  {
    id: 'no-twins',
    type: 'chaos',
    text: 'Highest wins. Matching someone? You LOSE 5',
    smart: () => rand(6, 10),
    resolve(picks) {
      const c = countOf(picks);
      const pc = {};
      for (const p of picks) if (c.get(p.n) > 1) pc[p.id] = -5;
      const solo = picks.filter((p) => c.get(p.n) === 1);
      const clashes = Object.keys(pc).length;
      const note = clashes ? `${clashes} matched and lose 5. ` : '';
      if (!solo.length) return win([], `${note}Nobody stood alone.`, pc);
      const max = Math.max(...solo.map((p) => p.n));
      return win(idsWhere(solo, (p) => p.n === max), `${note}${max} was the highest lone number`, pc);
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

  // ---------------- quirky rules ----------------
  {
    id: 'lowest-wins', type: 'logic', text: 'Lowest number wins',
    smart: () => rand(1, 2),
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      const min = Math.min(...picks.map((p) => p.n));
      return win(idsWhere(picks, (p) => p.n === min), `${min} was the lowest`);
    },
  },
  {
    id: 'prime-time', type: 'logic', text: 'PRIME TIME: highest prime number wins',
    smart: () => [5, 7][rand(0, 1)],
    resolve(picks) {
      const primes = picks.filter((p) => [2, 3, 5, 7].includes(p.n));
      if (!primes.length) return none('No primes (2, 3, 5, 7). Nobody scores!');
      const max = Math.max(...primes.map((p) => p.n));
      return win(idsWhere(primes, (p) => p.n === max), `${max} was the highest prime`);
    },
  },
  {
    id: 'even-steven', type: 'logic', text: 'Lowest EVEN number wins',
    smart: () => [2, 4][rand(0, 1)],
    resolve(picks) {
      const ev = picks.filter((p) => p.n % 2 === 0);
      if (!ev.length) return none('No even numbers. Nobody scores!');
      const min = Math.min(...ev.map((p) => p.n));
      return win(idsWhere(ev, (p) => p.n === min), `${min} was the lowest even number`);
    },
  },
  {
    id: 'farthest-from-5', type: 'logic', text: 'FARTHEST from 5 wins',
    smart: () => [1, 10][rand(0, 1)],
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      const far = Math.max(...picks.map((p) => Math.abs(p.n - 5)));
      return win(idsWhere(picks, (p) => Math.abs(p.n - 5) === far), 'Farthest from 5 takes it');
    },
  },
  {
    id: 'first-to-lock', type: 'chaos', text: 'FIRST to lock in wins. Speed!',
    smart: () => rand(1, 10),
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      const minT = Math.min(...picks.map((p) => p.t));
      return win(idsWhere(picks, (p) => p.t === minT), 'Fastest finger wins!');
    },
  },
  {
    id: 'lucky-three', type: 'chaos', text: 'Closest to 3 wins. An exact 3 earns +5',
    smart: () => rand(2, 4),
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      const w = closestTo(picks, 3);
      const pc = {};
      if (w.length === 1 && picks.find((p) => p.id === w[0]).n === 3) pc[w[0]] = 5;
      return win(w, pc[w[0]] ? 'A perfect 3! Bonus +5' : 'Closest to 3 takes it', pc);
    },
  },
  {
    id: 'pi-day', type: 'logic', text: 'Closest to π (3.14) wins',
    smart: () => 3,
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      return win(closestTo(picks, Math.PI), 'Closest to 3.14159…');
    },
  },
  {
    id: 'under-five', type: 'logic', text: 'Highest number UNDER 5 wins',
    smart: () => rand(3, 4),
    resolve(picks) {
      const under = picks.filter((p) => p.n < 5);
      if (!under.length) return none('Nobody went under 5.');
      const max = Math.max(...under.map((p) => p.n));
      return win(idsWhere(under, (p) => p.n === max), `${max} was the highest under 5`);
    },
  },
  {
    id: 'no-going-over-7', type: 'logic', text: 'Closest to 7 WITHOUT going over',
    smart: () => rand(5, 7),
    resolve(picks) {
      const ok = picks.filter((p) => p.n <= 7);
      if (!ok.length) return none('Everyone went over 7. Bust!');
      const max = Math.max(...ok.map((p) => p.n));
      return win(idsWhere(ok, (p) => p.n === max), `${max} got closest without busting`);
    },
  },
  {
    id: 'odd-one-out', type: 'chaos', text: 'Lone ODD or lone EVEN wins. Else highest wins',
    smart: () => rand(1, 10),
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      const odd = picks.filter((p) => p.n % 2 === 1);
      const even = picks.filter((p) => p.n % 2 === 0);
      if (odd.length === 1 && even.length > 1) return win([odd[0].id], 'The lone odd number stands out!');
      if (even.length === 1 && odd.length > 1) return win([even[0].id], 'The lone even number stands out!');
      const max = Math.max(...picks.map((p) => p.n));
      return win(idsWhere(picks, (p) => p.n === max), `Nobody stood out, so highest ${max} wins`);
    },
  },
  {
    id: 'lonely-number', type: 'logic', text: 'Biggest gap to your nearest neighbour wins',
    smart: () => [1, 10][rand(0, 1)],
    resolve(picks) {
      if (picks.length < 2) return none('Need at least two players.');
      const gap = (p) => Math.min(...picks.filter((q) => q.id !== p.id).map((q) => Math.abs(q.n - p.n)));
      const best = Math.max(...picks.map(gap));
      if (best === 0) return none('Everyone has a twin. Nobody is lonely.');
      return win(idsWhere(picks, (p) => gap(p) === best), 'The loneliest number wins');
    },
  },
  {
    id: 'half-total', type: 'logic', text: 'Closest to HALF of everyone’s total wins',
    smart: () => rand(6, 10),
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      const half = picks.reduce((s, p) => s + p.n, 0) / 2;
      return win(closestTo(picks, half), `Half the total was ${half}`);
    },
  },
  {
    id: 'last-digit', type: 'chaos', text: 'Match the LAST DIGIT of the total to win',
    smart: () => rand(1, 10),
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      const total = picks.reduce((s, p) => s + p.n, 0);
      const d = total % 10 === 0 ? 10 : total % 10;
      return win(closestTo(picks, d), `Total ${total}, last digit ${d}`);
    },
  },
  {
    id: 'crowd-count', type: 'logic', text: 'Closest to the number of PLAYERS wins',
    smart: () => rand(3, 5),
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      return win(closestTo(picks, picks.length), `${picks.length} players in the room`);
    },
  },
  {
    id: 'step-up', type: 'chaos', text: 'Be ONE above someone. Highest such wins. Else lowest',
    smart: () => rand(2, 9),
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      const set = new Set(picks.map((p) => p.n));
      const ok = picks.filter((p) => set.has(p.n - 1));
      if (!ok.length) {
        const min = Math.min(...picks.map((p) => p.n));
        return win(idsWhere(picks, (p) => p.n === min), `Nobody stepped up, so lowest ${min} wins`);
      }
      const max = Math.max(...ok.map((p) => p.n));
      return win(idsWhere(ok, (p) => p.n === max), `${max} sat one above ${max - 1}`);
    },
  },
  {
    id: 'double-trouble', type: 'chaos', text: 'Be DOUBLE someone to win. Nobody? Lowest wins',
    smart: () => [4, 6, 8, 10][rand(0, 3)],
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      const set = new Set(picks.map((p) => p.n));
      const ok = picks.filter((p) => p.n % 2 === 0 && set.has(p.n / 2) && p.n !== p.n / 2);
      if (!ok.length) {
        const min = Math.min(...picks.map((p) => p.n));
        return win(idsWhere(picks, (p) => p.n === min), `Nobody doubled anyone, so lowest ${min} wins`);
      }
      const max = Math.max(...ok.map((p) => p.n));
      return win(idsWhere(ok, (p) => p.n === max), `${max} doubled ${max / 2}`);
    },
  },
  {
    id: 'odd-total-flip', type: 'chaos', text: 'Total ODD? Highest wins. EVEN? Lowest wins',
    smart: () => [1, 10][rand(0, 1)],
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      const total = picks.reduce((s, p) => s + p.n, 0);
      const target = total % 2 ? Math.max(...picks.map((p) => p.n)) : Math.min(...picks.map((p) => p.n));
      return win(idsWhere(picks, (p) => p.n === target), `Total was ${total} (${total % 2 ? 'odd' : 'even'})`);
    },
  },
  {
    id: 'all-different', type: 'chaos', text: 'All different? Highest wins. Any match? Lowest',
    smart: () => rand(1, 10),
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      const clash = new Set(picks.map((p) => p.n)).size < picks.length;
      const target = clash ? Math.min(...picks.map((p) => p.n)) : Math.max(...picks.map((p) => p.n));
      return win(idsWhere(picks, (p) => p.n === target), clash ? 'Someone matched. Lowest wins!' : 'All different. Highest wins!');
    },
  },
  {
    id: 'bomb-four', type: 'chaos', text: '4 is a BOMB 💣 (lose 5). Highest of the rest wins',
    smart: () => rand(7, 10),
    resolve(picks) {
      const pc = {};
      for (const p of picks) if (p.n === 4) pc[p.id] = -5;
      const safe = picks.filter((p) => p.n !== 4);
      const boom = Object.keys(pc).length ? 'Boom! ' : '';
      if (!safe.length) return win([], `${boom}Everyone blew up.`, pc);
      const max = Math.max(...safe.map((p) => p.n));
      return win(idsWhere(safe, (p) => p.n === max), `${boom}${max} survived on top`, pc);
    },
  },
  {
    id: 'robin-hood', type: 'chaos', text: 'Robin Hood: lowest wins and the highest LOSES 5',
    smart: () => rand(1, 3),
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      const min = Math.min(...picks.map((p) => p.n));
      const max = Math.max(...picks.map((p) => p.n));
      const pc = {};
      if (max !== min) for (const p of picks) if (p.n === max) pc[p.id] = -5;
      return win(idsWhere(picks, (p) => p.n === min), `${min} robs the rich ${max}`, pc);
    },
  },
  {
    id: 'greedy-ten', type: 'chaos', text: 'Highest wins. Lone 10 wins DOUBLE. Two 10s LOSE 10',
    smart: () => (Math.random() < 0.4 ? 10 : rand(7, 9)),
    resolve(picks) {
      const tens = picks.filter((p) => p.n === 10);
      const pc = {};
      if (tens.length > 1) for (const p of tens) pc[p.id] = -10;
      const pool = tens.length > 1 ? picks.filter((p) => p.n !== 10) : picks;
      if (!pool.length) return win([], 'Everyone got greedy. Minus 10 each!', pc);
      const max = Math.max(...pool.map((p) => p.n));
      const w = idsWhere(pool, (p) => p.n === max);
      if (max === 10 && w.length === 1) pc[w[0]] = 10;
      return win(w, max === 10 ? 'Greed pays! Double points' : `${max} was the highest`, pc);
    },
  },
  {
    id: 'pays-its-number', type: 'chaos', text: 'Highest wins… but pays its number in points',
    smart: () => rand(6, 9),
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      const max = Math.max(...picks.map((p) => p.n));
      const ids = idsWhere(picks, (p) => p.n === max);
      return win(ids, `${max} wins but pays ${max}`, ids.length === 1 ? { [ids[0]]: -max } : {});
    },
  },
  {
    id: 'one-banned', type: 'chaos', text: '1 is BANNED (lose 5). Lowest of the rest wins',
    smart: () => rand(2, 3),
    resolve(picks) {
      const pc = {};
      for (const p of picks) if (p.n === 1) pc[p.id] = -5;
      const ok = picks.filter((p) => p.n !== 1);
      if (!ok.length) return win([], 'Everyone broke the ban!', pc);
      const min = Math.min(...ok.map((p) => p.n));
      return win(idsWhere(ok, (p) => p.n === min), `${min} was the lowest legal number`, pc);
    },
  },
  {
    id: 'third-highest', type: 'logic', text: 'THIRD highest number wins',
    smart: () => rand(5, 8),
    resolve(picks) {
      const vals = [...new Set(picks.map((p) => p.n))].sort((a, b) => b - a);
      if (vals.length < 3) return none('Not enough different numbers for third place.');
      return win(idsWhere(picks, (p) => p.n === vals[2]), `${vals[2]} was third highest`);
    },
  },
  {
    id: 'second-lowest', type: 'logic', text: 'SECOND lowest number wins',
    smart: () => rand(2, 4),
    resolve(picks) {
      const vals = [...new Set(picks.map((p) => p.n))].sort((a, b) => a - b);
      if (vals.length < 2) return none('Everyone picked the same. No second place!');
      return win(idsWhere(picks, (p) => p.n === vals[1]), `${vals[1]} was second lowest`);
    },
  },
  {
    id: 'mid-point', type: 'logic', text: 'Closest to halfway between lowest & highest',
    smart: () => rand(4, 6),
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      const lo = Math.min(...picks.map((p) => p.n));
      const hi = Math.max(...picks.map((p) => p.n));
      const mid = (lo + hi) / 2;
      const inner = picks.filter((p) => p.n !== lo && p.n !== hi);
      return win(closestTo(inner.length ? inner : picks, mid), `Halfway between ${lo} and ${hi} is ${mid}`);
    },
  },
  {
    id: 'double-average', type: 'logic', text: 'Closest to DOUBLE the average wins',
    smart: () => rand(8, 10),
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      const t = (2 * picks.reduce((s, p) => s + p.n, 0)) / picks.length;
      return win(closestTo(picks, t), `Double the average was ${t.toFixed(1)}`);
    },
  },
  {
    id: 'neighbours', type: 'chaos', text: 'Lowest with a ±1 neighbour wins. Else highest',
    smart: () => rand(3, 7),
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      const ok = picks.filter((p) => picks.some((q) => q.id !== p.id && Math.abs(q.n - p.n) === 1));
      if (!ok.length) {
        const max = Math.max(...picks.map((p) => p.n));
        return win(idsWhere(picks, (p) => p.n === max), `No neighbours, so highest ${max} wins`);
      }
      const min = Math.min(...ok.map((p) => p.n));
      return win(idsWhere(ok, (p) => p.n === min), `${min} had a neighbour`);
    },
  },
  {
    id: 'slowpoke-penalty', type: 'chaos', text: 'Lowest wins. LAST to lock in loses 3',
    smart: () => rand(1, 3),
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      const maxT = Math.max(...picks.map((p) => p.t));
      const pc = {};
      for (const p of picks) if (p.t === maxT && picks.length > 1) pc[p.id] = -3;
      const min = Math.min(...picks.map((p) => p.n));
      return win(idsWhere(picks, (p) => p.n === min), `${min} was lowest. Slowpoke pays 3`, pc);
    },
  },
  {
    id: 'mirror-mirror', type: 'chaos', text: 'Closest to 11 minus the HIGHEST pick wins',
    smart: () => rand(1, 4),
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      const t = 11 - Math.max(...picks.map((p) => p.n));
      return win(closestTo(picks, t), `The mirror number was ${t}`);
    },
  },
  {
    id: 'square-dance', type: 'logic', text: 'Highest SQUARE (1, 4, 9) wins. None? Lowest wins',
    smart: () => [4, 9][rand(0, 1)],
    resolve(picks) {
      if (!picks.length) return none('Nobody played.');
      const sq = picks.filter((p) => [1, 4, 9].includes(p.n));
      if (!sq.length) {
        const min = Math.min(...picks.map((p) => p.n));
        return win(idsWhere(picks, (p) => p.n === min), `No squares, so lowest ${min} wins`);
      }
      const max = Math.max(...sq.map((p) => p.n));
      return win(idsWhere(sq, (p) => p.n === max), `${max} was the biggest square`);
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
