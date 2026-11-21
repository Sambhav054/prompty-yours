# 🎰 Rule Roulette

**Team:** Prompty Yours · **Event:** Vibe Coders Hackathon Edition 3, Kolkata (21 November 2026) · **Track:** Play

**Play it:** **https://rule-roulette.onrender.com**. No sign-up. Opens on any phone.

Everyone secretly picks a number from 1 to 10. Then the rule drops, and it's different every round: "Lowest unique number wins", "Anyone picks 1? Highest wins, otherwise lowest wins", "Only one 6? They win 20. Two or more 6s each lose 10". **Whoever is in last place picks the next rule.** About 2–3 minutes a game, best of 3.

## How to play (the version on the play screen)

1. Pick a secret number from 1 to 10.
2. A rule shows who wins.
3. Same number as someone? You both are out.
4. Last place picks the next rule.
5. Most points at the end wins!

## What's in it

- **Play now:** a random table where bots fill empty seats after 5 seconds, so a stranger can always play, even alone.
- **Play with friends:** create a room and share the 4-letter code, up to 10 players. The host picks 6, 8 or 10 rounds and can cancel; public tables can only be left.
- **102 rules in 13 categories. Every one is decided only by what players pick, and only ONE player can gain points per round, with a number nobody else picked (same numbers cancel, never share):**
  - 59 from the team's v3 rulebook: greed, alone-or-together, crowd, averages, favourite numbers, revenge, nerves, wild cards and dares. Rules where the game draws a hidden number (snakes, lucky stars, dice, coin, raffle, hot seat) were removed.
  - 43 hand-picked cards from the 500-card book: Plot Twist, Greed & Regret, Neighbours and Stand Alone. For each family we kept the clearest one to three cards and skipped the near-duplicates.
- **No repeats:**
  - Every round of a game comes from a **different category**.
  - No rule repeats within a **best-of-3 match** (30 rules).
  - The server remembers the last 40 rules each player saw, so a new room doesn't replay them.
- **Fair scoring:**
  - Matching numbers knock each other out and the rule is replayed on the rest. If different numbers are still level (1 and 9 on "furthest from 5"), nobody wins and the points roll into a jackpot.
  - Group rules ("Share a number: +10", "Team Odd vs Team Even") pay everyone they name.
- **Fair turns:** the next rule is picked by someone in the bottom half of the scoreboard, never the same player twice in a row.
- **Hooks that make people say "one more game":**
  - Revenge bonus: win with the rule you picked and get +10.
  - Near-miss hint: "Pick 7 and you'd have won". It replays the real rule, so it's never fake.
  - Rivalry records ("You vs Asha 1–2. Revenge?"), best-of-3 with a champion medal, and confetti.
- **Sound:**
  - Synthesized live, with no audio files.
  - Wins get a bright rising arpeggio, the reveal climbs a major scale for suspense, and losses stay soft and short.
  - Based on research showing win sounds raise excitement. We deliberately don't disguise losses as wins.
- **Fast on cheap phones:** plain HTML, CSS and JS with no framework, and the game screens use the system font plus one display font.

## How it works

| File | Job |
|---|---|
| `shared/rules_v3.js`, `shared/rules_twist.js` | The rulebooks, as data |
| `shared/rulebook.js` | Interpreter for every rule type and the rule chooser (tiers, categories, no repeats) |
| `shared/engine.js` | Scoring: knock-outs, ties, jackpot, streaks, revenge, and who picks next |
| `server/room.js` | One room's game flow. The server is authoritative: it scores rounds and owns the timers |
| `server/server.js` | Express + WebSockets, rooms, quick match, reconnects |
| `public/` | Phone UI, landing wheel, sounds, confetti |

## Run and test

```
npm install
npm start          # http://localhost:3000
npm test           # 256 tests, including every rule on 1,500 random tables: every rule on edge cases, scoring, no-repeat, categories
npm run sim        # plays 100+ full games with bots: matches, cancel, 10-player cap, fairness
```

It's deployed on Render's free plan from `render.yaml`. Every push to `main` goes live automatically, and a GitHub Action keeps the server awake. There are no secrets or environment variables.

## 30-second demo script

1. **(0–5 s)** Open the link and tap the wheel: "No sign-up, just a name."
2. **(5–10 s)** Choose **Play now**, and bots fill the table. Or show a friend joining by code.
3. **(10–20 s)** Hand the phone to a stranger. The rule card drops, they tap a number, and the tiles flip with rising notes as the winner glows gold.
4. **(20–25 s)** Last place picks the next rule: "they choose the chaos".
5. **(25–30 s)** End screen: medal, confetti, rivalry. Their reaction is the proof.
