# 🎰 Rule Roulette

**Team:** Prompty Yours · **Event:** Vibe Coders Hackathon Edition 3, Kolkata (21 November 2026) · **Track:** Play

A party game for 2 to 6 phones. Everyone secretly picks a number from 1 to 10. Then the rule is revealed, like "Lowest UNIQUE number wins" or "Pick 7 to win, but two 7s both LOSE". The rule changes every round, and **whoever is in last place picks the next rule**. 10 rounds, about 2.5 minutes.

- No sign-up: type a name and play.
- **Play now** drops you into a room. Bots fill empty seats after 5 seconds, so you can always play, even alone.
- **Create room** gives a 4-letter code to share with friends.

## Play it

Live link: _coming soon_

## How it works

- `shared/rules.js`: the rulebook. Each rule is plain data plus a `resolve(picks)` function. Add a rule by copying a block.
- `shared/engine.js`: scoring, the jackpot that carries over when nobody wins, streak bonus, and finding the loser.
- `shared/bots.js`: bot characters (Overthinking Techie, Chaos Chacha, Copycat Cousin, Nervous Nani).
- `shared/config.js`: every timing in one place.
- `server/room.js`: one room's game flow. The server is authoritative: it picks rules and scores rounds, so nobody can cheat.
- `server/server.js`: Express plus WebSockets, rooms, quick match, reconnects.
- `public/`: the phone UI in plain HTML/CSS/JS, with sounds synthesized by WebAudio (no audio files).

## Run locally

```
npm install
npm start          # http://localhost:3000
npm test           # unit tests for every rule
npm run sim        # plays 100 bot games to catch bugs
```

## Deploy

The app is deployed on Render's free plan using `render.yaml` (New → Blueprint → this repo). There are no secrets or environment variables.
