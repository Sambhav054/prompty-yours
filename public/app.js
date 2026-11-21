// Rule Roulette phone client. Talks to the server over a WebSocket and renders whatever state it gets.
import { sound } from './sound.js';
import { RULES_BY_ID } from '/shared/rules.js';

const $app = document.getElementById('app');
const $toast = document.getElementById('toast');

// ---------- identity (no sign-up: a random id + nickname kept on this phone) ----------
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};
let pid = store.get('rr_pid');
if (!pid) { pid = 'p' + Math.random().toString(36).slice(2, 12); store.set('rr_pid', pid); }
let nick = store.get('rr_nick') || '';
const urlRoom = new URLSearchParams(location.search).get('room');

// ---------- state ----------
let S = null;               // latest server snapshot
let deadline = 0;           // local clock time the current phase ends
let ws = null;
let connected = false;
let currentCode = store.get('rr_room') || null;
let revealRound = 0;        // which round's reveal we have animated
let revealShown = 0;        // how many picks are flipped so far
let revealTimer = null;
let lastPhaseKey = '';

// ---------- helpers ----------
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function toast(msg) {
  $toast.textContent = msg;
  $toast.style.display = 'block';
  clearTimeout(toast.t);
  toast.t = setTimeout(() => ($toast.style.display = 'none'), 3000);
}
function send(msg) {
  if (ws && ws.readyState === 1) ws.send(JSON.stringify({ ...msg, pid }));
  else toast('Connecting… try again in a second');
}
const me = () => S?.players.find((p) => p.id === pid);

// ---------- connection ----------
function connect() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  ws = new WebSocket(`${proto}://${location.host}/ws`);
  ws.onopen = () => {
    connected = true;
    // Rejoin our room after a refresh or network blip.
    if (currentCode) ws.send(JSON.stringify({ t: 'join', code: currentCode, nick: nick || 'Player', pid }));
    render();
  };
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.t === 'state') onState(m.s);
    else if (m.t === 'error') {
      toast(m.message);
      if (S === null || m.message.startsWith('No room')) { S = null; currentCode = null; store.del('rr_room'); render(); }
    } else if (m.t === 'left') {
      S = null; currentCode = null; store.del('rr_room'); render();
    }
  };
  ws.onclose = () => {
    connected = false;
    render();
    setTimeout(connect, 1200);
  };
}

function onState(s) {
  const prev = S;
  S = s;
  currentCode = s.code;
  store.set('rr_room', s.code);
  deadline = Date.now() + (s.remaining || 0);
  if (s.quickStartIn) deadline = Date.now() + s.quickStartIn;

  const key = `${s.phase}:${s.round}`;
  const phaseChanged = key !== lastPhaseKey;
  lastPhaseKey = key;

  if (phaseChanged && s.phase === 'reveal' && s.reveal && s.reveal.round !== revealRound) startReveal(s.reveal);
  if (phaseChanged && s.phase === 'choose' && s.choice?.loserId === pid) { sound.spotlight(); navigator.vibrate?.([60, 40, 60]); }
  if (phaseChanged && s.phase === 'pick' && prev?.phase !== 'pick') { /* new round */ }
  render();
}

// ---------- reveal animation: flip picks one by one, roasted pick last ----------
function startReveal(rev) {
  revealRound = rev.round;
  revealShown = 0;
  clearInterval(revealTimer);
  const step = Math.min(450, 2200 / Math.max(1, rev.picks.length));
  revealTimer = setInterval(() => {
    revealShown++;
    sound.flip();
    if (revealShown >= rev.picks.length) {
      clearInterval(revealTimer);
      if (rev.winners.includes(pid)) { sound.win(); navigator.vibrate?.(80); }
      else if (rev.roastedId === pid) { sound.lose(); navigator.vibrate?.([100, 50, 100]); }
    }
    render();
  }, step);
}

// ---------- timer bar: redrawn every animation frame for a smooth, continuous decay ----------
let lastTickSec = -1;
const timeLeft = () => Math.max(0, deadline - Date.now());
const phaseTotal = () => (S?.phase === 'lobby' ? 5000 : S?.phaseMs || 1);
const barScale = () => Math.min(1, timeLeft() / phaseTotal());
function frame() {
  if (S) {
    const left = timeLeft();
    const bar = document.querySelector('.timer > div');
    if (bar) {
      bar.style.transform = `scaleX(${barScale()})`;
      bar.parentElement.classList.toggle('urgent', left < 2000);
    }
    const sec = Math.ceil(left / 1000);
    const label = document.querySelector('[data-countdown]');
    if (label && label.textContent !== String(sec)) label.textContent = sec;
    if (S.phase === 'pick' && S.yourPick == null && sec <= 3 && sec > 0 && sec !== lastTickSec) sound.tick();
    lastTickSec = sec;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
// Timer markup starts at the right width, so a re-render never makes the bar jump.
const timerBar = () => `<div class="timer"><div style="transform:scaleX(${barScale()})"></div></div>`;

// ---------- screens ----------
function render() {
  if (!S) return renderHome();
  switch (S.phase) {
    case 'lobby': return renderLobby();
    case 'pick': return renderPick();
    case 'reveal': return renderReveal();
    case 'choose': return renderChoose();
    case 'end': return renderEnd();
  }
}

function topbar() {
  return `<div class="topbar">
    <span class="pill">Round ${S.round}/${S.rounds}</span>
    <span class="pill jackpot">💰 Jackpot ${S.jackpot}</span>
    <span class="pill">Room ${esc(S.code)}</span>
    <button class="exit" data-act="exit" aria-label="Exit game">✕ Exit</button>
  </div>`;
}
function chips(showLock) {
  return `<div class="players">${S.players
    .map((p) => `<span class="chip ${showLock && p.locked ? 'locked' : ''} ${p.connected ? '' : 'off'}">
      ${esc(p.emoji)} ${esc(p.id === pid ? 'You' : p.nick)} <span class="score">${p.score}</span>${showLock && p.locked ? ' ✔' : ''}
    </span>`)
    .join('')}</div>`;
}

function renderHome() {
  $app.innerHTML = `
    <div class="stack">
      <h1>🎰 Rule Roulette</h1>
      <p class="muted">Everyone picks a number 1–10. The rule decides who wins, and it changes every round. Last place picks the next rule.</p>
      <input id="nick" maxlength="14" placeholder="Your name" value="${esc(nick)}" autocomplete="nickname" />
      <button class="big" data-act="quick">⚡ Play now</button>
      <div class="row">
        <button class="secondary" data-act="create">Create room</button>
      </div>
      <div class="row">
        <input id="code" class="code-input" maxlength="4" placeholder="CODE" value="${esc(urlRoom || '')}" />
        <button class="secondary" data-act="join">Join</button>
      </div>
      <p class="muted small center">${connected ? 'No sign-up. Just a name.' : 'Connecting to server…'}</p>
    </div>`;
  if (urlRoom) document.getElementById('code').focus();
}

function renderLobby() {
  const isHost = S.hostId === pid;
  const link = `${location.origin}/?room=${S.code}`;
  $app.innerHTML = `
    <div class="stack">
      <h1>Room</h1>
      <div class="card center">
        <p class="muted">Room code</p>
        <div class="code-big">${esc(S.code)}</div>
        ${S.isPublic ? '' : `<button class="secondary" data-act="share">📤 Invite friends</button>`}
      </div>
      <h2>Players (${S.players.length}/6)</h2>
      ${chips(false)}
      ${S.isPublic
        ? `<p class="center">Starting in <b data-countdown>5</b>s… bots fill empty seats.</p>${timerBar()}`
        : isHost
          ? `<h2>Rounds</h2>
             <div class="row seg">${S.roundOptions.map((n) => `<button class="${n === S.rounds ? '' : 'secondary'}" data-act="rounds" data-n="${n}">${n}</button>`).join('')}</div>
             <button class="big" data-act="start">▶ Start ${S.rounds}-round game</button><p class="muted small center">Bots join if you're fewer than 3.</p>`
          : `<p class="center muted">${S.rounds} rounds · Waiting for the host to start…</p>`}
      <button class="secondary" data-act="leave">Leave</button>
    </div>`;
  document.querySelector('[data-act="share"]')?.setAttribute('data-link', link);
}

function renderPick() {
  const mine = S.yourPick;
  const fresh = renderPick.round !== S.round; // animate the rule card only when a new round starts
  renderPick.round = S.round;
  $app.innerHTML = `
    ${topbar()}
    <div class="rule ${fresh ? 'pop' : ''}"><div class="label">This round's rule</div><div class="text">${esc(S.rule.text)}</div>
      <div class="sub">Ties cancel out${S.jackpot ? ` · Jackpot ${S.jackpot}` : ''}</div></div>
    ${timerBar()}
    <p class="center">${mine == null ? 'Pick a number, quick! <b data-countdown></b>' : `Locked in <b>${mine}</b> ✔ Waiting for others…`}</p>
    <div class="pad">${Array.from({ length: 10 }, (_, i) => i + 1)
      .map((n) => `<button data-act="pick" data-n="${n}" class="${mine === n ? 'mine' : ''}" ${mine != null ? 'disabled' : ''}>${n}</button>`)
      .join('')}</div>
    ${chips(true)}`;
}

function revealBlock(rev, animate) {
  const shown = animate ? revealShown : rev.picks.length;
  const done = shown >= rev.picks.length;
  const items = rev.picks.map((p, i) => {
    const visible = i < shown;
    const d = rev.deltas[p.id] || 0;
    const cls = !visible ? 'hidden'
      : done && rev.winners.includes(p.id) ? 'win'
      : done && rev.tied?.includes(p.id) ? 'tie'
      : done && rev.roastedId === p.id ? 'roast shake' : '';
    return `<div class="reveal-item ${cls}">
      <span>${esc(p.emoji)} ${esc(p.id === pid ? 'You' : p.nick)}${p.auto && visible ? ' <span class="muted small">(auto)</span>' : ''}</span>
      <span>${done && d ? `<span class="delta ${d > 0 ? 'up' : 'down'}">${d > 0 ? '+' : ''}${d}</span> ` : ''}<span class="num">${visible ? p.n : '?'}</span></span>
    </div>`;
  }).join('');
  const miss = done ? nearMiss(rev) : '';
  return `${done && rev.revengeId ? `<div class="banner pop">⚔️ REVENGE! ${esc(rev.revengeId === pid ? 'You' : rev.picks.find((p) => p.id === rev.revengeId)?.nick)} +${10}</div>` : ''}
    <div class="reveal-list">${items}</div>
    ${done ? `<p class="center muted">${esc(rev.notes)}</p><p class="line pop">${esc(rev.line)}</p>${miss ? `<p class="miss pop">${esc(miss)}</p>` : ''}` : `<p class="center muted">🥁 Drumroll…</p>`}`;
}

// Near-miss: re-run the real rule with every other number in place of yours.
function nearMiss(rev) {
  if (rev.winners.includes(pid)) return '';
  const mine = rev.picks.find((p) => p.id === pid);
  const rule = RULES_BY_ID[rev.rule.id];
  if (!mine || !rule) return '';
  const winning = [];
  for (let n = 1; n <= 10; n++) {
    if (n === mine.n) continue;
    const picks = rev.picks.map((p) => ({ id: p.id, n: p.id === pid ? n : p.n, t: p.t }));
    const w = rule.resolve(picks).winners;
    if (w.length === 1 && w[0] === pid) winning.push(n);
  }
  if (!winning.length) return 'No number could have saved you this round.';
  const best = winning.reduce((a, b) => (Math.abs(b - mine.n) < Math.abs(a - mine.n) ? b : a));
  const gap = Math.abs(best - mine.n);
  return gap === 1
    ? `So close! You were one number away. Pick ${best} and you'd have won.`
    : `Pick ${best} and you'd have won this round.`;
}

function renderReveal() {
  const rev = S.reveal;
  $app.innerHTML = `
    ${topbar()}
    <div class="rule"><div class="label">Rule</div><div class="text">${esc(rev.rule.text)}</div></div>
    ${revealBlock(rev, true)}`;
}

function renderChoose() {
  const c = S.choice;
  const mineTurn = c.loserId === pid;
  $app.innerHTML = `
    ${topbar()}
    <div class="card center" style="margin-top:12px">
      ${mineTurn
        ? `<h2>😬 You're in last place!</h2><p>Pick the NEXT rule. Win with it for a +10 revenge bonus.</p>`
        : `<h2>${esc(c.loserNick)} is choosing…</h2><p class="muted">Last place picks the next rule. Shout advice!</p>`}
      ${timerBar()}
    </div>
    <div class="choices" style="margin-top:12px">${c.options
      .map((r) => `<button class="choice pop" data-act="choose" data-rule="${esc(r.id)}" ${mineTurn ? '' : 'disabled'}>
        <span class="type">${esc(r.type)}</span>${esc(r.text)}</button>`)
      .join('')}</div>
    ${chips(false)}`;
}

function renderEnd() {
  const lb = S.leaderboard || [];
  const m = S.match;
  const name = (id, nick) => (id === pid ? 'You' : nick);
  const myRank = lb.findIndex((p) => p.id === pid) + 1;
  const gw = m?.gameWinnerId ? lb.find((p) => p.id === m.gameWinnerId) : null;

  // Headline: the match champion if the best-of-3 is decided, otherwise this game's result.
  let head, sub;
  if (m?.over) {
    const champ = m.championId === pid;
    head = champ ? '🏆 You are the champion!' : `🏆 ${esc(m.championNick)} is the champion!`;
    sub = champ ? 'Best of 3, decided. Bragging rights are yours.' : `Best of 3, decided. You finished #${myRank} this game.`;
  } else {
    head = gw ? (gw.id === pid ? 'You won this game!' : `${esc(gw.nick)} wins this game`) : 'Tied at the top!';
    sub = gw ? `Game ${m.game} of ${m.of} · first to 2 wins takes the match` : 'Nobody takes the match point this time.';
  }

  const standings = m ? `<div class="match">${m.standings.filter((s) => s.wins > 0 || s.id === pid).slice(0, 4)
    .map((s) => `<span class="mchip ${s.id === m.championId ? 'champ' : ''}">${esc(s.emoji)} ${esc(name(s.id, s.nick))} ${'★'.repeat(s.wins)}${'☆'.repeat(Math.max(0, 2 - s.wins))}</span>`).join('')}</div>` : '';

  const grudges = (S.grudges || []).map((g) => {
    const lead = g.you > g.them ? 'You lead' : g.you < g.them ? `${esc(g.oppNick)} leads` : 'All square';
    const cta = g.you < g.them ? ' Revenge?' : g.you === g.them ? ' Settle it.' : '';
    return `<div class="grudge"><span>${esc(g.oppEmoji)} You vs ${esc(g.oppNick)}</span><b>${g.you}–${g.them}</b><span class="muted small">${lead}.${cta}</span></div>`;
  }).join('');

  $app.innerHTML = `
    <div class="stack">
      <h1 class="center ${m?.over ? 'pop' : ''}">${head}</h1>
      <p class="center muted">${sub}</p>
      ${standings}
      <div class="lb">${lb.map((p, i) => `<div class="item ${i === 0 ? 'first' : ''}">
        <span>${i + 1}. ${esc(p.emoji)} ${esc(name(p.id, p.nick))}</span><b>${p.score}</b></div>`).join('')}</div>
      ${grudges ? `<h2>Rivalries</h2><div class="grudges">${grudges}</div>` : ''}
      <button class="big" data-act="rematch">${m && !m.over ? `▶ Game ${m.game + 1} of ${m.of}` : '🔁 New match'}</button>
      <div class="row">
        <button class="secondary" data-act="shareResult">📤 Share</button>
        <button class="secondary" data-act="leave">Leave</button>
      </div>
    </div>`;
}

// ---------- input ----------
$app.addEventListener('click', async (e) => {
  const b = e.target.closest('button[data-act]');
  if (!b || b.disabled) return;
  sound.unlock();
  const act = b.dataset.act;
  const readNick = () => {
    const v = (document.getElementById('nick')?.value || '').trim().slice(0, 14);
    if (!v) { toast('Type your name first 🙂'); document.getElementById('nick')?.focus(); return null; }
    nick = v; store.set('rr_nick', v); return v;
  };
  if (act === 'quick') { if (readNick()) send({ t: 'quick', nick }); }
  else if (act === 'create') { if (readNick()) send({ t: 'create', nick }); }
  else if (act === 'join') {
    const code = (document.getElementById('code')?.value || '').trim().toUpperCase();
    if (code.length !== 4) return toast('Room codes have 4 letters');
    if (readNick()) send({ t: 'join', code, nick });
  }
  else if (act === 'start') send({ t: 'start' });
  else if (act === 'rounds') send({ t: 'rounds', n: Number(b.dataset.n) });
  else if (act === 'pick') {
    send({ t: 'pick', n: Number(b.dataset.n) });
    sound.lock(); navigator.vibrate?.(40);
    S.yourPick = Number(b.dataset.n); render(); // instant feedback
  }
  else if (act === 'choose') send({ t: 'choose', ruleId: b.dataset.rule });
  else if (act === 'rematch') send({ t: 'rematch' });
  else if (act === 'exit') {
    if (confirm('Leave this game? Bots will take your picks.')) {
      send({ t: 'leave' }); S = null; currentCode = null; store.del('rr_room'); render();
    }
  }
  else if (act === 'leave') { send({ t: 'leave' }); S = null; currentCode = null; store.del('rr_room'); render(); }
  else if (act === 'share') shareText(`Join my Rule Roulette room ${S.code}! 🎰`, b.dataset.link);
  else if (act === 'shareResult') {
    const lb = S.leaderboard || [];
    const rank = lb.findIndex((p) => p.id === pid) + 1;
    shareText(`I came #${rank} in Rule Roulette, where the rule changes every round 🎰 Beat me:`, location.origin);
  }
});

async function shareText(text, url) {
  try {
    if (navigator.share) await navigator.share({ text, url });
    else { await navigator.clipboard.writeText(`${text} ${url}`); toast('Link copied!'); }
  } catch {}
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.activeElement?.id === 'code') document.querySelector('[data-act="join"]')?.click();
  if (e.key === 'Enter' && document.activeElement?.id === 'nick') document.querySelector('[data-act="quick"]')?.click();
});

render();
connect();
