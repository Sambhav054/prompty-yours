// All game timings and scoring knobs live here so they are easy to tune.
export const CONFIG = {
  ROUNDS: 8,            // default rounds per game
  ROUND_OPTIONS: [6, 8, 10], // host can choose; all keep a game under 3 minutes
  PICK_MS: 8000,        // time to secretly pick a number
  REVEAL_MS: 6000,      // reveal + who won + commentary stays on screen
  LOSER_MS: 10000,      // last-place player chooses the next rule
  BOT_CHOOSE_MS: 1200,  // how long a bot "thinks" before choosing a rule
  MIN_PLAYERS: 3,       // bots fill seats up to this number
  MAX_PLAYERS: 6,
  QUICK_FILL_MS: 5000,  // quick match waits this long for humans, then bots fill
  ROUND_POINTS: 10,     // round winner gets this
  STREAK_BONUS: 5,      // extra for 3+ wins in a row
  REVENGE_BONUS: 10,    // last-place player picks a rule, then wins with it
  EMPTY_ROOM_MS: 60000, // delete a room this long after the last human leaves
};
