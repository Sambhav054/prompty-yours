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
  if (s.notice && s.notice !== prev?.notice) toast(s.notice);
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
  if (!S) return entered ? renderHome() : renderLanding();
  switch (S.phase) {
    case 'lobby': return renderLobby();
    case 'pick': return renderPick();
    case 'reveal': return renderReveal();
    case 'choose': return renderChoose();
    case 'end': return renderEnd();
  }
}

// ---------- icons (one stroke family, drawn inline) ----------
const ICONS = {
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  share: '<path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/>',
  play: '<path d="M7 4.5v15a.5.5 0 0 0 .77.42l11.5-7.5a.5.5 0 0 0 0-.84L7.77 4.08A.5.5 0 0 0 7 4.5Z"/>',
  again: '<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  door: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  swords: '<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6M16 16l4 4M19 21l2-2"/><path d="M14.5 6.5 18 3h3v3l-3.5 3.5"/><path d="m5 14 4 4M7 17l-3 3M3 19l2 2"/>',
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  coin: '<circle cx="12" cy="12" r="8"/><path d="M12 8v8M9.5 10h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4"/>',
  stop: '<circle cx="12" cy="12" r="9"/><path d="M9 9h6v6H9z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
};
const ic = (name, cls = '') =>
  `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

// The brand mark: a ten-pocket roulette wheel (odd pockets red, even pockets ink).
function wheel(cls = '') {
  const seg = Array.from({ length: 10 }, (_, i) => {
    const a0 = (i * 36 - 90) * (Math.PI / 180), a1 = ((i + 1) * 36 - 90) * (Math.PI / 180);
    const p = (r, a) => `${(50 + r * Math.cos(a)).toFixed(2)} ${(50 + r * Math.sin(a)).toFixed(2)}`;
    return `<path d="M${p(46, a0)} A46 46 0 0 1 ${p(46, a1)} L${p(30, a1)} A30 30 0 0 0 ${p(30, a0)}Z" fill="${i % 2 ? 'var(--ink-chip)' : 'var(--red)'}"/>`;
  }).join('');
  return `<svg class="wheel ${cls}" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="49" fill="var(--gold)"/>${seg}
    <circle cx="50" cy="50" r="30" fill="var(--felt-2)"/><circle cx="50" cy="50" r="8" fill="var(--gold)"/>
    <g class="ball-orbit"><circle class="ball" cx="50" cy="12" r="3.6" fill="#fff"/></g></svg>`;
}

// ---------- landing hero (first screen) ----------
let entered = !!(urlRoom || currentCode); // invite links and reconnects skip straight to the game
const FLOATERS = [
  ['7', 6, 14, 0], ['?', 86, 10, 1], ['3', 90, 42, 2], ['10', 4, 46, 3], ['?', 12, 78, 4], ['1', 84, 76, 5],
  ['5', 48, 6, 6], ['9', 70, 90, 7], ['2', 26, 92, 8], ['?', 94, 60, 9], ['8', 2, 28, 10], ['4', 62, 18, 11],
];
function renderLanding() {
  const fl = FLOATERS.map(([t, x, y, i]) =>
    `<span class="fl ${t === '?' ? 'q' : i % 3 === 0 ? 'g' : i % 3 === 1 ? 'w' : 'p'} ${y > 22 && y < 84 ? 'mid' : ''}" style="--x:${x}%;--y:${y}%;--d:${7 + (i % 5) * 1.3}s;--dl:${-i * 0.7}s;--r:${(i % 2 ? 1 : -1) * (8 + i)}deg">${t}</span>`).join('');
  $app.innerHTML = `
    <section class="hero">
      <div class="floaters" aria-hidden="true">${fl}
        <span class="fl die mid" style="--x:80%;--y:28%;--d:9s;--dl:-2s;--r:24deg"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.6"/><circle cx="15.5" cy="15.5" r="1.6"/><circle cx="12" cy="12" r="1.6"/></svg></span>
        <span class="fl die mid" style="--x:10%;--y:62%;--d:11s;--dl:-5s;--r:-18deg"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.6"/><circle cx="15.5" cy="8.5" r="1.6"/><circle cx="8.5" cy="15.5" r="1.6"/><circle cx="15.5" cy="15.5" r="1.6"/></svg></span>
      </div>
      <div class="hero-in">
        ${wheel('spin hero-wheel')}
        <h1 class="hero-h"><span class="l1">Think you can win?</span><span class="l2">Think again.</span></h1>
        <p class="hero-p">Pick your number. Take your chances. Watch the madness unfold!</p>
        <p class="hero-p">Score points, outplay your friends, but remember… the loser gets to choose the next rule!</p>
        <p class="hero-lead">Ready to roll the chaos?</p>
        <button class="hero-btn" data-act="enter">Let's play!</button>
      </div>
      <p class="hero-micro">Up to 10 rounds. Endless chaos. One winner.</p>
    </section>`;
}

const numClass = (n) => (n % 2 ? 'red' : 'ink'); // roulette colours: odd red, even black
const who = (id, nick) => (id === pid ? 'You' : nick);

function topbar() {
  return `<header class="topbar">
    <span class="tag">Round <b>${S.round}/${S.rounds}</b></span>
    <span class="tag gold">${ic('coin')} <b>${S.jackpot}</b></span>
    <span class="tag dim">${esc(S.code)}</span>
    <div class="actions">
      ${S.hostId === pid ? `<button class="act danger" data-act="cancel">${ic('stop')} Cancel game</button>` : ''}
      <button class="act" data-act="exit">${ic('door')} Exit</button>
    </div>
  </header>`;
}

function chips(showLock) {
  return `<ul class="seats">${S.players
    .map((p) => `<li class="seat ${showLock && p.locked ? 'locked' : ''} ${p.connected ? '' : 'off'} ${p.id === pid ? 'me' : ''}">
      <span class="ava">${esc(p.emoji)}</span><span class="nm">${esc(who(p.id, p.nick))}</span><b class="pts">${p.score}</b>
      ${showLock && p.locked ? `<span class="ok">${ic('check')}</span>` : ''}
    </li>`)
    .join('')}</ul>`;
}

function renderHome() {
  $app.innerHTML = `
    <section class="home">
      <div class="brand">
        ${wheel('spin')}
        <h1 class="wordmark">Rule<br><span>Roulette</span></h1>
      </div>
      <p class="lede">Everyone secretly picks 1 to 10. Then the rule drops, and it changes every round. Come last, and you choose the next one.</p>
      <label class="field"><span>Your name</span>
        <input id="nick" maxlength="14" placeholder="e.g. Asha" value="${esc(nick)}" autocomplete="nickname" />
      </label>
      <button class="cta" data-act="quick">${ic('bolt')} Play now</button>
      <div class="split">
        <button class="alt" data-act="create">Create room</button>
        <div class="join">
          <input id="code" class="code-input" maxlength="4" placeholder="CODE" aria-label="Room code" value="${esc(urlRoom || '')}" />
          <button class="alt" data-act="join">Join</button>
        </div>
      </div>
      <p class="fine">${connected ? 'No sign-up. Just a name. 2–10 players, bots fill empty seats.' : '<span class="pulse"></span> Waking the table up…'}</p>
    </section>`;
  if (urlRoom) document.getElementById('code').focus();
}

function renderLobby() {
  const isHost = S.hostId === pid;
  const link = `${location.origin}/?room=${S.code}`;
  $app.innerHTML = `
    <section class="lobby">
      <div class="codecard">
        <span class="cap">Room code</span>
        <div class="code-big">${[...S.code].map((c) => `<span>${esc(c)}</span>`).join('')}</div>
        ${S.isPublic ? '<span class="cap">Public table</span>' : `<button class="alt sm" data-act="share">${ic('share')} Invite friends</button>`}
      </div>
      ${lastGameBlock()}
      <h2>At the table <span class="count">${S.players.length}/${S.maxPlayers || 10}</span></h2>
      ${chips(false)}
      ${S.isPublic
        ? `<p class="status">Dealing in <b data-countdown>5</b>s. Bots take the empty seats.</p>${timerBar()}`
        : isHost
          ? `<h2>Rounds</h2>
             <div class="seg" role="group" aria-label="Number of rounds">${S.roundOptions.map((n) => `<button class="${n === S.rounds ? 'on' : ''}" aria-pressed="${n === S.rounds}" data-act="rounds" data-n="${n}">${n}</button>`).join('')}</div>
             <button class="cta" data-act="start">${ic('play')} Start ${S.rounds}-round game</button>
             <p class="fine">Fewer than 3 players? Bots join so the game still works.</p>`
          : `<p class="status">${S.rounds} rounds. Waiting for the host to start…</p>`}
      <button class="ghost wide" data-act="leave">${ic('door')} Leave room</button>
    </section>`;
  document.querySelector('[data-act="share"]')?.setAttribute('data-link', link);
}

// Lobby recap of the game that just finished: winner, match stars and rivalries.
function lastGameBlock() {
  const lg = S.lastGame;
  if (!lg) return '';
  const top = lg.leaderboard[0];
  const m = S.match;
  const head = m?.over
    ? `${esc(who(m.championId, m.championNick))} ${m.championId === pid ? 'are' : 'is'} the champion`
    : lg.gameWinnerId ? `${esc(who(top.id, top.nick))} won the last game` : 'Last game ended in a tie';
  const grudges = (S.grudges || []).slice(0, 2).map((g) =>
    `<li class="grudge"><span class="ava">${esc(g.oppEmoji)}</span><span>You vs ${esc(g.oppNick)}</span><b>${g.you}–${g.them}</b></li>`).join('');
  return `<section class="recap">
    <p class="recap-head">${ic('trophy')} ${head}</p>
    ${m && !m.over ? `<p class="fine">Match: game ${m.game} of ${m.of} done. First to 2 wins.</p>` : m?.over ? '<p class="fine">Next game starts a new best-of-3.</p>' : ''}
    ${grudges ? `<ul class="grudges">${grudges}</ul>` : ''}
  </section>`;
}

function renderPick() {
  const mine = S.yourPick;
  const fresh = renderPick.round !== S.round; // deal the rule card only when a new round starts
  renderPick.round = S.round;
  $app.innerHTML = `
    ${topbar()}
    <article class="rulecard ${fresh ? 'deal' : ''} ${S.rule.type}">
      <p class="rtext">${esc(S.rule.text)}</p>
      <p class="rnote">Ties cancel out${S.jackpot ? ` · ${S.jackpot} in the jackpot` : ''}</p>
    </article>
    ${timerBar()}
    <p class="prompt">${mine == null ? 'Pick your number <b class="secs" data-countdown></b>' : `Locked in <b class="num-inline ${numClass(mine)}">${mine}</b> Waiting for the table…`}</p>
    <div class="pad ${mine != null ? 'done' : ''}">${Array.from({ length: 10 }, (_, i) => i + 1)
      .map((n) => `<button data-act="pick" data-n="${n}" class="chipnum ${numClass(n)} ${mine === n ? 'mine' : ''}" ${mine != null ? 'disabled' : ''} aria-label="Pick ${n}">${n}</button>`)
      .join('')}</div>
    ${chips(true)}`;
}

function revealBlock(rev, animate) {
  const shown = animate ? revealShown : rev.picks.length;
  const done = shown >= rev.picks.length;
  const items = rev.picks.map((p, i) => {
    const visible = i < shown;
    const d = rev.deltas[p.id] || 0;
    const state = !done ? '' : rev.winners.includes(p.id) ? 'win' : rev.tied?.includes(p.id) ? 'tie' : rev.roastedId === p.id ? 'roast' : '';
    return `<li class="row ${state} ${p.id === pid ? 'me' : ''}">
      <span class="ava">${esc(p.emoji)}</span>
      <span class="nm">${esc(who(p.id, p.nick))}${p.auto && visible ? ' <i>auto</i>' : ''}</span>
      ${done && d ? `<span class="delta ${d > 0 ? 'up' : 'down'}">${d > 0 ? '+' : ''}${d}</span>` : '<span></span>'}
      <span class="tile ${visible ? `flipped ${numClass(p.n)}` : ''}"><span class="back"></span><span class="face">${p.n}</span></span>
    </li>`;
  }).join('');
  const miss = done ? nearMiss(rev) : '';
  const revengeName = rev.revengeId ? who(rev.revengeId, rev.picks.find((p) => p.id === rev.revengeId)?.nick) : '';
  return `${done && rev.revengeId ? `<div class="banner">${ic('swords')} Revenge! ${esc(revengeName)} +10</div>` : ''}
    <ol class="board">${items}</ol>
    ${done
      ? `<p class="notes">${esc(rev.notes)}</p><p class="call">${esc(rev.line)}</p>${miss ? `<p class="miss">${esc(miss)}</p>` : ''}`
      : '<p class="notes drum">Revealing…</p>'}`;
}

function renderReveal() {
  const rev = S.reveal;
  $app.innerHTML = `
    ${topbar()}
    <article class="rulecard small"><p class="rtext">${esc(rev.rule.text)}</p></article>
    ${revealBlock(rev, true)}`;
}

function renderChoose() {
  const c = S.choice;
  const mineTurn = c.loserId === pid;
  const fresh = renderChoose.round !== S.round; // deal the cards once per choice, not on every update
  renderChoose.round = S.round;
  $app.innerHTML = `
    ${topbar()}
    <section class="spot ${mineTurn ? 'mine' : ''}">
      ${mineTurn
        ? `<h2>You're in last place</h2><p>Pick the next rule. Win with it for a +10 revenge bonus.</p>`
        : `<h2>${esc(c.loserNick)} is choosing</h2><p>Last place picks the next rule. Shout your advice.</p>`}
      ${timerBar()}
    </section>
    <div class="hand ${fresh ? 'deal-in' : ''}">${c.options
      .map((r, i) => `<button class="rulecard pickable ${r.type}" style="--i:${i}" data-act="choose" data-rule="${esc(r.id)}" ${mineTurn ? '' : 'disabled'}>
        <span class="rtext">${esc(r.text)}</span><span class="rtype">${r.type === 'chaos' ? 'Chaos' : 'Logic'}</span></button>`)
      .join('')}</div>
    ${chips(false)}`;
}

function renderEnd() {
  const lb = S.leaderboard || [];
  const m = S.match;
  const myRank = lb.findIndex((p) => p.id === pid) + 1;
  const gw = m?.gameWinnerId ? lb.find((p) => p.id === m.gameWinnerId) : null;

  // Headline: the match champion once the best-of-3 is decided, otherwise this game's result.
  let head, sub;
  if (m?.over) {
    const champ = m.championId === pid;
    head = champ ? 'You are the champion' : `${esc(m.championNick)} is the champion`;
    sub = champ ? 'Best of 3, decided. Bragging rights are yours.' : `Best of 3, decided. You finished #${myRank} this game.`;
  } else {
    head = gw ? (gw.id === pid ? 'You won this game' : `${esc(gw.nick)} wins this game`) : 'Tied at the top';
    sub = gw ? `Game ${m.game} of ${m.of}. First to 2 wins takes the match.` : 'Nobody takes the match point this time.';
  }

  const standings = m ? `<div class="stars">${m.standings.filter((s) => s.wins > 0 || s.id === pid).slice(0, 4)
    .map((s) => `<span class="star-chip ${s.id === m.championId ? 'champ' : ''}">${esc(s.emoji)} ${esc(who(s.id, s.nick))}
      <span class="pips">${'<i class="on"></i>'.repeat(s.wins)}${'<i></i>'.repeat(Math.max(0, 2 - s.wins))}</span></span>`).join('')}</div>` : '';

  const grudges = (S.grudges || []).map((g) => {
    const lead = g.you > g.them ? 'You lead' : g.you < g.them ? `${esc(g.oppNick)} leads` : 'All square';
    const cta = g.you < g.them ? ' Revenge?' : g.you === g.them ? ' Settle it.' : '';
    return `<li class="grudge"><span class="ava">${esc(g.oppEmoji)}</span><span>You vs ${esc(g.oppNick)}<small>${lead}.${cta}</small></span><b>${g.you}–${g.them}</b></li>`;
  }).join('');

  $app.innerHTML = `
    <section class="end">
      <div class="crest ${m?.over ? 'champ' : ''}">${ic('trophy')}</div>
      <h1 class="headline">${head}</h1>
      <p class="sub">${sub}</p>
      ${standings}
      <ol class="final">${lb.map((p, i) => `<li class="${i === 0 ? 'first' : ''} ${p.id === pid ? 'me' : ''}">
        <span class="rank">${i + 1}</span><span class="ava">${esc(p.emoji)}</span><span class="nm">${esc(who(p.id, p.nick))}</span><b>${p.score}</b></li>`).join('')}</ol>
      ${grudges ? `<h2>Rivalries</h2><ul class="grudges">${grudges}</ul>` : ''}
      <p class="status">Back to the lobby in <b class="secs" data-countdown></b>s. New players can join there.</p>
      ${timerBar()}
      ${S.hostId === pid
        ? `<button class="cta" data-act="rematch">${m && !m.over ? `${ic('play')} Play game ${m.game + 1} now` : `${ic('again')} Start a new match now`}</button>
           <button class="alt" data-act="toLobby">${ic('users')} Back to lobby</button>`
        : ''}
      <div class="split two">
        <button class="alt" data-act="shareResult">${ic('share')} Share</button>
        <button class="alt" data-act="leave">${ic('door')} Leave</button>
      </div>
    </section>`;
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
  else if (act === 'enter') { entered = true; render(); document.getElementById('nick')?.focus(); }
  else if (act === 'cancel') {
    if (confirm('Cancel this game for everyone? Scores will not count.')) send({ t: 'cancel' });
  }
  else if (act === 'toLobby') send({ t: 'lobby' });
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
