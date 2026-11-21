// All game timings and scoring knobs live here so they are easy to tune.
export const CONFIG = {
  ROUNDS: 10,
  PICK_MS: 6000,        // time to secretly pick a number
  REVEAL_MS: 4500,      // drumroll reveal + result + commentary
  LOSER_MS: 10000,      // last-place player chooses the next rule
  BOT_CHOOSE_MS: 1200,  // how long a bot "thinks" before choosing a rule
  MIN_PLAYERS: 3,       // bots fill seats up to this number
  MAX_PLAYERS: 6,
  QUICK_FILL_MS: 5000,  // quick match waits this long for humans, then bots fill
  ROUND_POINTS: 10,     // round winner gets this
  STREAK_BONUS: 5,      // extra for 3+ wins in a row
  EMPTY_ROOM_MS: 60000, // delete a room this long after the last human leaves
};
