// One game room. The server owns all state: it picks rules, collects picks, scores rounds.
// Transport-agnostic: the server passes onChange to push state to sockets; the simulator passes nothing.
import { CONFIG } from '../shared/config.js';
import { RULES, RULES_BY_ID, randomRules } from '../shared/rules.js';
import { BOTS, botByKey } from '../shared/bots.js';
import { scoreRound, findLoser } from '../shared/engine.js';
import { commentary } from '../shared/commentary.js';

const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

export class Room {
  constructor(code, { isPublic = false, cfg = CONFIG, onChange = () => {}, onEnd = () => {}, onEmpty = () => {} } = {}) {
    this.code = code;
    this.isPublic = isPublic;
    this.cfg = cfg;
    this.onChange = onChange;
    this.onEnd = onEnd;
    this.onEmpty = onEmpty;
    this.players = []; // { id, nick, bot: key|null, emoji, connected }
    this.hostId = null;
    this.phase = 'lobby'; // lobby | pick | reveal | choose | end
    this.round = 0;
    this.scores = {};
    this.streaks = {};
    this.jackpot = 0;
    this.rule = null;
    this.picks = new Map();
    this.lockCounter = 0;
    this.deadline = 0;
    this.phaseMs = 0;
    this.lastReveal = null;
    this.choice = null;
    this.lastPickBy = {};
    this.lastWinningPick = null;
    this.quickStartAt = 0;
    this.timers = new Set();
    this.emptyTimer = null;
    this.history = []; // rule ids played, for the simulator
    this.ruleChosenBy = null; // last-place player who picked this round's rule (for revenge)
    this.rounds = cfg.ROUNDS;
  }

  // Host picks the game length in the lobby (only allowed values).
  setRounds(id, n) {
    if (id !== this.hostId || (this.phase !== 'lobby' && this.phase !== 'end')) return;
    n = Number(n);
    if (!this.cfg.ROUND_OPTIONS.includes(n)) return;
    this.rounds = n;
    this.emit();
  }

  // ---------- timers ----------
  later(ms, fn) {
    const t = setTimeout(() => {
      this.timers.delete(t);
      try { fn(); } catch (e) { console.error('room timer error', this.code, e); }
    }, ms);
    this.timers.add(t);
    return t;
  }
  clearTimers() {
    for (const t of this.timers) clearTimeout(t);
    this.timers.clear();
  }
  setPhase(phase, ms) {
    this.phase = phase;
    this.phaseMs = ms || 0;
    this.deadline = ms ? Date.now() + ms : 0;
  }
  emit() { this.onChange(this); }

  // ---------- players ----------
  humans() { return this.players.filter((p) => !p.bot); }
  connectedHumans() { return this.players.filter((p) => !p.bot && p.connected); }
  get(id) { return this.players.find((p) => p.id === id); }
  isFull() { return this.players.length >= this.cfg.MAX_PLAYERS; }

  uniqueNick(nick) {
    const taken = new Set(this.players.map((p) => p.nick.toLowerCase()));
    if (!taken.has(nick.toLowerCase())) return nick;
    for (let i = 2; ; i++) if (!taken.has(`${nick} ${i}`.toLowerCase())) return `${nick} ${i}`;
  }

  // Returns { ok, error }
  addHuman(id, nick) {
    const existing = this.get(id);
    if (existing) {
      existing.connected = true;
      this.cancelEmptyTimer();
      this.emit();
      return { ok: true };
    }
    if (this.phase !== 'lobby' && this.phase !== 'end') return { ok: false, error: 'Game already running. Try another room.' };
    if (this.isFull()) {
      // Make room by kicking a bot if there is one.
      const bot = this.players.find((p) => p.bot);
      if (!bot) return { ok: false, error: 'Room is full.' };
      this.removePlayer(bot.id, true);
    }
    this.players.push({ id, nick: this.uniqueNick(nick), bot: null, emoji: '🙂', connected: true });
    this.scores[id] = this.scores[id] || 0;
    if (!this.hostId || !this.get(this.hostId)?.connected) this.hostId = id;
    this.cancelEmptyTimer();
    this.emit();
    return { ok: true };
  }

  addBot() {
    const used = new Set(this.players.filter((p) => p.bot).map((p) => p.bot));
    const def = BOTS.find((b) => !used.has(b.key)) || BOTS[rand(0, BOTS.length - 1)];
    const id = `bot-${def.key}-${Math.random().toString(36).slice(2, 6)}`;
    this.players.push({ id, nick: this.uniqueNick(def.name), bot: def.key, emoji: def.emoji, connected: true });
    this.scores[id] = 0;
  }

  fillBots(min) {
    while (this.players.length < Math.min(min, this.cfg.MAX_PLAYERS)) this.addBot();
  }

  removePlayer(id, silent = false) {
    this.players = this.players.filter((p) => p.id !== id);
    this.picks.delete(id);
    if (this.hostId === id) this.hostId = this.connectedHumans()[0]?.id || null;
    if (!silent) this.emit();
  }

  disconnect(id) {
    const p = this.get(id);
    if (!p) return;
    if (this.phase === 'lobby' || this.phase === 'end') this.removePlayer(id, true);
    else p.connected = false;
    if (this.hostId === id) this.hostId = this.connectedHumans()[0]?.id || null;
    // If the disconnected player was choosing a rule, auto-choose quickly.
    if (this.phase === 'choose' && this.choice?.loserId === id) this.later(800, () => this.autoChoose());
    if (!this.connectedHumans().length) this.startEmptyTimer();
    this.emit();
  }

  startEmptyTimer() {
    this.cancelEmptyTimer();
    this.emptyTimer = setTimeout(() => {
      if (!this.connectedHumans().length) { this.clearTimers(); this.onEmpty(this); }
    }, this.cfg.EMPTY_ROOM_MS);
  }
  cancelEmptyTimer() {
    if (this.emptyTimer) clearTimeout(this.emptyTimer);
    this.emptyTimer = null;
  }

  // ---------- game flow ----------
  start() {
    if (this.phase !== 'lobby' && this.phase !== 'end') return;
    this.clearTimers();
    // Drop humans who left, keep bots.
    this.players = this.players.filter((p) => p.bot || p.connected);
    this.fillBots(this.cfg.MIN_PLAYERS);
    this.scores = Object.fromEntries(this.players.map((p) => [p.id, 0]));
    this.streaks = {};
    this.jackpot = 0;
    this.round = 0;
    this.lastReveal = null;
    this.choice = null;
    this.lastPickBy = {};
    this.lastWinningPick = null;
    this.history = [];
    this.ruleChosenBy = null;
    // Best-of-3 match: a new match starts after the previous one is decided.
    if (!this.match || this.match.over) {
      this.match = { game: 1, of: 3, wins: {}, totals: {}, over: false, championId: null, gameWinnerId: null };
    } else {
      this.match.game += 1;
      this.match.gameWinnerId = null;
    }
    this.rule = RULES[rand(0, RULES.length - 1)];
    this.nextRound();
  }

  nextRound() {
    this.round += 1;
    this.picks = new Map();
    this.lockCounter = 0;
    this.choice = null;
    this.history.push(this.rule.id);
    this.setPhase('pick', this.cfg.PICK_MS);
    for (const p of this.players.filter((x) => x.bot)) {
      const delay = rand(Math.min(400, this.cfg.PICK_MS / 4), Math.max(1, Math.min(3500, this.cfg.PICK_MS - 500)));
      this.later(delay, () => {
        const def = botByKey(p.bot);
        const n = def.pick(this.rule, { lastWinningPick: this.lastWinningPick });
        this.pick(p.id, n);
      });
    }
    this.later(this.cfg.PICK_MS, () => this.endPick());
    this.emit();
  }

  pick(id, n) {
    if (this.phase !== 'pick') return;
    if (!this.get(id) || this.picks.has(id)) return;
    n = Number(n);
    if (!Number.isInteger(n) || n < 1 || n > 10) return;
    this.picks.set(id, { id, n, t: this.lockCounter++ });
    if (this.picks.size >= this.players.length) this.endPick();
    else this.emit();
  }

  endPick() {
    if (this.phase !== 'pick') return;
    this.clearTimers();
    // Anyone who did not pick gets a random number (locked in after everyone else).
    for (const p of shuffle(this.players)) {
      if (!this.picks.has(p.id)) this.picks.set(p.id, { id: p.id, n: rand(1, 10), t: this.lockCounter++, auto: true });
    }
    const list = [...this.picks.values()];
    const res = scoreRound(this.rule, list.map(({ id, n, t }) => ({ id, n, t })), {
      jackpot: this.jackpot,
      streaks: this.streaks,
    }, this.cfg);
    // Revenge: the last-place player picked this rule and then won with it.
    const revengeId = this.ruleChosenBy && res.winners.includes(this.ruleChosenBy) ? this.ruleChosenBy : null;
    if (revengeId) res.deltas[revengeId] = (res.deltas[revengeId] || 0) + this.cfg.REVENGE_BONUS;
    for (const [id, d] of Object.entries(res.deltas)) this.scores[id] = (this.scores[id] || 0) + d;
    this.jackpot = res.jackpot;
    this.streaks = res.streaks;

    const nickOf = (id) => this.get(id)?.nick || '?';
    const losers = list.filter((p) => !res.winners.includes(p.id) && !res.tied.includes(p.id));
    const roasted = losers.length ? losers[rand(0, losers.length - 1)] : null;
    const repeated = roasted ? this.lastPickBy[roasted.id] === roasted.n : false;
    for (const p of list) this.lastPickBy[p.id] = p.n;
    if (res.winners.length) this.lastWinningPick = this.picks.get(res.winners[0]).n;

    const line = commentary({
      winners: res.winners.map(nickOf),
      tiedCount: res.tied.length,
      jackpot: this.jackpot,
      roaster: roasted ? nickOf(roasted.id) : null,
      roastNumber: roasted?.n,
      repeated,
      revenge: !!revengeId,
    });

    // Reveal order: winners first... no, suspense: roasted pick goes last.
    const order = shuffle(list).sort((a, b) => (a.id === roasted?.id) - (b.id === roasted?.id));
    this.lastReveal = {
      round: this.round,
      rule: { id: this.rule.id, text: this.rule.text },
      picks: order.map((p) => ({ id: p.id, nick: nickOf(p.id), emoji: this.get(p.id)?.emoji, n: p.n, t: p.t, auto: !!p.auto })),
      winners: res.winners,
      tied: res.tied,
      revengeId,
      chosenBy: this.ruleChosenBy,
      deltas: res.deltas,
      notes: res.notes,
      line,
      roastedId: roasted?.id || null,
      jackpot: this.jackpot,
    };
    this.setPhase('reveal', this.cfg.REVEAL_MS);
    this.later(this.cfg.REVEAL_MS, () => {
      if (this.round >= this.rounds) this.end();
      else this.loserPhase();
    });
    this.emit();
  }

  loserPhase() {
    const loser = findLoser(this.players, this.scores);
    const options = randomRules(3, this.rule.id);
    this.choice = { loserId: loser.id, options: options.map((r) => r.id) };
    this.setPhase('choose', this.cfg.LOSER_MS);
    if (loser.bot || !loser.connected) {
      this.later(this.cfg.BOT_CHOOSE_MS, () => {
        const def = loser.bot ? botByKey(loser.bot) : null;
        const pickRule = def ? def.choose(options) : options[rand(0, options.length - 1)];
        this.applyChoice(pickRule.id, loser.bot ? loser.id : null);
      });
    }
    this.later(this.cfg.LOSER_MS, () => this.autoChoose());
    this.emit();
  }

  autoChoose() {
    if (this.phase !== 'choose') return;
    const opts = this.choice.options;
    this.applyChoice(opts[rand(0, opts.length - 1)], null); // timed out: no revenge chance
  }

  chooseRule(id, ruleId) {
    if (this.phase !== 'choose' || this.choice?.loserId !== id) return;
    if (!this.choice.options.includes(ruleId)) return;
    this.applyChoice(ruleId, id);
  }

  applyChoice(ruleId, chooserId) {
    if (this.phase !== 'choose') return;
    this.clearTimers();
    this.ruleChosenBy = chooserId;
    this.rule = RULES_BY_ID[ruleId];
    this.nextRound();
  }

  end() {
    this.clearTimers();
    const lb = this.leaderboard();
    this.recordGrudges(lb);
    this.recordMatch(lb);
    this.setPhase('end', 0);
    this.emit();
    this.onEnd(this);
  }

  // Grudge tracker: head-to-head record between every pair of players in this room, across rematches.
  recordGrudges(lb) {
    this.grudges = this.grudges || {};
    for (let i = 0; i < lb.length; i++) {
      for (let j = i + 1; j < lb.length; j++) {
        const a = lb[i], b = lb[j];
        if (a.score === b.score) continue; // a draw counts for nobody
        const key = [a.id, b.id].sort().join('|');
        const g = (this.grudges[key] = this.grudges[key] || {});
        g[a.id] = (g[a.id] || 0) + 1; // a finished above b
        g[b.id] = g[b.id] || 0;
      }
    }
  }

  grudgesFor(id) {
    if (!this.grudges) return [];
    const out = [];
    for (const [key, g] of Object.entries(this.grudges)) {
      const [x, y] = key.split('|');
      if (x !== id && y !== id) continue;
      const opp = this.get(x === id ? y : x);
      if (!opp) continue;
      out.push({ oppId: opp.id, oppNick: opp.nick, oppEmoji: opp.emoji, oppBot: !!opp.bot, you: g[id] || 0, them: g[opp.id] || 0 });
    }
    // Humans first, then the closest-fought and most-played rivalries.
    return out
      .sort((p, q) => (p.oppBot - q.oppBot) || ((q.you + q.them) - (p.you + p.them)))
      .slice(0, 3);
  }

  // Best-of-3: the game winner (outright, no tie at the top) takes a match point.
  recordMatch(lb) {
    const m = this.match;
    if (!m) return;
    for (const p of lb) m.totals[p.id] = (m.totals[p.id] || 0) + p.score;
    const top = lb[0];
    const outright = top && !(lb[1] && lb[1].score === top.score);
    m.gameWinnerId = outright ? top.id : null;
    if (outright) m.wins[top.id] = (m.wins[top.id] || 0) + 1;
    const maxWins = Math.max(0, ...Object.values(m.wins));
    if (maxWins >= 2 || m.game >= m.of) {
      m.over = true;
      const ranked = Object.keys(m.totals)
        .filter((id) => this.get(id))
        .sort((a, b) => ((m.wins[b] || 0) - (m.wins[a] || 0)) || (m.totals[b] - m.totals[a]));
      m.championId = ranked[0] || null;
    }
  }

  matchView() {
    const m = this.match;
    if (!m) return null;
    const nick = (id) => this.get(id)?.nick || '?';
    return {
      game: m.game,
      of: m.of,
      over: m.over,
      gameWinnerId: m.gameWinnerId,
      championId: m.championId,
      championNick: m.championId ? nick(m.championId) : null,
      standings: this.players
        .map((p) => ({ id: p.id, nick: p.nick, emoji: p.emoji, wins: m.wins[p.id] || 0 }))
        .sort((a, b) => b.wins - a.wins),
    };
  }

  leaderboard() {
    return [...this.players]
      .map((p) => ({ id: p.id, nick: p.nick, emoji: p.emoji, bot: !!p.bot, score: this.scores[p.id] || 0 }))
      .sort((a, b) => b.score - a.score);
  }

  // What one player is allowed to see.
  snapshot(forId) {
    const nickOf = (id) => this.get(id)?.nick || '?';
    return {
      code: this.code,
      isPublic: this.isPublic,
      phase: this.phase,
      round: this.round,
      rounds: this.rounds,
      roundOptions: this.cfg.ROUND_OPTIONS,
      jackpot: this.jackpot,
      you: forId,
      hostId: this.hostId,
      remaining: this.deadline ? Math.max(0, this.deadline - Date.now()) : 0,
      phaseMs: this.phaseMs,
      quickStartIn: this.phase === 'lobby' && this.quickStartAt ? Math.max(0, this.quickStartAt - Date.now()) : 0,
      rule: this.rule ? { id: this.rule.id, text: this.rule.text, type: this.rule.type } : null,
      players: this.players.map((p) => ({
        id: p.id,
        nick: p.nick,
        emoji: p.emoji,
        bot: !!p.bot,
        connected: p.connected,
        score: this.scores[p.id] || 0,
        locked: this.phase === 'pick' && this.picks.has(p.id),
      })),
      yourPick: this.picks.get(forId)?.n ?? null,
      reveal: this.phase === 'reveal' || this.phase === 'choose' || this.phase === 'end' ? this.lastReveal : null,
      choice: this.phase === 'choose' && this.choice
        ? {
            loserId: this.choice.loserId,
            loserNick: nickOf(this.choice.loserId),
            options: this.choice.options.map((id) => ({ id, text: RULES_BY_ID[id].text, type: RULES_BY_ID[id].type })),
          }
        : null,
      leaderboard: this.phase === 'end' ? this.leaderboard() : null,
      match: this.matchView(),
      grudges: this.phase === 'end' ? this.grudgesFor(forId) : [],
    };
  }
}
