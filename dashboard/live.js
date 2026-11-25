// OPT-IN live adapter (TEDDY_LIVE_CAPTURE=1). Feeds real /api/chat turns into the dashboard store.
// Memory only: never written to disk, never logged, cleared on restart. All captured sessions are
// assigned to one demo parent because the child app has no account linking yet.
import {adaptTurn} from './data.js';

export function createLiveCapture(store, {ownerId = 'parent-a'} = {}) {
  const bySession = new Map(); // child-app session token -> conversation (token never exposed)
  return function record(sessionToken, childText, reply) {
    if (!sessionToken || typeof childText !== 'string' || !reply || typeof reply.text !== 'string') return;
    let c = bySession.get(sessionToken);
    if (!c) {
      const now = new Date().toISOString();
      c = {id: 'live-' + crypto.randomUUID().slice(0, 8), ownerId, title: 'Live session (local capture)', startedAt: now,
        source: 'live-capture', analysis: {content: 'complete', speech: 'not-run'}, messages: [], observations: []};
      bySession.set(sessionToken, c);
      store.add([c]);
    }
    const at = new Date().toISOString();
    const turn = adaptTurn({conversationId: c.id, seq: c.messages.length + 1, childText, reply, at});
    c.messages.push(...turn.messages);
    c.observations.push(...turn.observations);
  };
}
