// Web server: serves the browser game and runs rooms over WebSockets.
import express from 'express';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { CONFIG } from '../shared/config.js';
import { Room } from './room.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.static(path.join(ROOT, 'public')));
app.use('/shared', express.static(path.join(ROOT, 'shared')));
app.get('/healthz', (_req, res) =>
  res.json({ ok: true, rooms: rooms.size, version: (process.env.RENDER_GIT_COMMIT || 'local').slice(0, 7) }));

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const rooms = new Map();   // code -> Room
const sockets = new Map(); // playerId -> ws

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
function newCode() {
  for (;;) {
    let c = '';
    for (let i = 0; i < 4; i++) c += LETTERS[Math.floor(Math.random() * LETTERS.length)];
    if (!rooms.has(c)) return c;
  }
}

function broadcast(room) {
  for (const p of room.players) {
    if (p.bot) continue;
    const ws = sockets.get(p.id);
    if (ws && ws.readyState === 1 && ws.code === room.code) {
      ws.send(JSON.stringify({ t: 'state', s: room.snapshot(p.id) }));
    }
  }
}

function createRoom(isPublic) {
  const code = newCode();
  const room = new Room(code, {
    isPublic,
    onChange: broadcast,
    onEmpty: (r) => rooms.delete(r.code),
  });
  rooms.set(code, room);
  return room;
}

function cleanNick(nick) {
  const s = String(nick || '').replace(/[<>]/g, '').trim().slice(0, 14);
  return s || 'Player';
}

function send(ws, msg) {
  if (ws.readyState === 1) ws.send(JSON.stringify(msg));
}

function leaveCurrent(ws) {
  if (!ws.code) return;
  const room = rooms.get(ws.code);
  if (room) room.disconnect(ws.pid);
  ws.code = null;
}

function enter(ws, room, nick) {
  if (ws.code && ws.code !== room.code) leaveCurrent(ws);
  ws.code = room.code;
  const r = room.addHuman(ws.pid, nick);
  if (!r.ok) {
    ws.code = null;
    send(ws, { t: 'error', message: r.error });
    return false;
  }
  return true;
}

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => (ws.isAlive = true));

  ws.on('message', (raw) => {
    let m;
    try { m = JSON.parse(raw); } catch { return; }
    if (!m || typeof m !== 'object') return;

    // Every message carries the player's local id so reconnects keep their seat.
    if (m.pid && typeof m.pid === 'string' && m.pid.length <= 40) {
      if (ws.pid && ws.pid !== m.pid) return;
      ws.pid = m.pid;
      const old = sockets.get(m.pid);
      if (old && old !== ws) { old.code = null; try { old.close(); } catch {} }
      sockets.set(m.pid, ws);
    }
    if (!ws.pid) return;
    const room = ws.code ? rooms.get(ws.code) : null;

    switch (m.t) {
      case 'quick': {
        let target = [...rooms.values()].find((r) => r.isPublic && r.phase === 'lobby' && !r.isFull());
        if (!target) {
          target = createRoom(true);
          target.quickStartAt = Date.now() + CONFIG.QUICK_FILL_MS;
          setTimeout(() => {
            if (rooms.has(target.code) && target.phase === 'lobby' && target.connectedHumans().length) target.start();
          }, CONFIG.QUICK_FILL_MS);
        }
        enter(ws, target, cleanNick(m.nick));
        break;
      }
      case 'create': {
        enter(ws, createRoom(false), cleanNick(m.nick));
        break;
      }
      case 'join': {
        const code = String(m.code || '').toUpperCase().trim();
        const target = rooms.get(code);
        if (!target) { send(ws, { t: 'error', message: `No room called ${code || '...'}. Check the code?` }); break; }
        enter(ws, target, cleanNick(m.nick));
        break;
      }
      case 'start':
        if (room && room.hostId === ws.pid && room.phase === 'lobby') room.start();
        break;
      case 'rounds':
        if (room) room.setRounds(ws.pid, m.n);
        break;
      case 'pick':
        if (room) room.pick(ws.pid, m.n);
        break;
      case 'choose':
        if (room) room.chooseRule(ws.pid, m.ruleId);
        break;
      case 'rematch':
        if (room && room.phase === 'end') room.start();
        break;
      case 'leave':
        leaveCurrent(ws);
        send(ws, { t: 'left' });
        break;
    }
  });

  ws.on('close', () => {
    if (ws.pid && sockets.get(ws.pid) === ws) sockets.delete(ws.pid);
    if (ws.code) {
      const room = rooms.get(ws.code);
      if (room) room.disconnect(ws.pid);
    }
  });
});

// Drop dead connections so players show as disconnected.
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { ws.terminate(); continue; }
    ws.isAlive = false;
    try { ws.ping(); } catch {}
  }
}, 20000);

server.listen(PORT, () => console.log(`Rule Roulette running on http://localhost:${PORT}`));
