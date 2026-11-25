# Teddy parent dashboard (FYP demo)

A phone-first parent view of the child's transcribed words, Teddy's replies, and items for adult review.
It is served by the existing zero-dependency server (`npm run dev`) at **http://127.0.0.1:3000/parent**.

## What is live, synthetic, or pending

| Part | Status |
|---|---|
| Teddy's replies in the demo conversations | **Live code, synthetic input.** At startup, synthetic child lines are replayed through the real agent (`worker/agent.js`, curated mode, no network). |
| Conversation-content alerts | **Live code, synthetic input.** They come from the existing keyword safety rules in `converse()` (`worker/index.js`), mapped to priorities in `CONTENT_RULES` (`dashboard/data.js`). These are review prompts, not validated detection. |
| Speech-pattern observations | **Synthetic.** No upstream component reports how a child spoke, and browser speech recognition returns text only. They are labelled `SYNTHETIC example` in the UI. |
| Live capture of real `/api/chat` turns | **Opt-in** with `TEDDY_LIVE_CAPTURE=1`. Turns are held in memory only, never logged or written to disk, and all assigned to Parent A because the child app has no account linking. |
| Parent sign-in | **Demo only.** There are two fixed synthetic accounts with in-memory sessions. Ownership is checked on every API call, and another parent's conversation returns 404. This is not production auth. |
| Reviewed state | **Temporary.** It is kept in server memory and resets when the server restarts. The repo has no persistent store. |
| Phone push | **Pending.** See below. The in-app inbox, count badge and a generic in-app toast (polled every 15 s) work today. |

## Priorities

| Priority | Shown in dashboard | Eligible for phone push |
|---|---|---|
| `observation` | yes | **no** |
| `important` | yes | yes |
| `urgent` | yes | yes |

The push payload is built by `pushPayloadFor()` and is always generic: `New Teddy alert` plus a link to
`/parent/#/alert/<id>`. It never contains child speech, reasons, or conversation titles. Opening that link while
signed out shows parent sign-in first, then opens the alert.

## Analysis status

Each conversation reports `analysis.content` and `analysis.speech` as `complete`, `pending`, `failed`,
`not-run`, or `synthetic`. A pending or failed check is shown as **not checked**, never as "no concerns".
A complete check with no flags still says that keyword rules can miss things.

## Input contract v1 (for the speech/transcript teammate)

Validated by `validateContract()` in `dashboard/data.js`. IDs must be stable across re-sends.

```json
{
  "version": 1,
  "source": "stt-pipeline",
  "conversations": [{
    "id": "conv-123",
    "ownerId": "parent-a",
    "title": "After school chat",
    "startedAt": "2026-11-24T17:15:00Z",
    "analysis": {"content": "complete", "speech": "pending"},
    "messages": [
      {"id": "conv-123-m01", "seq": 1, "speaker": "child", "text": "Hi Teddy", "at": "2026-11-24T17:15:00Z"},
      {"id": "conv-123-m02", "seq": 2, "speaker": "teddy", "text": "Hi, explorer!", "at": "2026-11-24T17:15:04Z"}
    ],
    "observations": [
      {"id": "obs-1", "type": "speech", "priority": "observation",
       "reason": "Repeated first sound in “bridge”", "messageId": "conv-123-m01",
       "source": "upstream-speech", "detail": "optional longer note"}
    ]
  }]
}
```

The contract has these rules:
- `speaker` must be `child` or `teddy`.
- `seq` must be strictly increasing integers.
- `type` must be `content` or `speech`.
- `priority` must be `observation`, `important` or `urgent`.
- `messageId` must reference a message in the same conversation.

Adapter for a single agent turn: `adaptTurn({conversationId, seq, childText, reply, at})`, where `reply` is the
`/api/chat` body `{text, code, ...}`. A future classifier can emit observations directly in the contract
without changing the UI.

## Remaining work for real Web Push

1. An HTTPS deployment reachable from the phone. The dev server binds to `127.0.0.1` with a host allowlist, so a phone cannot reach it.
2. VAPID keys and a push sender (for example the `web-push` package, or an equivalent signer using `node:crypto`).
3. A service worker at `/parent/sw.js` with an explicit opt-in button, storage of push subscriptions per parent, and a `notificationclick` handler that opens `payload.url`.
4. On iPhone, the dashboard must be added to the Home Screen (iOS 16.4+) and push tested from there. That also needs a web app manifest.
5. Send `pushPayloadFor(alert)` only for new `important`/`urgent` alerts, then test with the dashboard closed.

## Tests

- `npm test` includes `tests/dashboard.test.mjs`, which covers ownership, review, priorities, the generic push payload, pending analysis and contract validation.
- The phone-viewport check (360 px, headless Edge) was run separately during development and is not part of `npm test`.
