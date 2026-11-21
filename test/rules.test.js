import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RULES, RULES_BY_ID } from '../shared/rules.js';
import { scoreRound, findLoser } from '../shared/engine.js';

const P = (...ns) => ns.map((n, i) => ({ id: 'p' + i, n, t: i }));
const R = (id, picks) => RULES_BY_ID[id].resolve(picks);

// Edge cases every rule must survive with a valid result shape.
const EDGE = {
  single: P(4),
  allSame: P(5, 5, 5, 5),
  allDuplicatePairs: P(2, 2, 8, 8),
  ties: P(4, 6, 4, 6),
  spread: P(1, 3, 7, 10, 9, 2),
  empty: [],
};

for (const rule of RULES) {
  test(`${rule.id}: valid shape on all edge cases`, () => {
    for (const [name, picks] of Object.entries(EDGE)) {
      const r = rule.resolve(picks);
      assert.ok(Array.isArray(r.winners), `${name}: winners array`);
      assert.equal(typeof r.pointChanges, 'object', `${name}: pointChanges`);
      assert.equal(typeof r.notes, 'string', `${name}: notes`);
      const ids = new Set(picks.map((p) => p.id));
      for (const w of r.winners) assert.ok(ids.has(w), `${name}: winner ${w} must be a player`);
      for (const k of Object.keys(r.pointChanges)) assert.ok(ids.has(k), `${name}: delta ${k} must be a player`);
    }
  });
  test(`${rule.id}: text fits (<= 60 chars)`, () => {
    assert.ok(rule.text.length <= 60, rule.text);
  });
  if (rule.smart) {
    test(`${rule.id}: smart pick in 1..10`, () => {
      for (let i = 0; i < 50; i++) {
        const n = rule.smart();
        assert.ok(Number.isInteger(n) && n >= 1 && n <= 10, String(n));
      }
    });
  }
}

test('rule ids are unique', () => {
  assert.equal(new Set(RULES.map((r) => r.id)).size, RULES.length);
});

test('lowest-unique', () => {
  assert.deepEqual(R('lowest-unique', P(1, 1, 3, 5)).winners, ['p2']);
  assert.deepEqual(R('lowest-unique', P(5, 5, 5)).winners, []);
  assert.deepEqual(R('lowest-unique', P(4)).winners, ['p0']);
});

test('highest-unique', () => {
  assert.deepEqual(R('highest-unique', P(10, 10, 9, 2)).winners, ['p2']);
  assert.deepEqual(R('highest-unique', P(2, 2, 8, 8)).winners, []);
});

test('closest-to-5 ties all win', () => {
  assert.deepEqual(R('closest-to-5', P(4, 6, 1)).winners, ['p0', 'p1']);
  assert.deepEqual(R('closest-to-5', P(5, 5, 5, 5)).winners, ['p0', 'p1', 'p2', 'p3']);
});

test('closest-to-average', () => {
  // avg of 2,4,9 = 5 -> 4 is closest
  assert.deepEqual(R('closest-to-average', P(2, 4, 9)).winners, ['p1']);
});

test('lucky-seven', () => {
  assert.deepEqual(R('lucky-seven', P(7, 3, 2)).winners, ['p0']);
  const clash = R('lucky-seven', P(7, 7, 2));
  assert.deepEqual(clash.winners, []);
  assert.deepEqual(clash.pointChanges, { p0: -5, p1: -5 });
  assert.deepEqual(R('lucky-seven', P(1, 2)).winners, []);
});

test('odd-only: highest odd wins', () => {
  assert.deepEqual(R('odd-only', P(1, 2, 3, 10)).winners, ['p2']);
  assert.deepEqual(R('odd-only', P(2, 4)).winners, []);
});

test('no-twins: twins lose 5, highest lone number wins', () => {
  const r = R('no-twins', P(9, 9, 3, 5));
  assert.deepEqual(r.winners, ['p3']);
  assert.deepEqual(r.pointChanges, { p0: -5, p1: -5 });
  assert.deepEqual(R('no-twins', P(4, 4)).winners, []);
});

test('engine: ties cancel out and feed the jackpot', () => {
  // Two players both pick 5 on "closest to 5": nobody scores.
  const r = scoreRound(RULES_BY_ID['closest-to-5'], P(5, 5, 1), { jackpot: 0, streaks: {} });
  assert.deepEqual(r.winners, []);
  assert.deepEqual(r.tied, ['p0', 'p1']);
  assert.equal(r.deltas.p0, 0);
  assert.equal(r.deltas.p1, 0);
  assert.equal(r.jackpot, 10);
});

test('engine: every rule gives at most one winner on random picks', () => {
  for (const rule of RULES) {
    for (let i = 0; i < 300; i++) {
      const picks = P(...Array.from({ length: 2 + (i % 5) }, () => 1 + Math.floor(Math.random() * 10)));
      const r = scoreRound(rule, picks, { jackpot: 0, streaks: {} });
      assert.ok(r.winners.length <= 1, `${rule.id} gave ${r.winners.length} winners`);
    }
  }
});

test('last-to-lock', () => {
  assert.deepEqual(R('last-to-lock', P(1, 2, 3)).winners, ['p2']);
});

test('ten-flips', () => {
  assert.deepEqual(R('ten-flips', P(10, 2, 5)).winners, ['p1']);
  assert.deepEqual(R('ten-flips', P(9, 2, 5)).winners, ['p0']);
});

test('second-highest', () => {
  assert.deepEqual(R('second-highest', P(10, 8, 8, 1)).winners, ['p1', 'p2']);
  assert.deepEqual(R('second-highest', P(5, 5)).winners, []);
});

test('engine: jackpot carries over and pays out', () => {
  const lu = RULES_BY_ID['lowest-unique'];
  let s = { jackpot: 0, streaks: {} };
  const r1 = scoreRound(lu, P(5, 5), s);
  assert.equal(r1.jackpot, 10);
  const r2 = scoreRound(lu, P(1, 5), { jackpot: r1.jackpot, streaks: r1.streaks });
  assert.equal(r2.deltas.p0, 20);
  assert.equal(r2.jackpot, 0);
});

test('engine: streak bonus on third win', () => {
  const lu = RULES_BY_ID['lowest-unique'];
  const r = scoreRound(lu, P(1, 5), { jackpot: 0, streaks: { p0: 2 } });
  assert.equal(r.deltas.p0, 15);
});

test('engine: penalties apply', () => {
  const r = scoreRound(RULES_BY_ID['lucky-seven'], P(7, 7, 1), { jackpot: 0, streaks: {} });
  assert.equal(r.deltas.p0, -5);
  assert.equal(r.jackpot, 10);
});

test('findLoser picks among lowest', () => {
  const players = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  for (let i = 0; i < 20; i++) {
    const l = findLoser(players, { a: 10, b: 0, c: 0 });
    assert.ok(['b', 'c'].includes(l.id));
  }
});
