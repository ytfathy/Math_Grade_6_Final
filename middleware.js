/* Login gate (Vercel Routing Middleware). Runs on Vercel's servers before ANY page or file is sent.
   Only people signed in with Google whose email is in the Supabase `licenses` table for PROGRAM_CODE get through.
   Env vars: SUPABASE_URL, SUPABASE_ANON_KEY (publishable/anon key only — never service_role), PROGRAM_CODE. */
import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';
import { next } from '@vercel/functions';
import { loginPage, notSubscribedPage, messagePage } from './auth-pages.js';

const env = k => (process.env[k] || '').trim();
export const norm = s => String(s ?? '').trim().toLowerCase();

// shortcut: approved users are remembered per server instance for 5 min, so removing a customer takes up to 5 min; set to 0 for instant.
const APPROVED_TTL_MS = 5 * 60 * 1000;
const approved = new Map();

/** True when one of the user's license rows matches their email and this program (case and spaces ignored). */
export const matchesLicense = (rows, email, code) =>
  !!email && (rows || []).some(r => norm(r.email) === norm(email) && norm(r.program_code) === norm(code));

export default async function middleware(request) {
  const url = new URL(request.url), path = url.pathname;
  const out = new Headers({ 'Cache-Control': 'private, no-store' });
  const SUPABASE_URL = env('SUPABASE_URL'), KEY = env('SUPABASE_ANON_KEY'), CODE = env('PROGRAM_CODE');
  // Fail closed: a missing setting must never open the program.
  if (!SUPABASE_URL || !KEY || !CODE) return html(500, messagePage('الموقع غير مُعدّ بعد', 'Site is not configured yet (missing environment variables).'), out);

  const supabase = createServerClient(SUPABASE_URL, KEY, {
    cookies: {
      getAll: () => parseCookieHeader(request.headers.get('cookie') ?? ''),
      setAll: (list, headers) => {
        list.forEach(({ name, value, options }) => out.append('Set-Cookie', serializeCookieHeader(name, value, options)));
        Object.entries(headers || {}).forEach(([k, v]) => out.set(k, v));
      },
    },
  });

  if (path === '/auth/login') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${url.origin}/auth/callback`, queryParams: { prompt: 'select_account' } },
    });
    return error || !data?.url ? redirect(url, '/login?error=1', out) : redirect(url, data.url, out);
  }
  if (path === '/auth/callback') {
    const code = url.searchParams.get('code');
    const ok = code && !(await supabase.auth.exchangeCodeForSession(code)).error;
    return redirect(url, ok ? '/' : '/login?error=1', out);
  }
  if (path === '/auth/logout') {
    await supabase.auth.signOut();
    return redirect(url, url.searchParams.has('switch') ? '/auth/login' : '/login', out);
  }

  // Verifies the session token's signature (and refreshes it when it is about to expire).
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const meta = claims?.app_metadata || {};
  const viaGoogle = (meta.providers || [meta.provider]).includes('google');
  const signedIn = !!claims && viaGoogle;

  if (path === '/login') return signedIn ? redirect(url, '/', out) : html(200, loginPage(url.searchParams.has('error')), out);
  if (!signedIn) return redirect(url, '/login', out);

  const email = norm(claims.email), key = `${claims.sub}|${norm(CODE)}`;
  if ((approved.get(key) || 0) < Date.now()) {
    // RLS lets a user read only their own rows, so this returns at most this user's licenses.
    const { data: rows, error } = await supabase.from('licenses').select('email, program_code');
    if (error) return html(503, messagePage('حدث خطأ مؤقت، حاول مرة أخرى بعد قليل.', 'Temporary error, please try again shortly.'), out);
    if (!matchesLicense(rows, email, CODE)) return html(403, notSubscribedPage(email, CODE), out);
    approved.set(key, Date.now() + APPROVED_TTL_MS);
  }
  return next({ headers: out });
}

function redirect(url, to, headers) {
  headers.set('Location', new URL(to, url).toString());
  return new Response(null, { status: 302, headers });
}
function html(status, body, headers) {
  headers.set('Content-Type', 'text/html; charset=utf-8');
  return new Response(body, { status, headers });
}
