// Rule Roulette phone client. Talks to the server over a WebSocket and renders whatever state it gets.
import { sound } from './sound.js';

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

// ---------- timer bar (updates without re-rendering everything) ----------
let lastTickSec = -1;
setInterval(() => {
  const bar = document.querySelector('.timer > div');
  const label = document.querySelector('[data-countdown]');
  if (!S) return;
  const left = Math.max(0, deadline - Date.now());
  const total = S.phase === 'lobby' ? 5000 : S.phaseMs || 1;
  if (bar) {
    bar.style.width = `${Math.min(100, (left / total) * 100)}%`;
    bar.parentElement.classList.toggle('urgent', left < 2000);
  }
  if (label) label.textContent = Math.ceil(left / 1000);
  const sec = Math.ceil(left / 1000);
  if (S.phase === 'pick' && S.yourPick == null && sec <= 3 && sec > 0 && sec !== lastTickSec) sound.tick();
  lastTickSec = sec;
}, 100);

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
        ? `<p class="center">Starting in <b data-countdown>5</b>s… bots fill empty seats.</p><div class="timer"><div></div></div>`
        : isHost
          ? `<button class="big" data-act="start">▶ Start game</button><p class="muted small center">Bots join if you're fewer than 3.</p>`
          : `<p class="center muted">Waiting for the host to start…</p>`}
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
    <div class="rule ${fresh ? 'pop' : ''}"><div class="label">This round's rule</div><div class="text">${esc(S.rule.text)}</div></div>
    <div class="timer"><div></div></div>
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
    const cls = !visible ? 'hidden' : done && rev.winners.includes(p.id) ? 'win' : done && rev.roastedId === p.id ? 'roast shake' : '';
    return `<div class="reveal-item ${cls}">
      <span>${esc(p.emoji)} ${esc(p.id === pid ? 'You' : p.nick)}${p.auto && visible ? ' <span class="muted small">(auto)</span>' : ''}</span>
      <span>${done && d ? `<span class="delta ${d > 0 ? 'up' : 'down'}">${d > 0 ? '+' : ''}${d}</span> ` : ''}<span class="num">${visible ? p.n : '?'}</span></span>
    </div>`;
  }).join('');
  return `<div class="reveal-list">${items}</div>
    ${done ? `<p class="center muted">${esc(rev.notes)}</p><p class="line pop">${esc(rev.line)}</p>` : `<p class="center muted">🥁 Drumroll…</p>`}`;
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
        ? `<h2>😬 You're in last place!</h2><p>Your revenge: pick the NEXT rule.</p>`
        : `<h2>${esc(c.loserNick)} is choosing…</h2><p class="muted">Last place picks the next rule. Shout advice!</p>`}
      <div class="timer"><div></div></div>
    </div>
    <div class="choices" style="margin-top:12px">${c.options
      .map((r) => `<button class="choice pop" data-act="choose" data-rule="${esc(r.id)}" ${mineTurn ? '' : 'disabled'}>
        <span class="type">${esc(r.type)}</span>${esc(r.text)}</button>`)
      .join('')}</div>
    ${chips(false)}`;
}

function renderEnd() {
  const lb = S.leaderboard || [];
  const top = lb[0];
  const youWon = top && top.id === pid;
  const myRank = lb.findIndex((p) => p.id === pid) + 1;
  $app.innerHTML = `
    <div class="stack">
      <h1 class="center">${youWon ? '🏆 You won!' : `🏆 ${esc(top?.nick)} wins!`}</h1>
      <p class="center muted">${youWon ? 'Pure skill. Obviously.' : `You came #${myRank}. The rule was clearly against you.`}</p>
      <div class="lb">${lb.map((p, i) => `<div class="item ${i === 0 ? 'first' : ''}">
        <span>${i + 1}. ${esc(p.emoji)} ${esc(p.id === pid ? 'You' : p.nick)}</span><b>${p.score}</b></div>`).join('')}</div>
      <button class="big" data-act="rematch">🔁 Rematch</button>
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
  else if (act === 'pick') {
    send({ t: 'pick', n: Number(b.dataset.n) });
    sound.lock(); navigator.vibrate?.(40);
    S.yourPick = Number(b.dataset.n); render(); // instant feedback
  }
  else if (act === 'choose') send({ t: 'choose', ruleId: b.dataset.rule });
  else if (act === 'rematch') send({ t: 'rematch' });
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
