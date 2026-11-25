import test from 'node:test';
import assert from 'node:assert/strict';
import {createDashboard} from '../dashboard/server.js';
import {validateContract, pushPayloadFor, createStore} from '../dashboard/data.js';
import {createLiveCapture} from '../dashboard/live.js';

const BASE = 'http://127.0.0.1:3000';
async function setup() {
  const d = await createDashboard();
  const call = (path, {method = 'GET', body, cookie} = {}) => d.fetch(new Request(BASE + path, {method,
    headers: {...(body ? {'Content-Type': 'application/json'} : {}), ...(cookie ? {cookie} : {})}, body: body && JSON.stringify(body)}));
  const login = async (parentId, passcode) => {
    const r = await call('/parent/api/login', {method: 'POST', body: {parentId, passcode}});
    return r.status === 200 ? r.headers.get('set-cookie').split(';')[0] : null;
  };
  return {d, call, login};
}

test('dashboard page is served with nonce CSP and no inline transcript data', async () => {
  const {call} = await setup();
  const r = await call('/parent');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-security-policy'), /script-src 'nonce-[a-f0-9]{32}'/);
  const html = await r.text();
  assert.doesNotMatch(html, /hits me/);
});

test('API requires sign-in and rejects a wrong passcode', async () => {
  const {call, login} = await setup();
  assert.equal((await call('/parent/api/conversations')).status, 401);
  assert.equal(await login('parent-a', '9999'), null);
});

test('ordinary and flagged sessions both return full ordered Child and Teddy transcripts', async () => {
  const {call, login} = await setup();
  const cookie = await login('parent-a', '1111');
  for (const id of ['conv-a1', 'conv-a2']) {
    const c = await (await call('/parent/api/conversations/' + id, {cookie})).json();
    assert.ok(c.messages.length >= 10);
    assert.deepEqual(c.messages.map(m => m.speaker), c.messages.map((_, i) => i % 2 ? 'teddy' : 'child'));
    assert.deepEqual(c.messages.map(m => m.seq), [...c.messages.map(m => m.seq)].sort((a, b) => a - b));
    assert.ok(c.messages.every(m => m.text.length > 0));
  }
  const a1 = await (await call('/parent/api/conversations/conv-a1', {cookie})).json();
  assert.equal(a1.observations.length, 0);
  assert.equal(a1.analysis.content, 'complete');
});

test('demo includes a content concern from existing rules and a labelled synthetic speech observation', async () => {
  const {call, login} = await setup();
  const cookie = await login('parent-a', '1111');
  const {alerts} = await (await call('/parent/api/alerts', {cookie})).json();
  const content = alerts.find(a => a.type === 'content' && a.priority === 'urgent');
  const speech = alerts.find(a => a.type === 'speech');
  assert.equal(content.messageId, 'conv-a2-m09');
  assert.equal(content.source, 'keyword-rules');
  assert.equal(speech.source, 'synthetic');
  assert.equal(speech.priority, 'observation');
  assert.equal(speech.pushEligible, false);
  assert.equal(content.pushEligible, true);
  const c = await (await call('/parent/api/conversations/' + content.conversationId, {cookie})).json();
  const idx = c.messages.findIndex(m => m.id === content.messageId);
  assert.ok(idx > 0 && idx < c.messages.length - 1, 'flagged message has transcript above and below');
  assert.match(c.messages[idx].text, /hits me/);
});

test('marking reviewed updates the inbox and can be undone', async () => {
  const {call, login} = await setup();
  const cookie = await login('parent-a', '1111');
  const id = 'obs-conv-a2-m09-content';
  const r = await call(`/parent/api/alerts/${id}/review`, {method: 'POST', cookie, body: {reviewed: true}});
  assert.equal(r.status, 200);
  let {alerts} = await (await call('/parent/api/alerts', {cookie})).json();
  assert.ok(alerts.find(a => a.id === id).reviewedAt);
  assert.ok(alerts.at(-1).reviewedAt, 'reviewed items sort after open ones');
  await call(`/parent/api/alerts/${id}/review`, {method: 'POST', cookie, body: {reviewed: false}});
  ({alerts} = await (await call('/parent/api/alerts', {cookie})).json());
  assert.equal(alerts.find(a => a.id === id).reviewedAt, null);
});

test('a different parent cannot open, list or review another parent’s data by direct URL', async () => {
  const {call, login} = await setup();
  const b = await login('parent-b', '2222');
  assert.equal((await call('/parent/api/conversations/conv-a2', {cookie: b})).status, 404);
  assert.equal((await call('/parent/api/alerts/obs-conv-a2-m09-content/review', {method: 'POST', cookie: b, body: {reviewed: true}})).status, 404);
  const {conversations} = await (await call('/parent/api/conversations', {cookie: b})).json();
  assert.deepEqual(conversations.map(c => c.id), ['conv-b1']);
  const {alerts} = await (await call('/parent/api/alerts', {cookie: b})).json();
  assert.ok(alerts.every(a => a.conversationId === 'conv-b1'));
});

test('pending analysis is never presented as a completed check', async () => {
  const {call, login} = await setup();
  const cookie = await login('parent-a', '1111');
  const c = await (await call('/parent/api/conversations/conv-a4', {cookie})).json();
  assert.equal(c.analysis.content, 'pending');
  assert.equal(c.observations.length, 0);
});

test('cross-site API requests are refused', async () => {
  const {d} = await setup();
  const r = await d.fetch(new Request(BASE + '/parent/api/login', {method: 'POST', headers: {'Content-Type': 'application/json', Origin: 'https://evil.example'}, body: '{}'}));
  assert.equal(r.status, 403);
});

test('push payload is generic and only for important or urgent', () => {
  const base = {id: 'obs-x', reason: 'Child described someone hurting them', conversationTitle: 'Riddles'};
  assert.equal(pushPayloadFor({...base, priority: 'observation'}), null);
  for (const priority of ['important', 'urgent']) {
    const p = pushPayloadFor({...base, priority});
    assert.equal(p.title, 'New Teddy alert');
    assert.doesNotMatch(JSON.stringify(p), /hurting|Riddles|child/i);
  }
});

test('contract validation rejects bad priority, unknown message reference and unordered messages', () => {
  const conv = {id: 'c', ownerId: 'p', messages: [{id: 'm1', seq: 1, speaker: 'child', text: 'hi'}, {id: 'm2', seq: 2, speaker: 'teddy', text: 'hello'}]};
  assert.doesNotThrow(() => validateContract({version: 1, conversations: [conv]}));
  assert.throws(() => validateContract({version: 1, conversations: [{...conv, observations: [{id: 'o', type: 'content', priority: 'high', reason: 'x', messageId: 'm1'}]}]}));
  assert.throws(() => validateContract({version: 1, conversations: [{...conv, observations: [{id: 'o', type: 'speech', priority: 'observation', reason: 'x', messageId: 'zz'}]}]}));
  assert.throws(() => validateContract({version: 1, conversations: [{...conv, messages: [...conv.messages].reverse()}]}));
  assert.equal(validateContract({version: 1, conversations: [conv]})[0].analysis.content, 'not-run');
});

test('tummy pain raises an Important parent-review alert; urgent rules still win', () => {
  const store = createStore([]);
  const record = createLiveCapture(store, {ownerId: 'parent-a'});
  const s = '22222222-2222-2222-2222-222222222222';
  record(s, 'My tummy hurts', {text: 'reply', code: 'bounded-fallback'});
  record(s, 'my tummy hurts and I want to die', {text: 'reply', code: 'urgent-support'});
  const [c] = store.listConversations('parent-a');
  const obs = store.getConversation('parent-a', c.id).observations;
  assert.equal(obs[0].priority, 'important');
  assert.equal(obs[0].reason, 'Child reported tummy pain');
  assert.equal(obs[1].priority, 'urgent');
});

test('Three Little Pigs synthetic chat: full authored transcript, tummy line flagged, child word counts', async () => {
  const {call, login} = await setup();
  const cookie = await login('parent-a', '1111');
  const c = await (await call('/parent/api/conversations/conv-a6', {cookie})).json();
  assert.equal(c.title, 'The Three Little Pigs');
  assert.equal(c.source, 'synthetic-fixture');
  assert.equal(c.messages.length, 14);
  assert.match(c.messages[1].text, /^Of course\. Three little pigs/);
  assert.equal(c.observations.length, 1);
  const o = c.observations[0];
  assert.deepEqual([o.priority, o.reason, o.messageId], ['important', 'Child reported tummy pain', 'conv-a6-m11']);
  assert.match(c.messages.find(m => m.id === o.messageId).text, /My tummy hurts\.$/);
  assert.deepEqual(c.childWords, [{word: 'house', count: 3}, {word: 'story', count: 2}, {word: 'wolf', count: 2}, {word: 'blow', count: 2}, {word: 'brick', count: 2}]);
});

test('live capture adapter turns agent replies into transcript messages and content alerts', () => {
  const store = createStore([]);
  const record = createLiveCapture(store, {ownerId: 'parent-a'});
  record('11111111-1111-1111-1111-111111111111', 'Hello', {text: 'Hi, explorer!', code: 'welcome'});
  record('11111111-1111-1111-1111-111111111111', 'I feel sad', {text: 'That sounds tough.', code: 'support'});
  const [c] = store.listConversations('parent-a');
  const full = store.getConversation('parent-a', c.id);
  assert.deepEqual(full.messages.map(m => m.speaker), ['child', 'teddy', 'child', 'teddy']);
  assert.equal(full.observations.length, 1);
  assert.equal(full.observations[0].priority, 'important');
  assert.equal(full.observations[0].messageId, full.messages[2].id);
});
