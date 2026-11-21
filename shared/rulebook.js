// Interpreter for Rulebook v3 (shared/rules_v3.js).
// Every rule becomes { id, text, type, category, tier, skipRound1, needsDraw, resolve(picks, ctx) }.
//   picks: [{ id, n, t }]   ctx: { scores: {id: n}, draw: {...random values made once by the server} }
// resolve returns { winners, pointChanges, notes, group?, effects? }
//   single-winner results go through the house rule (twins knock out, real ties cancel);
//   group results ("everyone who…") pay exactly what the rule says.
import BOOK from './rules_v3.js';
import TWIST from './rules_twist.js';

// Rules where the game secretly draws a number (snakes, lucky stars, dice, coin, raffle, hot seat)
// are left out: players can't reason about a number they never chose. Every rule is decided by the picks alone.
export const DRAW_TYPES = new Set(['cursed', 'lucky', 'random_draw', 'coin', 'dice', 'raffle', 'hot_seat']);

// Rules that promise points to several players at once (twins, teams, "everyone +5", "two winners",
// "last place +5") break the house rule "only one player can gain points, and only with a number
// nobody else picked", so they are left out rather than silently changed.
export const MULTI_WIN = new Set([
  'GREED-010', 'ALONE-001', 'ALONE-002', 'ALONE-004', 'ALONE-005', 'ALONE-010',
  'CROWD-002', 'CROWD-005', 'CROWD-006', 'CROWD-007', 'CROWD-008', 'CROWD-009',
  'AVG-005', 'FAV-011', 'FAV-012', 'FAV-013', 'REVENGE-007', 'REVENGE-008', 'REVENGE-009',
  'REVENGE-012', 'DARE-004', 'DARE-008',
]);

// Rules that rewrite the scoreboard or hide the rule are parked until they get proper UI.
export const PARKED = new Set(['WILD-001', 'WILD-002', 'WILD-005', 'WILD-006', 'WILD-007', 'REVENGE-004', 'REVENGE-005']);

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pickDistinct = (k, lo = 1, hi = 10) => {
  const s = new Set();
  while (s.size < k) s.add(rnd(lo, hi));
  return [...s].sort((a, b) => a - b);
};

// Random things a rule needs are drawn ONCE on the server and shown in the reveal.
export function makeDraw(rule, playerIds) {
  const p = rule.params || {};
  switch (rule.type) {
    case 'cursed': return { snakes: pickDistinct(p.count || 1) };
    case 'lucky': return { lucky: pickDistinct(p.count || 1) };
    case 'random_draw': return { num: rnd(1, 10) };
    case 'coin': return { coin: Math.random() < 0.5 ? 'heads' : 'tails' };
    case 'dice': return { dice: rnd(1, 6) };
    case 'raffle': return { ticket: Math.random() };
    case 'hot_seat': return { seat: playerIds[rnd(0, playerIds.length - 1)] };
    default: return {};
  }
}

// ---------- helpers ----------
const ids = (ps) => ps.map((p) => p.id);
const values = (ps) => ps.map((p) => p.n);
const counts = (ps) => { const m = new Map(); for (const p of ps) m.set(p.n, (m.get(p.n) || 0) + 1); return m; };
const single = (winners, notes, pointChanges = {}) => ({ winners, pointChanges, notes });
const none = (notes, pointChanges = {}) => ({ winners: [], pointChanges, notes });
const group = (pointChanges, notes) => ({ winners: [], pointChanges, notes, group: true });
const each = (ps, pts) => Object.fromEntries(ps.map((p) => [p.id, pts]));
const add = (pc, id, d) => { if (id) pc[id] = (pc[id] || 0) + d; };
const PROP = {
  even: (n) => n % 2 === 0, odd: (n) => n % 2 === 1, prime: (n) => [2, 3, 5, 7].includes(n),
  mid: (n) => n >= 4 && n <= 7, edge: (n) => n === 1 || n === 10,
};
const median = (ps) => { const v = values(ps).sort((a, b) => a - b); const m = v.length >> 1; return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const avg = (ps) => ps.reduce((s, p) => s + p.n, 0) / ps.length;
const closest = (ps, x) => { const b = Math.min(...ps.map((p) => Math.abs(p.n - x))); return ps.filter((p) => Math.abs(p.n - x) === b); };
const furthest = (ps, x) => { const b = Math.max(...ps.map((p) => Math.abs(p.n - x))); return ps.filter((p) => Math.abs(p.n - x) === b); };
const top = (ps) => { const m = Math.max(...values(ps)); return ps.filter((p) => p.n === m); };
const bottom = (ps) => { const m = Math.min(...values(ps)); return ps.filter((p) => p.n === m); };
const uniques = (ps) => { const c = counts(ps); return ps.filter((p) => c.get(p.n) === 1); };

function leaderOf(ctx, picks) {
  const sc = ctx.scores || {};
  let best = null;
  for (const p of picks) if (best === null || (sc[p.id] || 0) > (sc[best] || 0)) best = p.id;
  return best;
}
function lastOf(ctx, picks) {
  const sc = ctx.scores || {};
  let worst = null;
  for (const p of picks) if (worst === null || (sc[p.id] || 0) < (sc[worst] || 0)) worst = p.id;
  return worst;
}
function bottomHalf(ctx, picks) {
  const sc = ctx.scores || {};
  const sorted = [...picks].sort((a, b) => (sc[a.id] || 0) - (sc[b.id] || 0));
  return sorted.slice(0, Math.max(1, Math.ceil(sorted.length / 2)));
}

// Basic "who wins" shapes reused by coin flips and cursed numbers.
function basic(kind, ps) {
  if (!ps.length) return none('Nobody left to win.');
  switch (kind) {
    case 'highest': return single(ids(top(ps)), `${top(ps)[0].n} was the highest`);
    case 'lowest': return single(ids(bottom(ps)), `${bottom(ps)[0].n} was the lowest`);
    case 'highest_unique': { const u = uniques(ps); if (!u.length) return none('No unique number.'); return single(ids(top(u)), `${top(u)[0].n} was the highest unique`); }
    case 'lowest_unique': { const u = uniques(ps); if (!u.length) return none('No unique number.'); return single(ids(bottom(u)), `${bottom(u)[0].n} was the lowest unique`); }
    case 'highest_lose': return group(each(top(ps), -10), `${top(ps)[0].n} was highest and pays 10`);
    default: return none('');
  }
}

// ---------- one resolver per rule type ----------
const TYPES = {
  highest(ps, p, ctx) {
    let pool = ps;
    if (p.exclude === 'leader') { const L = leaderOf(ctx, ps); pool = ps.filter((x) => x.id !== L); }
    if (!pool.length) return none('Nobody left.');
    if (p.flip_if === 'any10' && ps.some((x) => x.n === 10)) return single(ids(bottom(pool)), 'Someone got greedy with 10. Lowest wins!');
    if (p.mode === 'lose') return group(each(top(pool), -10), `${top(pool)[0].n} was highest and loses 10`);
    if (p.count === 2) {
      const vals = [...new Set(values(pool))].sort((a, b) => b - a).slice(0, 2);
      return group(each(pool.filter((x) => vals.includes(x.n)), 10), `Top two numbers: ${vals.join(' and ')}`);
    }
    const t = top(pool);
    if (p.tie === 'lose' && t.length > 1) return group(each(t, -10), `Greed! ${t.length} tied at ${t[0].n} and lose 10`);
    return single(ids(t), `${t[0].n} was the highest`);
  },
  lowest(ps, p) {
    if (p.flip_if === 'any1' && ps.some((x) => x.n === 1)) return single(ids(top(ps)), 'Someone picked 1. Highest wins!');
    if (p.mode === 'lose') return group(each(bottom(ps), -10), `${bottom(ps)[0].n} was lowest and loses 10`);
    return single(ids(bottom(ps)), `${bottom(ps)[0].n} was the lowest`);
  },
  nth_high(ps, p) {
    const v = [...new Set(values(ps))].sort((a, b) => b - a);
    if (v.length < p.n) return none('Not enough different numbers.');
    return single(ids(ps.filter((x) => x.n === v[p.n - 1])), `${v[p.n - 1]} came ${p.n === 2 ? 'second' : 'third'} highest`);
  },
  nth_low(ps, p) {
    const v = [...new Set(values(ps))].sort((a, b) => a - b);
    if (v.length < p.n) return none('Not enough different numbers.');
    return single(ids(ps.filter((x) => x.n === v[p.n - 1])), `${v[p.n - 1]} came second lowest`);
  },
  highest_unique(ps, p, ctx) {
    let pool = ps;
    if (p.only === 'bottom_half') { const b = new Set(ids(bottomHalf(ctx, ps))); pool = ps.filter((x) => b.has(x.id)); }
    const u = uniques(ps).filter((x) => pool.includes(x));
    if (!u.length) return p.none === 'all_minus_5' ? group(each(ps, -5), 'No unique number. Everyone loses 5!') : none('No unique number.');
    return single(ids(top(u)), `${top(u)[0].n} was the highest unique`);
  },
  lowest_unique(ps, p, ctx) {
    let pool = ps;
    if (p.only === 'bottom_half') { const b = new Set(ids(bottomHalf(ctx, ps))); pool = ps.filter((x) => b.has(x.id)); }
    if (p.exclude === 'leader') { const L = leaderOf(ctx, ps); pool = pool.filter((x) => x.id !== L); }
    const u = uniques(ps).filter((x) => pool.includes(x));
    if (!u.length) return none('No unique number.');
    return single(ids(bottom(u)), `${bottom(u)[0].n} was the lowest unique`);
  },
  dupes(ps, p) {
    const c = counts(ps), pc = {};
    for (const x of ps) { const d = c.get(x.n) > 1 ? p.dup : p.solo; if (d) pc[x.id] = d; }
    return group(pc, 'Copycats and loners settle up');
  },
  all_different(ps) {
    const c = counts(ps);
    if ([...c.values()].every((k) => k === 1)) return group(each(ps, 5), 'A miracle! All different, everyone +5');
    return group(each(ps.filter((x) => c.get(x.n) > 1), -10), 'Duplicates spotted. They lose 10');
  },
  twins(ps) {
    const c = counts(ps);
    const pairs = ps.filter((x) => c.get(x.n) === 2);
    if (!pairs.length) return none('No perfect pairs.');
    return group(each(pairs, 10), 'Perfect pairs win 10 each');
  },
  fixed(ps, p, ctx, rule) {
    const on = ps.filter((x) => x.n === p.n);
    if (on.length === 1) return single(ids(on), `Alone on ${p.n}!`);
    if (!on.length) return none(`Nobody picked ${p.n}.`);
    const penalty = /lose 10/i.test(rule.text) ? -10 : 0;
    return penalty ? group(each(on, penalty), `${on.length} crowded onto ${p.n} and lose 10`) : none(`${on.length} shared ${p.n}. Nobody wins.`);
  },
  adjacent(ps, p) {
    const near = ps.filter((x) => ps.some((y) => y.id !== x.id && Math.abs(y.n - x.n) <= 1));
    if (!near.length) return none('Everyone kept their distance.');
    return group(each(near, p.mode === 'win' ? 5 : -5), p.mode === 'win' ? 'Huddled together, +5 each' : 'Too close! -5 each');
  },
  popular(ps, p) {
    const c = counts(ps);
    const k = p.dir === 'least' ? Math.min(...c.values()) : Math.max(...c.values());
    const nums = [...c.entries()].filter(([, v]) => v === k).map(([n]) => n);
    if (p.min_share && !(k > ps.length * p.min_share)) return none('No majority this time.');
    if (nums.length > 1) return none(`${nums.join(', ')} were level. Nobody wins.`);
    const crowd = ps.filter((x) => x.n === nums[0]);
    if (p.mode === 'lose') return group(each(crowd, -10), `${nums[0]} ${p.dir === 'least' ? 'was the loneliest' : 'was the most popular'} and loses 10`);
    if (crowd.length === 1) return single(ids(crowd), `${nums[0]} ${p.dir === 'least' ? 'was the loneliest pick' : 'won the crowd'}`);
    return none(`${crowd.length} players share ${nums[0]}, so they cancel out.`);
  },
  parity_vote(ps, p) {
    const odd = ps.filter((x) => x.n % 2), even = ps.filter((x) => x.n % 2 === 0);
    if (odd.length === even.length) return none('Teams are level. Nobody wins.');
    const big = odd.length > even.length ? odd : even, small = big === odd ? even : odd;
    const w = p.win === 'majority' ? big : small;
    if (!w.length) return none('Only one team showed up.');
    return group(each(w, 10), `Team ${w === odd ? 'Odd' : 'Even'} wins 10 each`);
  },
  half_vote(ps, p) {
    const lo = ps.filter((x) => x.n <= 5), hi = ps.filter((x) => x.n >= 6);
    if (lo.length === hi.length) return none('Sides are level. Nobody wins.');
    const big = lo.length > hi.length ? lo : hi, small = big === lo ? hi : lo;
    const w = p.win === 'majority' ? big : small;
    if (!w.length) return none('Only one side showed up.');
    return group(each(w, 10), `${w === lo ? 'Low' : 'High'} side wins 10 each`);
  },
  cursed(ps, p, ctx) {
    const sn = ctx.draw?.snakes || [];
    const bitten = ps.filter((x) => sn.includes(x.n));
    const safe = ps.filter((x) => !sn.includes(x.n));
    const pc = each(bitten, -10);
    const label = `Snake${sn.length > 1 ? 's' : ''}: ${sn.join(', ')}.`;
    if (p.then === 'none') { if (p.safe) Object.assign(pc, each(safe, p.safe)); return group(pc, `${label} ${bitten.length ? `${bitten.length} bitten` : 'Nobody bitten'}`); }
    const r = basic(p.then, safe);
    return { ...r, pointChanges: { ...pc, ...(r.pointChanges || {}) }, notes: `${label} ${r.notes}` };
  },
  lucky(ps, p, ctx) {
    const lk = ctx.draw?.lucky || [];
    const c = counts(ps), pc = {};
    for (const x of ps) if (lk.includes(x.n)) { const d = c.get(x.n) > 1 ? p.shared : p.solo; if (d) pc[x.id] = d; }
    return group(pc, `Lucky number${lk.length > 1 ? 's' : ''}: ${lk.join(', ')}`);
  },
  random_draw(ps, p, ctx) {
    const d = ctx.draw?.num ?? 5;
    if (p.exact === 'bonus') { const hit = ps.filter((x) => x.n === d); return hit.length ? group(each(hit, 20), `Drew ${d}. Bullseye, +20!`) : none(`Drew ${d}. Nobody hit it.`); }
    if (p.exact_only) { const hit = ps.filter((x) => x.n === d); return hit.length ? single(ids(hit), `Drew ${d}. Bullseye!`) : none(`Drew ${d}. No bullseye, jackpot grows!`); }
    if (p.mode === 'lose') return group(each(closest(ps, d), -10), `Drew ${d}. Closest loses 10`);
    if (p.mode === 'furthest') return single(ids(furthest(ps, d)), `Drew ${d}. Furthest wins`);
    return single(ids(closest(ps, d)), `Drew ${d}. Closest wins`);
  },
  coin(ps, p, ctx) {
    const side = ctx.draw?.coin || 'heads';
    const r = basic(p[side], ps);
    return { ...r, notes: `Coin says ${side.toUpperCase()}. ${r.notes}` };
  },
  dice(ps, p, ctx) {
    const d = ctx.draw?.dice ?? 1;
    const hit = ps.filter((x) => x.n === d);
    if (!hit.length) return none(`Dice rolled ${d}. Nobody picked it.`);
    return group(each(hit, p.mode === 'hit_lose' ? -10 : 10), `Dice rolled ${d}!`);
  },
  raffle(ps, p, ctx) {
    const c = counts(ps);
    const holders = ps.filter((x) => !(p.dupe === 'void' && c.get(x.n) > 1)).map((x) => ({ id: x.id, k: p.invert ? 11 - x.n : x.n }));
    const total = holders.reduce((s, h) => s + h.k, 0);
    if (!total) return none('All tickets torn up. Jackpot grows!');
    let r = (ctx.draw?.ticket ?? 0.5) * total;
    for (const h of holders) { if (r < h.k) return single([h.id], `Ticket drawn from ${total} in the drum`); r -= h.k; }
    return single([holders[holders.length - 1].id], 'Last ticket wins');
  },
  hot_seat(ps, p, ctx) {
    const x = ps.find((q) => q.id === ctx.draw?.seat) || ps[0];
    if (!x) return none('');
    const c = counts(ps);
    const good = p.mode === 'high' ? x.n >= 6 : p.mode === 'parity' ? x.n % 2 === 1 : c.get(x.n) === 1;
    return group({ [x.id]: good ? 10 : -10 }, `Hot seat picked ${x.n}: ${good ? '+10' : '-10'}`);
  },
  closest_stat(ps, p) {
    const target = p.stat === 'median' ? median(ps) : avg(ps);
    const lbl = `${p.stat === 'median' ? 'Middle' : 'Average'} was ${Number.isInteger(target) ? target : target.toFixed(1)}`;
    if (p.mode === 'lose') return group(each(closest(ps, target), -10), `${lbl}. Closest loses 10`);
    if (p.count === 2) {
      const sorted = [...ps].sort((a, b) => Math.abs(a.n - target) - Math.abs(b.n - target));
      const cut = Math.abs(sorted[Math.min(1, sorted.length - 1)].n - target);
      return group(each(ps.filter((x) => Math.abs(x.n - target) <= cut), 10), `${lbl}. Closest two win`);
    }
    return single(ids(closest(ps, target)), lbl);
  },
  furthest_stat(ps) { const a = avg(ps); return single(ids(furthest(ps, a)), `Average was ${a.toFixed(1)}. Weirdest wins`); },
  closest_to(ps, p) { return single(ids(closest(ps, p.n)), `Closest to ${p.n}`); },
  furthest_from(ps, p) { return single(ids(furthest(ps, p.n)), `Furthest from ${p.n}`); },
  property(ps, p) {
    const ok = ps.filter((x) => PROP[p.prop](x.n));
    if (!ok.length) return none('Nobody qualified.');
    if (p.pick === 'all') return group(each(ok, 10), `${ok.length} qualified, +10 each`);
    return single(ids(p.pick === 'high' ? top(ok) : bottom(ok)), `${(p.pick === 'high' ? top(ok) : bottom(ok))[0].n} takes it`);
  },
  speed(ps, p) {
    const tt = p.mode === 'first' ? Math.min(...ps.map((x) => x.t)) : Math.max(...ps.map((x) => x.t));
    const who = ps.filter((x) => x.t === tt);
    if (p.outcome === 'lose') return group(each(who, -10), `${p.mode === 'first' ? 'Too quick' : 'Too slow'}! -10`);
    return single(ids(who), p.mode === 'first' ? 'Fastest finger!' : 'Nerves of steel!');
  },
  spread(ps, p) {
    const lo = Math.min(...values(ps)), hi = Math.max(...values(ps));
    if (hi - lo <= p.k) return group(each(ps, 10), 'All within range. Everyone wins!');
    return basic(p.fallback || 'lowest', ps);
  },
  no_points() { return none('No points this round.'); },
};

// Effects that ride on top of a rule's result.
function applyEffects(rule, res, picks, ctx) {
  const pc = { ...(res.pointChanges || {}) };
  const winner = res.winners?.length === 1 ? res.winners[0] : null;
  const L = leaderOf(ctx, picks), last = lastOf(ctx, picks);
  for (const e of rule.effects || []) {
    if (e === 'double' && winner) add(pc, winner, 10);
    if (e === 'others_minus_2' && winner) for (const p of picks) if (p.id !== winner) add(pc, p.id, -2);
    if (e === 'leader_minus_10' && L) add(pc, L, -10);
    if (e === 'steal_leader_5' && winner && L && L !== winner) { add(pc, winner, 5); add(pc, L, -5); }
    if (e === 'steal_lowest_pick_5' && winner) { const lo = bottom(picks)[0]; if (lo && lo.id !== winner) { add(pc, winner, 5); add(pc, lo.id, -5); } }
    if (e === 'bottom_plus_5' && last) add(pc, last, 5);
    if (e === 'leader_pays_last' && L && last && L !== last) { add(pc, L, -5); add(pc, last, 5); }
  }
  return { ...res, pointChanges: pc, jackpotX2: (rule.effects || []).includes('jackpot_x2') };
}

// Rules whose label carried the meaning get a plain sentence that stands on its own.
const PLAIN = {
  'FATE-002': 'Two snake numbers appear. Touch either: -10. Highest of the rest wins.',
  'FATE-003': 'Three snake numbers appear. Dodge them all: +5. Get bitten: -10.',
  'FATE-005': 'A snake number appears. Pick it: -10. Lowest of the rest wins DOUBLE.',
  'FATE-006': 'A cursed number appears. Pick it: -10 and a dare. Highest of the rest wins.',
  'FATE-008': 'A lucky number appears. Pick it alone: +15. Share it: -5 each.',
  'FATE-009': 'Two lucky numbers appear. Pick one alone: +20. Share it: -10.',
  'FATE-010': 'Three lucky numbers appear. Pick any of them for +5.',
  'FATE-013': 'A random number drops. Hit it exactly to win. Nobody? Jackpot grows!',
};

// Drop the shouty all-caps label in front of a rule ("HOT SEAT! …") so only the rule itself shows.
export function plainText(text) {
  const m = text.match(/^([^!?]{2,40})!\s+(.+)$/);
  if (!m) return text;
  const label = m[1];
  const isLabel = label === label.toUpperCase() && /[A-Z]/.test(label);
  if (!isLabel) return text;
  const rest = m[2];
  return rest.charAt(0).toUpperCase() + rest.slice(1);
}

const TYPE_LABEL = { GREED: 'Greed', ALONE: 'Alone or together', CROWD: 'Crowd', FATE: 'Fate', RAFFLE: 'Raffle', AVG: 'Average', FAV: 'Favourites', REVENGE: 'Revenge', NERVES: 'Nerves', WILD: 'Wild card', DARE: 'Dare' };

const V3_RULES = BOOK.rules
  .filter((r) => !PARKED.has(r.id) && !MULTI_WIN.has(r.id) && TYPES[r.type] && !DRAW_TYPES.has(r.type))
  .map((r) => ({
    id: r.id,
    text: PLAIN[r.id] || plainText(r.text),
    category: r.category,
    label: TYPE_LABEL[r.category] || r.category,
    type: r.tier >= 2 ? 'chaos' : 'logic',
    tier: r.tier,
    skipRound1: !!r.skipRound1,
    params: r.params || {},
    effects: r.effects || [],
    ruleType: r.type,
    resolve(picks, ctx = {}) {
      if (!picks.length) return none('Nobody played.');
      const res = TYPES[r.type](picks, r.params || {}, ctx, r) || none('');
      return applyEffects(r, res, picks, ctx);
    },
  }));


// ---------- cards from the 500-card rulebook (declarative logic) ----------
const cnt = (picks, n) => picks.filter((q) => q.n === n).length;
function test(f, p, picks) {
  if (!f) return true;
  const others = picks.filter((q) => q.id !== p.id);
  switch (f.op) {
    case 'all': return true;
    case 'and': return f.items.every((x) => test(x, p, picks));
    case 'count': { const c = cnt(picks, p.n); return f.eq != null ? c === f.eq : c >= (f.min ?? 1); }
    case 'eq': return p.n === f.value;
    case 'lt': return p.n < f.value;
    case 'lte': return p.n <= f.value;
    case 'gt': return p.n > f.value;
    case 'gte': return p.n >= f.value;
    case 'odd': return p.n % 2 === 1;
    case 'even': return p.n % 2 === 0;
    case 'offset': return others.some((q) => q.n === p.n + f.value);
    case 'distance': return others.some((q) => Math.abs(q.n - p.n) === f.value);
    case 'sumPartner': return others.some((q) => q.n + p.n === f.value);
    case 'multiple': return others.some((q) => p.n === f.value * q.n);
    case 'fraction': return others.some((q) => q.n === f.value * p.n);
    case 'between': return others.some((q) => q.n < p.n) && others.some((q) => q.n > p.n);
    default: return false;
  }
}
function cond(c, picks) {
  const pairs = (fn) => picks.some((a, i) => picks.some((z, j) => i < j && fn(a, z)));
  switch (c.op) {
    case 'numberCount': { const k = cnt(picks, c.number); return c.exact != null ? k === c.exact : k >= (c.atLeast ?? 1); }
    case 'pairSum': return pairs((a, z) => a.n + z.n === c.value);
    case 'pairGap': return pairs((a, z) => Math.abs(a.n - z.n) === c.value);
    case 'sumOdd': return picks.reduce((s, p) => s + p.n, 0) % 2 === 1;
    case 'duplicate': return new Set(picks.map((p) => p.n)).size < picks.length;
    case 'distinctAtLeast': return new Set(picks.map((p) => p.n)).size >= c.value;
    default: return false;
  }
}
function targetOf(t, picks) {
  if (typeof t === 'number') return t;
  const a = picks.reduce((s, p) => s + p.n, 0) / picks.length;
  if (t?.op === 'halfAverage') return a / 2;
  if (t?.op === 'midpoint') return (Math.min(...picks.map((p) => p.n)) + Math.max(...picks.map((p) => p.n))) / 2;
  return a;
}
function rewardFor(r, p) {
  if (typeof r === 'number') return r;
  if (r?.op === 'subtract') return r.from - (r.factor ?? 1) * p.n;
  if (r?.op === 'conditional') return test(r.filter, p, [p]) ? r.yes : r.no;
  return 10;
}
function runBranch(br, picks) {
  const pc = {};
  for (const pen of br.penalties || []) for (const p of picks) if (test(pen.filter, p, picks)) add(pc, p.id, pen.points);
  const ok = picks.filter((p) => test(br.filter, p, picks));
  if (!ok.length) return { winners: [], pointChanges: pc, notes: 'Nobody qualified.' };
  let best;
  if (br.rank === 'highest') best = top(ok);
  else if (br.rank === 'lowest') best = bottom(ok);
  else if (br.rank === 'closest') best = closest(ok, targetOf(br.target, picks));
  else best = ok;
  if (br.tiePolicy === 'share') { for (const p of best) add(pc, p.id, rewardFor(br.reward, p)); return { winners: [], pointChanges: pc, notes: best.length ? `Pairs on ${best[0].n} win!` : '', group: true }; }
  if (best.length === 1) add(pc, best[0].id, rewardFor(br.reward, best[0]) - 10); // the engine adds the base 10
  return { winners: ids(best), pointChanges: pc, notes: best.length === 1 ? `${best[0].n} takes it` : '' };
}
const TWIST_RULES = TWIST.filter((r) => r.category !== 'Find Your Twin').map((r) => ({
  id: r.id,
  text: r.text,
  category: r.category,
  label: r.category,
  type: r.tier >= 2 ? 'chaos' : 'logic',
  tier: r.tier,
  skipRound1: false,
  params: {},
  effects: [],
  ruleType: 'twist',
  resolve(picks) {
    if (!picks.length) return none('Nobody played.');
    const L = r.logic;
    if (L.condition) { const yes = cond(L.condition, picks); const res = runBranch(yes ? L.then : L.else, picks); return { ...res, notes: `${yes ? 'Twist triggered!' : 'No twist.'} ${res.notes}`.trim() }; }
    return runBranch(L, picks);
  },
}));

export const RULEBOOK = [...V3_RULES, ...TWIST_RULES];

export const RULEBOOK_BY_ID = Object.fromEntries(RULEBOOK.map((r) => [r.id, r]));

// Choose rules for a round: right tier for the round, never one already used in this
// game/match, and avoiding what anyone at the table saw recently. Falls back gracefully.
export function chooseRules(count, { round = 1, used = new Set(), recent = new Set(), usedCats = new Set() } = {}) {
  const tierMax = round <= 3 ? 1 : round <= 7 ? 2 : 3;
  const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((x) => x[1]);
  const fits = (r) => r.tier <= tierMax && !(round === 1 && r.skipRound1) && !used.has(r.id) && !usedCats.has(r.category);
  const tiers = [
    RULEBOOK.filter((r) => fits(r) && !recent.has(r.id)),
    RULEBOOK.filter((r) => fits(r)),
    RULEBOOK.filter((r) => !used.has(r.id) && !usedCats.has(r.category) && !(round === 1 && r.skipRound1)),
    RULEBOOK.filter((r) => !used.has(r.id) && !(round === 1 && r.skipRound1)),
    RULEBOOK,
  ];
  const out = [];
  for (const pool of tiers) {
    // the options offered together also come from different categories
    for (const r of shuffle(pool)) { if (out.length >= count) break; if (!out.includes(r) && !out.some((o) => o.category === r.category)) out.push(r); }
    if (out.length >= count) break;
  }
  return out;
}
