const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DB_PATH = path.join(DATA_DIR, 'highlaw.sqlite');
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'highlaw2026!';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const SESSION_TTL = 1000 * 60 * 60 * 8;

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',
    client_name TEXT DEFAULT '',
    client_phone TEXT DEFAULT '',
    matter_type TEXT DEFAULT '',
    memo TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
`);

const sessions = new Map();
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error('Request body is too large.'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  return Object.fromEntries(header.split(';').filter(Boolean).map(part => {
    const idx = part.indexOf('=');
    return [part.slice(0, idx).trim(), decodeURIComponent(part.slice(idx + 1))];
  }));
}

function sign(value) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('hex');
}

function createSession() {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, Date.now() + SESSION_TTL);
  return `${token}.${sign(token)}`;
}

function getSession(req) {
  const raw = parseCookies(req).highlaw_session;
  if (!raw) return null;
  const [token, signature] = raw.split('.');
  if (!token || !signature || sign(token) !== signature) return null;
  const expires = sessions.get(token);
  if (!expires || expires < Date.now()) {
    sessions.delete(token);
    return null;
  }
  sessions.set(token, Date.now() + SESSION_TTL);
  return token;
}

function requireAdmin(req, res) {
  if (getSession(req)) return true;
  sendJson(res, 401, { error: '로그인이 필요합니다.' });
  return false;
}

function cleanReservation(input, partial = false) {
  const allowed = new Set(['available', 'booked', 'closed', 'consulting']);
  const item = {
    date: String(input.date || '').trim(),
    time: String(input.time || '').trim(),
    status: String(input.status || 'available').trim(),
    client_name: String(input.client_name || '').trim(),
    client_phone: String(input.client_phone || '').trim(),
    matter_type: String(input.matter_type || '').trim(),
    memo: String(input.memo || '').trim()
  };

  if (!partial && !/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
    throw new Error('날짜 형식이 올바르지 않습니다.');
  }
  if (!partial && !/^\d{2}:\d{2}$/.test(item.time)) {
    throw new Error('시간 형식이 올바르지 않습니다.');
  }
  if (!allowed.has(item.status)) {
    throw new Error('상태 값이 올바르지 않습니다.');
  }
  return item;
}

function listReservations(month, admin = false) {
  const rows = db.prepare(`
    SELECT id, date, time, status, client_name, client_phone, matter_type, memo, updated_at
    FROM reservations
    WHERE date LIKE ?
    ORDER BY date ASC, time ASC
  `).all(`${month}%`);

  if (admin) return rows;
  return rows.map(({ id, date, time, status }) => ({ id, date, time, status }));
}

async function handleApi(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/reservations') {
    const month = url.searchParams.get('month') || new Date().toISOString().slice(0, 7);
    return sendJson(res, 200, { reservations: listReservations(month, false) });
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/login') {
    const body = await readBody(req);
    const userOk = String(body.username || ADMIN_USER) === ADMIN_USER;
    const input = Buffer.from(String(body.password || ''));
    const expected = Buffer.from(ADMIN_PASSWORD);
    const passOk = input.length === expected.length && crypto.timingSafeEqual(input, expected);

    if (!userOk || !passOk) return sendJson(res, 401, { error: '아이디 또는 비밀번호가 올바르지 않습니다.' });

    const session = createSession();
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Set-Cookie': `highlaw_session=${encodeURIComponent(session)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL / 1000}`
    });
    return res.end(JSON.stringify({ ok: true }));
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/logout') {
    const session = getSession(req);
    if (session) sessions.delete(session);
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Set-Cookie': 'highlaw_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'
    });
    return res.end(JSON.stringify({ ok: true }));
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/me') {
    return sendJson(res, getSession(req) ? 200 : 401, { ok: Boolean(getSession(req)), username: ADMIN_USER });
  }

  if (url.pathname === '/api/admin/reservations') {
    if (!requireAdmin(req, res)) return;

    if (req.method === 'GET') {
      const month = url.searchParams.get('month') || new Date().toISOString().slice(0, 7);
      return sendJson(res, 200, { reservations: listReservations(month, true) });
    }

    if (req.method === 'POST') {
      const item = cleanReservation(await readBody(req));
      const result = db.prepare(`
        INSERT INTO reservations (date, time, status, client_name, client_phone, matter_type, memo, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(item.date, item.time, item.status, item.client_name, item.client_phone, item.matter_type, item.memo);
      return sendJson(res, 201, { id: result.lastInsertRowid });
    }
  }

  const match = url.pathname.match(/^\/api\/admin\/reservations\/(\d+)$/);
  if (match) {
    if (!requireAdmin(req, res)) return;
    const id = Number(match[1]);

    if (req.method === 'PATCH') {
      const item = cleanReservation(await readBody(req));
      db.prepare(`
        UPDATE reservations
        SET date = ?, time = ?, status = ?, client_name = ?, client_phone = ?, matter_type = ?, memo = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(item.date, item.time, item.status, item.client_name, item.client_phone, item.matter_type, item.memo, id);
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === 'DELETE') {
      db.prepare('DELETE FROM reservations WHERE id = ?').run(id);
      return sendJson(res, 200, { ok: true });
    }
  }

  return sendJson(res, 404, { error: 'API를 찾을 수 없습니다.' });
}

function serveStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  if (pathname === '/admin') pathname = '/admin.html';

  const filePath = path.normalize(path.join(ROOT, pathname));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not found');
    }
    const type = mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
    return serveStatic(req, res, url);
  } catch (error) {
    return sendJson(res, 400, { error: error.message || '요청을 처리할 수 없습니다.' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`HIGHLAW server running at http://localhost:${PORT}`);
  console.log(`Admin: http://localhost:${PORT}/admin`);
});
