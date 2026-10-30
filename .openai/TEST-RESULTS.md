# Delivered verification — October 30, 2026

- Node v24.16.0, Windows PowerShell.
- `node --test tests/*.test.mjs`: **56 passed, 0 failed**.
- `node scripts/smoke.mjs`: local HTTP page, browser script syntax, CSP, story branching, server-owned puzzle state, privacy refusal, override refusal, reset, inaccessible .env route, origin denial and oversized-body rejection passed.
- Mocked OpenAI Responses and Moderations calls cover normal generation, context bounds, semantic multi-turn denial, sensitive education, output moderation, output policy rejection, malformed safety responses, provider failures, actual AbortSignal timeout, oversized output, session expiry and forged ownership.
- Live OpenAI API was **not tested**: OPENAI_API_KEY was absent and no .env existed. No credential values were printed.
- No browser visual/accessibility audit was performed; the existing interface was preserved and delivered inline script syntax was checked.
- The previous hosting build helper was updated to include the adapter module; no hosting build, deployment, publication or public repository was created.

These tests verify application behavior under specified mocked decisions. They do not validate actual model/moderation accuracy or establish complete security. Remaining limitations and the two-minute presentation script are in the project README.
