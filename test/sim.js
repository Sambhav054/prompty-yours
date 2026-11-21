// Plays many full games with bots (and one silent "human" who never picks)
// at high speed, to catch rule bugs, timer bugs and crashes.
// Run: npm run sim   (optionally: node test/sim.js 500)
import { CONFIG } from '../shared/config.js';
import { RULEBOOK_BY_ID as RULES_BY_ID } from '../shared/rulebook.js';
import { Room } from '../server/room.js';

const GAMES = Number(process.argv[2]) || 100;
const FAST = { ...CONFIG, PICK_MS: 20, REVEAL_MS: 2, LOSER_MS: 15, BOT_CHOOSE_MS: 1, EMPTY_ROOM_MS: 60000 };

function playOne(i) {
  return new Promise((resolve, reject) => {
    const watchdog = setTimeout(() => reject(new Error(`game ${i} hung in phase ${room.phase} round ${room.round}`)), 5000);
    const room = new Room('SIM' + i, {
      cfg: { ...FAST, MIN_PLAYERS: 2 + (i % 5) },
      onEnd: (r) => { clearTimeout(watchdog); r.cancelEmptyTimer(); resolve(r); },
    });
    // A "human" who goes silent: exercises auto-pick and auto-choose.
    if (i % 2 === 0) { room.addHuman('silent-' + i, 'Silent'); room.disconnect('silent-' + i); }
    room.rounds = FAST.ROUND_OPTIONS[i % 3];
    room.start();
  });
}

let ok = 0;
const ruleCount = {};
for (let i = 0; i < GAMES; i++) {
  const r = await playOne(i);
  if (r.round !== r.rounds) throw new Error(`game ${i} ended at round ${r.round}`);
  if (r.history.length !== r.rounds) throw new Error(`game ${i} history ${r.history.length}`);
  for (const id of r.history) {
    if (!RULES_BY_ID[id]) throw new Error(`unknown rule ${id}`);
    ruleCount[id] = (ruleCount[id] || 0) + 1;
  }
  for (const [id, s] of Object.entries(r.scores)) {
    if (!Number.isFinite(s)) throw new Error(`game ${i}: bad score for ${id}: ${s}`);
  }
  const lb = r.leaderboard();
  if (lb.length !== r.players.length) throw new Error(`game ${i}: leaderboard size`);
  ok++;
}
console.log(`OK: ${ok}/${GAMES} games finished cleanly.`);
console.log('Rules played:', ruleCount);

// Best-of-3 + grudges: keep rematching one room until the match is decided, several times.
{
  let decided = 0;
  for (let k = 0; k < 20; k++) {
    let resolveEnd;
    const room = new Room('MATCH' + k, { cfg: { ...FAST, MIN_PLAYERS: 4 }, onEnd: () => resolveEnd() });
    for (let g = 1; g <= 3; g++) {
      const done = new Promise((r) => (resolveEnd = r));
      room.start();
      await done;
      const m = room.match;
      if (m.game !== g) throw new Error(`match game ${m.game} != ${g}`);
      if (m.over) break;
    }
    const m = room.match;
    if (!m.over || !m.championId) throw new Error('match not decided after 3 games');
    if (Math.max(...Object.values(m.wins), 0) > 2) throw new Error('more than 2 match wins');
    const g = room.grudgesFor(room.players[0].id);
    if (!g.length) throw new Error('no grudges recorded');
    for (const x of g) if (x.you + x.them > m.game) throw new Error('grudge count exceeds games played');
    // A rematch after the match is over starts a fresh match.
    const done = new Promise((r) => (resolveEnd = r));
    room.start();
    if (room.match.game !== 1) throw new Error('new match did not reset');
    await done;
    room.cancelEmptyTimer();
    decided++;
  }
  console.log(`OK: ${decided}/20 best-of-3 matches decided, grudges recorded, new match resets.`);
}

// Host cancel + return to lobby: bots leave, the room accepts newcomers, match game is rolled back.
{
  const room = new Room('CANCEL', { cfg: { ...FAST, PICK_MS: 5000, END_MS: 30 } });
  room.addHuman('host', 'Host');
  room.start();
  if (room.phase !== 'pick' || room.players.length < 3) throw new Error('did not start with bots');
  room.cancel('someone-else');
  if (room.phase !== 'pick') throw new Error('non-host was able to cancel');
  room.cancel('host');
  if (room.phase !== 'lobby') throw new Error('cancel did not return to lobby');
  if (room.players.some((p) => p.bot)) throw new Error('bots stayed after cancel');
  if (room.match !== null) throw new Error('cancelled game counted toward the match');
  if (!room.addHuman('late', 'Latecomer').ok) throw new Error('newcomer could not join lobby');
  for (let i = 0; i < 8; i++) room.addHuman('x' + i, 'P' + i);
  if (room.players.length !== 10) throw new Error(`expected 10 players, got ${room.players.length}`);
  if (room.addHuman('eleven', 'Eleven').ok) throw new Error('11th player was let in');
  room.clearTimers(); room.cancelEmptyTimer();
  console.log('OK: host cancel, back-to-lobby, 10-player cap.');
}

// Public tables cannot be cancelled, only left.
{
  const room = new Room('PUBLIC', { isPublic: true, cfg: { ...FAST, PICK_MS: 5000 } });
  room.addHuman('h', 'Host');
  room.start();
  room.cancel('h');
  if (room.phase !== 'pick') throw new Error('public table was cancelled');
  room.clearTimers(); room.cancelEmptyTimer();
  console.log('OK: public tables cannot be cancelled.');
}

// Fairness: who picks the next rule rotates. Nobody chooses twice in a row.
{
  let back2back = 0, games = 0;
  const shares = [];
  for (let g = 0; g < 40; g++) {
    let done;
    const ended = new Promise((r) => (done = r));
    const room = new Room('FAIR' + g, { cfg: { ...FAST, MIN_PLAYERS: 4 }, onEnd: () => done() });
    const seq = [];
    const orig = room.loserPhase.bind(room);
    room.loserPhase = () => { orig(); seq.push(room.choice.loserId); };
    room.rounds = 10;
    room.start();
    await ended;
    room.clearTimers(); room.cancelEmptyTimer();
    for (let i = 1; i < seq.length; i++) if (seq[i] === seq[i - 1]) back2back++;
    const counts = {};
    for (const id of seq) counts[id] = (counts[id] || 0) + 1;
    shares.push(Math.max(...Object.values(counts)) / seq.length);
    games++;
  }
  if (back2back) throw new Error(`same chooser twice in a row ${back2back} times`);
  const avgMax = shares.reduce((a, b) => a + b, 0) / shares.length;
  console.log(`OK: fair chooser over ${games} games: never twice in a row, busiest chooser averages ${(avgMax * 100).toFixed(0)}% of picks.`);
}

// No rule repeats inside a best-of-3 played in a real room (30 rounds).
{
  for (let k = 0; k < 10; k++) {
    let done;
    const room = new Room('NOREP' + k, { cfg: { ...FAST, MIN_PLAYERS: 4 }, onEnd: () => done() });
    room.rounds = 10;
    const all = [];
    for (let g = 0; g < 3; g++) {
      const ended = new Promise((r) => (done = r));
      room.start();
      await ended;
      all.push(...room.history);
      if (room.match.over) break;
    }
    if (new Set(all).size !== all.length) throw new Error(`rule repeated within a match: ${all.length - new Set(all).size} repeats`);
    room.clearTimers(); room.cancelEmptyTimer();
  }
  console.log('OK: no rule repeats within any best-of-3 match.');
}

// After a game, everyone returns to the lobby and nothing starts by itself (public tables too).
{
  let done;
  const ended = new Promise((r) => (done = r));
  const room = new Room('NOAUTO', { isPublic: true, cfg: { ...FAST, END_MS: 20, QUICK_FILL_MS: 20 }, onEnd: () => done() });
  room.addHuman('h', 'Host');
  room.rounds = 6;
  room.start();
  await ended;
  await new Promise((r) => setTimeout(r, 120)); // results screen -> lobby, then well past the quick-fill time
  if (room.phase !== 'lobby') throw new Error(`expected lobby after a game, got ${room.phase}`);
  room.clearTimers(); room.cancelEmptyTimer();
  console.log('OK: after a game the table waits in the lobby; nothing auto-starts.');
}
