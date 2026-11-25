// Parent dashboard data layer: input contract v1, adapter from agent turns, and in-memory store.
// Transcripts are held in process memory only. Nothing here logs or sends transcript text anywhere.
import {createAgent} from '../worker/agent.js';
import {FIXTURE_SCRIPTS} from './fixture.js';

export const PRIORITIES = ['observation', 'important', 'urgent'];
export const PUSH_PRIORITIES = new Set(['important', 'urgent']);
const STATUSES = ['complete', 'pending', 'failed', 'not-run', 'synthetic'];

// Mapping from the existing keyword safety rules (worker/index.js converse()) and agent block
// codes to dashboard priorities. These are review prompts for a parent, not validated detections.
export const CONTENT_RULES = {
  'urgent-support': {priority: 'urgent', reason: 'Words about self-harm or an emergency'},
  'trusted-adult': {priority: 'urgent', reason: 'Child described someone hurting or touching them'},
  'support': {priority: 'important', reason: 'Child said they feel sad, worried or upset'},
  'harm-boundary': {priority: 'important', reason: 'Mentioned violence, weapons or other dangerous things'},
  'age-boundary': {priority: 'important', reason: 'Sexual words came up'},
  'privacy-boundary': {priority: 'important', reason: 'Private details (address, phone, secrets) came up'},
  'safety-boundary': {priority: 'important', reason: 'Teddy’s safety check blocked this message'},
  'relationship-boundary': {priority: 'observation', reason: 'Talked about Teddy as a replacement for people'},
  'health-boundary': {priority: 'observation', reason: 'Mentioned feeling ill or medicine'},
  'instruction-boundary': {priority: 'observation', reason: 'Tried to change Teddy’s rules or open links'},
};

// Dashboard-only parent-review rules applied to the child's own words. Not a diagnosis and not urgent by
// default; an urgent agent rule on the same turn always wins.
const BODY = '(?:tummy|stomach|belly)';
export const PARENT_REVIEW_RULES = [
  {id: 'tummy-pain', priority: 'important', reason: 'Child reported tummy pain',
    pattern: new RegExp(`\\b${BODY}\\b.{0,30}\\b(?:hurts?|hurting|aches?|aching|pain|sore)\\b|\\b${BODY} ?aches?\\b|\\bhurts?\\b.{0,20}\\b${BODY}\\b`, 'i')},
];

/** Adapter: one agent turn (child transcript + agent reply body) -> contract messages + content observation. */
export function adaptTurn({conversationId, seq, childText, reply, at, replyAt}) {
  const childId = `${conversationId}-m${String(seq).padStart(2, '0')}`;
  const teddyId = `${conversationId}-m${String(seq + 1).padStart(2, '0')}`;
  const messages = [
    {id: childId, seq, speaker: 'child', text: childText, at},
    {id: teddyId, seq: seq + 1, speaker: 'teddy', text: String(reply?.text ?? ''), at: replyAt || at},
  ];
  const rule = CONTENT_RULES[reply?.code];
  const review = rule?.priority === 'urgent' ? null : PARENT_REVIEW_RULES.find(r => r.pattern.test(childText));
  const observations = review ? [{
    id: `obs-${childId}-content`, type: 'content', priority: review.priority, reason: review.reason,
    messageId: childId, source: 'parent-review-rule',
    detail: `Matched the dashboard’s parent-review rule “${review.id}”. This is for a parent to check in about, not a diagnosis. Keyword rules can miss things or over-flag.`,
  }] : rule ? [{
    id: `obs-${childId}-content`, type: 'content', priority: rule.priority, reason: rule.reason,
    messageId: childId, source: 'keyword-rules',
    detail: `Matched Teddy’s existing keyword safety rule “${reply.code}”, and Teddy gave its safety reply. Keyword rules can miss things or over-flag. Please read the surrounding conversation.`,
  }] : [];
  return {messages, observations};
}

/** Validate a contract v1 payload. Throws on the first problem; returns normalised conversations. */
export function validateContract(payload) {
  const fail = m => { throw new Error('Invalid conversation contract: ' + m); };
  if (!payload || payload.version !== 1 || !Array.isArray(payload.conversations)) fail('expected {version:1, conversations:[]}');
  const ids = new Set();
  return payload.conversations.map(c => {
    if (typeof c.id !== 'string' || !c.id || ids.has(c.id)) fail('conversation id missing or duplicated');
    ids.add(c.id);
    if (typeof c.ownerId !== 'string' || !c.ownerId) fail(`ownerId missing on ${c.id}`);
    if (!Array.isArray(c.messages)) fail(`messages missing on ${c.id}`);
    const msgIds = new Set();
    let last = -Infinity;
    for (const m of c.messages) {
      if (typeof m.id !== 'string' || msgIds.has(m.id)) fail(`message id missing or duplicated in ${c.id}`);
      if (!['child', 'teddy'].includes(m.speaker)) fail(`speaker must be child or teddy (${m.id})`);
      if (typeof m.text !== 'string') fail(`text missing (${m.id})`);
      if (!Number.isInteger(m.seq) || m.seq <= last) fail(`seq must be increasing integers (${m.id})`);
      last = m.seq; msgIds.add(m.id);
    }
    const analysis = {content: c.analysis?.content ?? 'not-run', speech: c.analysis?.speech ?? 'not-run'};
    if (!STATUSES.includes(analysis.content) || !STATUSES.includes(analysis.speech)) fail(`bad analysis status on ${c.id}`);
    const observations = (c.observations ?? []).map(o => {
      if (typeof o.id !== 'string' || !['content', 'speech'].includes(o.type)) fail(`observation id/type invalid in ${c.id}`);
      if (!PRIORITIES.includes(o.priority)) fail(`priority must be one of ${PRIORITIES.join(', ')} (${o.id})`);
      if (typeof o.reason !== 'string' || !o.reason.trim()) fail(`reason missing (${o.id})`);
      if (!msgIds.has(o.messageId)) fail(`messageId ${o.messageId} not in ${c.id}`);
      return {source: 'unspecified', detail: '', ...o};
    });
    return {title: c.id, startedAt: c.messages[0]?.at ?? null, source: payload.source ?? 'unspecified', ...c, analysis, observations};
  });
}

/** Replay synthetic child lines through the real agent (curated mode, no network) to build contract v1. */
export async function buildFixtureContract() {
  const agent = createAgent({env: {SPROUT_MODE: 'curated'}, fetchImpl: () => { throw new Error('network disabled for fixture'); }});
  const conversations = [];
  for (const script of FIXTURE_SCRIPTS) {
    let cookie = '';
    const messages = [], observations = [];
    const t0 = Date.parse(script.startedAt);
    for (const [i, childText] of script.child.entries()) {
      const request = new Request('http://127.0.0.1/api/chat', {method: 'POST', headers: cookie ? {cookie} : {}});
      const result = await agent.handle(request, {message: childText});
      if (result.cookie) cookie = result.cookie.split(';')[0];
      const at = new Date(t0 + i * 45000).toISOString();
      const reply = script.teddy ? {...result.body, text: script.teddy[i]} : result.body;
      const turn = adaptTurn({conversationId: script.id, seq: i * 2 + 1, childText, reply, at,
        replyAt: new Date(t0 + i * 45000 + 4000).toISOString()});
      messages.push(...turn.messages);
      // A pending or failed content check must never surface results as if it had completed.
      if (script.contentAnalysis === 'complete') observations.push(...turn.observations);
    }
    for (const s of script.speechObservations ?? []) {
      const messageId = messages.filter(m => m.speaker === 'child')[s.childIndex].id;
      observations.push({id: `obs-${messageId}-speech`, type: 'speech', priority: s.priority, reason: s.reason,
        messageId, source: 'synthetic', detail: s.detail});
    }
    conversations.push({id: script.id, ownerId: script.ownerId, title: script.title, startedAt: script.startedAt,
      analysis: {content: script.contentAnalysis, speech: script.speechAnalysis ?? 'not-run'}, messages, observations});
  }
  return {version: 1, source: 'synthetic-fixture', conversations};
}

// Common filler words skipped in the child word chart.
const FILLER = new Set(('a an the and or but so if then than too very just really also i i\'m i\'ll i\'d me my mine myself ' +
  'you your we us our it its it\'s he she they them his her this that these those there here is am are was were be been ' +
  'do does did done can could would will shall should may might must have has had to of in on at by for with from up ' +
  'down out over into about as what why how when where who which yes no not ok okay um uh oh like well tell let\'s get got').split(' '));

/** Top words in the child's messages only: case/punctuation normalised, filler skipped, ties by first use. */
export function topChildWords(messages, limit = 5) {
  const counts = new Map();
  for (const m of messages) {
    if (m.speaker !== 'child') continue;
    const words = m.text.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9'\s]/g, ' ').split(/\s+/)
      .map(w => w.replace(/^'+|'+$/g, '')).filter(w => w && !FILLER.has(w) && !/^\d+$/.test(w));
    for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([word, count]) => ({word, count}));
}

export function createStore(conversations = []) {
  const byId = new Map();
  const reviewed = new Map(); // observation id -> ISO time. In-memory: resets on server restart.
  const add = list => { for (const c of list) byId.set(c.id, c); };
  add(conversations);

  const owned = (ownerId, id) => { const c = byId.get(id); return c && c.ownerId === ownerId ? c : null; };
  const alertView = (c, o) => ({
    id: o.id, type: o.type, priority: o.priority, reason: o.reason, source: o.source, detail: o.detail,
    conversationId: c.id, conversationTitle: c.title, messageId: o.messageId,
    at: c.messages.find(m => m.id === o.messageId)?.at ?? c.startedAt,
    reviewedAt: reviewed.get(o.id) ?? null, pushEligible: PUSH_PRIORITIES.has(o.priority),
  });
  const rank = p => PRIORITIES.indexOf(p);

  return {
    add,
    listConversations(ownerId) {
      return [...byId.values()].filter(c => c.ownerId === ownerId)
        .sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)))
        .map(c => {
          const open = c.observations.filter(o => !reviewed.has(o.id));
          return {id: c.id, title: c.title, startedAt: c.startedAt, source: c.source, analysis: c.analysis,
            messageCount: c.messages.length, openAlerts: open.length,
            topPriority: open.reduce((p, o) => rank(o.priority) > rank(p ?? '') ? o.priority : p, null)};
        });
    },
    getConversation(ownerId, id) {
      const c = owned(ownerId, id);
      if (!c) return null;
      return {id: c.id, title: c.title, startedAt: c.startedAt, source: c.source, analysis: c.analysis,
        messages: c.messages, observations: c.observations.map(o => alertView(c, o)), childWords: topChildWords(c.messages)};
    },
    listAlerts(ownerId) {
      return [...byId.values()].filter(c => c.ownerId === ownerId)
        .flatMap(c => c.observations.map(o => alertView(c, o)))
        .sort((a, b) => (!!a.reviewedAt - !!b.reviewedAt) || (rank(b.priority) - rank(a.priority)) || b.at.localeCompare(a.at));
    },
    setReviewed(ownerId, alertId, value) {
      for (const c of byId.values()) {
        if (c.ownerId !== ownerId) continue;
        const o = c.observations.find(x => x.id === alertId);
        if (!o) continue;
        if (value) reviewed.set(o.id, reviewed.get(o.id) ?? new Date().toISOString()); else reviewed.delete(o.id);
        return alertView(c, o);
      }
      return null;
    },
  };
}

/** Generic push payload. Never includes child speech, reasons or conversation details. */
export function pushPayloadFor(alert) {
  if (!PUSH_PRIORITIES.has(alert.priority)) return null;
  return {title: 'New Teddy alert', body: 'Open the Teddy parent dashboard to review.', url: `/parent/#/alert/${encodeURIComponent(alert.id)}`};
}
