// Runs the real middleware against a fake Supabase server. Run with: npm test
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt = claims => `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ aud: 'authenticated', role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600, ...claims })}.sig`;
const USERS = {
  paid: { sub: 'u1', email: 'malek@gmail.com', app_metadata: { provider: 'google', providers: ['google'] } },
  other: { sub: 'u2', email: 'stranger@gmail.com', app_metadata: { provider: 'google', providers: ['google'] } },
  wrongProgram: { sub: 'u3', email: 'sara@gmail.com', app_metadata: { provider: 'google', providers: ['google'] } },
  password: { sub: 'u4', email: 'malek@gmail.com', app_metadata: { provider: 'email', providers: ['email'] } },
};
// Rows as stored in the table (messy casing/spaces on purpose), returned per user like RLS would.
const LICENSES = [{ email: '  Malek@Gmail.COM ', program_code: ' Math-G6' }, { email: 'sara@gmail.com', program_code: 'Science-G6' }];
let restFails = false;

const tokenUser = auth => {
  const part = (auth || '').split('.')[1];
  if (!part) return null;
  const { sub } = JSON.parse(Buffer.from(part, 'base64url'));
  return Object.values(USERS).find(u => u.sub === sub);
};
const server = http.createServer((req, res) => {
  const u = tokenUser(req.headers.authorization);
  const send = (code, body) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
  if (req.url.startsWith('/auth/v1/user')) return u ? send(200, { id: u.sub, email: u.email, aud: 'authenticated' }) : send(401, { msg: 'bad jwt' });
  if (req.url.startsWith('/auth/v1/logout')) { res.writeHead(204); return res.end(); }
  if (req.url.startsWith('/rest/v1/licenses')) {
    if (restFails) return send(500, { message: 'boom' });
    return send(200, u ? LICENSES.filter(r => r.email.trim().toLowerCase() === u.email) : []);
  }
  send(404, {});
});

let mw, base;
before(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = `http://localhost:${server.address().port}`;
  Object.assign(process.env, { SUPABASE_URL: base, SUPABASE_ANON_KEY: 'anon-test', PROGRAM_CODE: 'math-g6 ' });
  mw = (await import('../middleware.js')).default;
});
after(() => server.close());

const cookieFor = u => `sb-localhost-auth-token=base64-${b64({ access_token: jwt(u), refresh_token: 'r', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: u.sub, email: u.email } })}`;
const get = (path, u) => mw(new Request('https://mathgrade6final.vercel.app' + path, { headers: u ? { cookie: cookieFor(u) } : {} }));

test('not signed in: every page and file redirects to /login', async () => {
  for (const p of ['/', '/index.html', '/assets/logo.png', '/data/q2_m4.js', '/middleware.js']) {
    const r = await get(p);
    assert.equal(r.status, 302, p);
    assert.equal(r.headers.get('location'), 'https://mathgrade6final.vercel.app/login', p);
  }
});

test('/login shows the Arabic Google sign-in page', async () => {
  const r = await get('/login'), body = await r.text();
  assert.equal(r.status, 200);
  assert.match(body, /dir="rtl"/);
  assert.match(body, /href="\/auth\/login"/);
});

test('/auth/login sends the user to Google via Supabase with a PKCE cookie', async () => {
  const r = await get('/auth/login'), loc = new URL(r.headers.get('location'));
  assert.equal(r.status, 302);
  assert.equal(loc.origin + loc.pathname, base + '/auth/v1/authorize');
  assert.equal(loc.searchParams.get('provider'), 'google');
  assert.equal(loc.searchParams.get('redirect_to'), 'https://mathgrade6final.vercel.app/auth/callback');
  assert.match(r.headers.get('set-cookie') || '', /code-verifier/);
});

test('licensed user gets through (email/code compared ignoring case and spaces)', async () => {
  const r = await get('/assets/logo.png', USERS.paid);
  assert.equal(r.headers.get('x-middleware-next'), '1');
});

test('signed-in user not on the list sees the not-subscribed page', async () => {
  for (const u of [USERS.other, USERS.wrongProgram]) {
    const r = await get('/', u), body = await r.text();
    assert.equal(r.status, 403, u.email);
    assert.match(body, /wa\.me\/201002152024/);
    assert.match(body, /\/auth\/logout\?switch=1/);
    assert.ok(body.includes(u.email));
  }
});

test('a non-Google account with a listed email is not let in', async () => {
  const r = await get('/', USERS.password);
  assert.equal(r.status, 302);
});

test('/auth/logout clears the session and returns to /login', async () => {
  const r = await get('/auth/logout', USERS.paid);
  assert.equal(r.headers.get('location'), 'https://mathgrade6final.vercel.app/login');
  assert.match(r.headers.get('set-cookie') || '', /sb-localhost-auth-token=;/);
  const s = await get('/auth/logout?switch=1', USERS.paid);
  assert.equal(s.headers.get('location'), 'https://mathgrade6final.vercel.app/auth/login');
});

test('database error fails closed', async () => {
  restFails = true;
  try { assert.equal((await get('/', USERS.other)).status, 503); } finally { restFails = false; }
});

test('missing settings fail closed', async () => {
  const keep = process.env.PROGRAM_CODE;
  process.env.PROGRAM_CODE = '';
  try { assert.equal((await get('/')).status, 500); } finally { process.env.PROGRAM_CODE = keep; }
});
