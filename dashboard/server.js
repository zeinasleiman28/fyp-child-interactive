// Parent dashboard HTTP routes under /parent. Same zero-dependency, nonce-CSP style as worker/index.js.
// DEMO SIGN-IN ONLY: fixed synthetic parent accounts and in-memory sessions. Not production auth.
import {timingSafeEqual} from 'node:crypto';
import {DEMO_PARENTS} from './fixture.js';
import {buildFixtureContract, validateContract, createStore} from './data.js';
import {pageHtml} from './page.js';

const BASE_HEADERS = {
  'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
const COOKIE = 'teddy_parent';
const SESSION_MS = 8 * 60 * 60 * 1000;

export async function createDashboard({store, now = Date.now} = {}) {
  if (!store) store = createStore(validateContract(await buildFixtureContract()));
  const sessions = new Map(); // token -> {parentId, at}
  const json = (body, status = 200, extra = {}) => new Response(JSON.stringify(body), {status,
    headers: {...BASE_HEADERS, 'Content-Type': 'application/json; charset=utf-8', ...extra}});

  function parentFor(request) {
    const token = request.headers.get('cookie')?.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9-]{36})(?:;|$)`))?.[1];
    const s = token && sessions.get(token);
    if (!s || now() - s.at > SESSION_MS) { if (token) sessions.delete(token); return null; }
    return DEMO_PARENTS.find(p => p.id === s.parentId) ?? null;
  }
  const sameOrigin = request => {
    const origin = request.headers.get('Origin');
    if (origin && origin !== new URL(request.url).origin) return false;
    return request.headers.get('Sec-Fetch-Site') !== 'cross-site';
  };
  async function readJson(request) {
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type') || '')) return null;
    const text = await request.text();
    if (text.length > 2048) return null;
    try { const d = JSON.parse(text); return d && typeof d === 'object' && !Array.isArray(d) ? d : null; } catch { return null; }
  }
  const eq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && timingSafeEqual(x, y); };

  async function fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === '/parent' || path === '/parent/') {
      if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', {status: 405, headers: BASE_HEADERS});
      const nonce = crypto.randomUUID().replaceAll('-', '');
      return new Response(request.method === 'HEAD' ? null : pageHtml(nonce), {headers: {...BASE_HEADERS,
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'`}});
    }
    if (!path.startsWith('/parent/api/')) return new Response('Not found', {status: 404, headers: BASE_HEADERS});
    if (!sameOrigin(request)) return json({error: 'Origin denied'}, 403);
    const route = path.slice('/parent/api/'.length);

    if (route === 'accounts' && request.method === 'GET') return json({accounts: DEMO_PARENTS.map(({id, name}) => ({id, name}))});
    if (route === 'login' && request.method === 'POST') {
      const d = await readJson(request);
      const p = DEMO_PARENTS.find(x => x.id === d?.parentId);
      if (!p || !eq(p.passcode, d?.passcode ?? '')) return json({error: 'Wrong account or passcode'}, 401);
      const token = crypto.randomUUID();
      sessions.set(token, {parentId: p.id, at: now()});
      const secure = url.protocol === 'https:' ? '; Secure' : '';
      return json({ok: true}, 200, {'Set-Cookie': `${COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/parent; Max-Age=${SESSION_MS / 1000}${secure}`});
    }
    if (route === 'logout' && request.method === 'POST') {
      const token = request.headers.get('cookie')?.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9-]{36})`))?.[1];
      if (token) sessions.delete(token);
      return json({ok: true}, 200, {'Set-Cookie': `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/parent; Max-Age=0`});
    }

    const parent = parentFor(request);
    if (!parent) return json({error: 'Sign in required'}, 401);
    if (route === 'me' && request.method === 'GET') return json({id: parent.id, name: parent.name, child: parent.child});
    if (route === 'conversations' && request.method === 'GET') return json({conversations: store.listConversations(parent.id)});
    let m = route.match(/^conversations\/([\w-]{1,64})$/);
    if (m && request.method === 'GET') {
      const c = store.getConversation(parent.id, m[1]);
      // 404 (not 403) so another account cannot even learn that the conversation exists.
      return c ? json(c) : json({error: 'Conversation not found'}, 404);
    }
    if (route === 'alerts' && request.method === 'GET') return json({alerts: store.listAlerts(parent.id)});
    m = route.match(/^alerts\/([\w-]{1,96})\/review$/);
    if (m && request.method === 'POST') {
      const d = await readJson(request);
      if (typeof d?.reviewed !== 'boolean') return json({error: 'reviewed must be true or false'}, 400);
      const a = store.setReviewed(parent.id, m[1], d.reviewed);
      return a ? json(a) : json({error: 'Alert not found'}, 404);
    }
    return json({error: 'Not found'}, 404);
  }
  return {fetch, store};
}
