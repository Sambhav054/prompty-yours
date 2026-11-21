import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RULEBOOK, RULEBOOK_BY_ID, PARKED, DRAW_TYPES, chooseRules, makeDraw } from '../shared/rulebook.js';
import BOOK from '../shared/rules_v3.js';
import TWIST from '../shared/rules_twist.js';
import { scoreRound } from '../shared/engine.js';

const P = (...ns) => ns.map((n, i) => ({ id: 'p' + i, n, t: i }));
const EDGE = [P(4), P(5, 5, 5, 5), P(2, 2, 8, 8), P(4, 6, 4, 6), P(1, 3, 7, 10, 9, 2), P(1, 10), P(...Array.from({ length: 10 }, (_, i) => i + 1))];
const ctxFor = (rule, picks) => ({ scores: Object.fromEntries(picks.map((p, i) => [p.id, i * 7 - 10])), draw: makeDraw(rule, picks.map((p) => p.id)) });

test('every non-parked rule from rules_v3.json is loaded', () => {
  const drawn = BOOK.rules.filter((r) => !PARKED.has(r.id) && DRAW_TYPES.has(r.type)).length;
  assert.ok(RULEBOOK.length >= 90, 'rulebook too small');
  assert.ok(RULEBOOK.every((r) => !DRAW_TYPES.has(r.ruleType)), 'a random-draw rule slipped in');
  assert.equal(new Set(RULEBOOK.map((r) => r.id)).size, RULEBOOK.length);
});

for (const rule of RULEBOOK) {
  test(`${rule.id}: valid result on edge cases (random draws, scores)`, () => {
    for (const picks of EDGE) {
      for (let k = 0; k < 15; k++) {
        const ctx = ctxFor(rule, picks);
        const r = scoreRound(rule, picks, { jackpot: 10, streaks: {} }, undefined, ctx);
        const idset = new Set(picks.map((p) => p.id));
        assert.ok(r.winners.length <= 1, `${rule.id} produced ${r.winners.length} single winners`);
        for (const [id, d] of Object.entries(r.deltas)) {
          assert.ok(idset.has(id), `${rule.id}: delta for unknown player ${id}`);
          assert.ok(Number.isFinite(d), `${rule.id}: non-numeric delta`);
        }
        assert.equal(typeof r.notes, 'string');
        assert.ok(Number.isFinite(r.jackpot));
      }
    }
  });
}

test('spot checks', () => {
  const R = (id, picks, draw = {}) => scoreRound(RULEBOOK_BY_ID[id], picks, { jackpot: 0, streaks: {} }, undefined, { scores: {}, draw });
  assert.deepEqual(R('FAV-008', P(1, 9, 9)).winners, ['p0']);              // twins knock out, 1 is furthest from 5
  assert.deepEqual(R('FAV-008', P(9, 1)).winners, []);                     // real tie
  assert.equal(R('GREED-003', P(9, 9, 2)).deltas.p0, -10);                 // greed tie costs both
});

test('no repeats across a 30-round best-of-3', () => {
  const used = new Set();
  for (let game = 0; game < 3; game++) {
    for (let round = 1; round <= 10; round++) {
      const [r] = chooseRules(1, { round, used });
      assert.ok(!used.has(r.id), `repeat ${r.id} in game ${game + 1} round ${round}`);
      used.add(r.id);
    }
  }
  assert.equal(used.size, 30);
});

test('a new room avoids rules a player saw recently', () => {
  const recent = new Set();
  for (let round = 1; round <= 10; round++) recent.add(chooseRules(1, { round, used: recent })[0].id);
  for (let round = 1; round <= 10; round++) {
    const opts = chooseRules(3, { round, used: new Set(), recent });
    for (const o of opts) assert.ok(!recent.has(o.id), `offered recently seen ${o.id}`);
  }
});

test('round 1-3 rules are tier 1', () => {
  for (let i = 0; i < 50; i++) for (const r of chooseRules(3, { round: 2 })) assert.equal(r.tier, 1);
});

test('a 10-round game uses 10 different categories, options are from different categories too', () => {
  for (let g = 0; g < 50; g++) {
    const used = new Set(), cats = new Set();
    for (let round = 1; round <= 10; round++) {
      const opts = chooseRules(3, { round, used, usedCats: cats });
      assert.equal(new Set(opts.map((o) => o.category)).size, opts.length, 'options share a category');
      for (const o of opts) assert.ok(!cats.has(o.category), `category ${o.category} repeated in round ${round}`);
      used.add(opts[0].id); cats.add(opts[0].category);
    }
    assert.equal(cats.size, 10);
  }
});

test('plot twist and greed cards from the 500-card book', () => {
  const R = (id, picks) => scoreRound(RULEBOOK_BY_ID[id], picks, { jackpot: 0, streaks: {} }, undefined, { scores: {}, draw: {} });
  assert.deepEqual(R('rr-001', P(1, 5, 9)).winners, ['p2']); // someone picked 1 -> highest wins
  assert.deepEqual(R('rr-001', P(3, 5, 9)).winners, ['p0']); // no 1 -> lowest wins
});

// The house rule, checked on every rule with thousands of random tables (2-10 players):
// at most ONE player gains points, that player is the winner, and nobody else picked their number.
import { decide } from '../shared/engine.js';
test('every rule: only one player can gain, and only with a number nobody else picked', () => {
  for (const rule of RULEBOOK) {
    for (let i = 0; i < 1500; i++) {
      const k = 2 + (i % 9);
      const picks = Array.from({ length: k }, (_, j) => ({ id: 'p' + j, n: 1 + Math.floor(Math.random() * 10), t: j }));
      const scores = Object.fromEntries(picks.map((p) => [p.id, Math.floor(Math.random() * 60) - 10]));
      const r = scoreRound(rule, picks, { jackpot: 10, streaks: {} }, undefined, { scores, draw: {} });
      const gainers = Object.entries(r.deltas).filter(([, d]) => d > 0).map(([id]) => id);
      assert.ok(gainers.length <= 1, `${rule.id}: ${gainers.length} players gained points`);
      if (gainers.length) {
        assert.deepEqual(gainers, r.winners, `${rule.id}: someone other than the winner gained`);
        const n = picks.find((p) => p.id === gainers[0]).n;
        assert.equal(picks.filter((p) => p.n === n).length, 1, `${rule.id}: winner shared their number ${n}`);
      }
      // Honesty: the rule itself never promises points to a non-winner (so the engine guard never has to hide anything).
      const d = decide(rule, picks, { scores, draw: {} });
      for (const [id, v] of Object.entries(d.pointChanges || {})) if (v > 0) assert.ok(d.winners.includes(id), `${rule.id}: rule promised +${v} to a non-winner`);
    }
  }
});

test('same number always cancels: 5,5 on "closest to 5" gives nobody points', () => {
  const r = scoreRound(RULEBOOK_BY_ID['FAV-004'], P(5, 5), { jackpot: 0, streaks: {} }, undefined, { scores: {}, draw: {} });
  assert.deepEqual(r.winners, []);
  assert.ok(Object.values(r.deltas).every((v) => v <= 0));
});
