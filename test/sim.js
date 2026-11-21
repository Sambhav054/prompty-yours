// Plays many full games with bots (and one silent "human" who never picks)
// at high speed, to catch rule bugs, timer bugs and crashes.
// Run: npm run sim   (optionally: node test/sim.js 500)
import { CONFIG } from '../shared/config.js';
import { RULES_BY_ID } from '../shared/rules.js';
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
