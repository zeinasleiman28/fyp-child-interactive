# Delivered verification — October 30, 2026

- Node v24.16.0, Windows PowerShell.
- `node --test tests/*.test.mjs`: **98 passed, 0 failed**.
- `node scripts/smoke.mjs`: local HTTP page, browser script syntax, CSP, story branching, server-owned puzzle state, privacy refusal, override refusal, reset, inaccessible .env route, origin denial and oversized-body rejection passed.
- Mocked OpenAI Responses and Moderations calls cover normal generation, context bounds, semantic multi-turn denial, sensitive education, output moderation, output policy rejection, malformed safety responses, provider failures, actual AbortSignal timeout, oversized output, session expiry and forged ownership.
- Live OpenAI API was **not tested**: OPENAI_API_KEY was absent and no .env existed. No credential values were printed.
- No browser visual/accessibility audit was performed; the existing interface was preserved and delivered inline script syntax was checked.
- The previous hosting build helper was updated to include the adapter module; no hosting build, deployment, publication or public repository was created.

These tests verify application behavior under specified mocked decisions. They do not validate actual model/moderation accuracy or establish complete security. Remaining limitations and the two-minute presentation script are in the project README.

## Speech-first update

Added 18 deterministic voice-controller tests with mocked browser recognition/synthesis, plus a delivered-page script syntax check. Tests cover opt-in microphone, final-only transcripts, short-turn timeout, oversized input, Stop and late events, permission errors, local-only English voices, spoken live/curated labels, pending-reply suppression, reset and tab hiding. HTTP smoke passed with the speech UI served. Microphone/speaker audibility, real browser recognition, physical doll hardware and live OpenAI remain untested. The voice demo currently uses laptop audio; physical ESP32/Pi transport is future work, as agreed with the user.

The replaceable audio-driver contract is documented in `worker/AUDIO-INTERFACE.md`, including a future 16 kHz mono PCM16LE source. A test replaces browser audio with a mock alternate driver without changing the agent.

## Conversation experience correction

91 tests pass. New scenarios cover natural spoken story/riddle/math requests, server-owned story continuation and choices, helpful authored fallback with a working next turn, safety before intent aliases, one-time demo disclosure without repeated spoken labels, replay, honest server-initialized mode labels, secret non-disclosure, and playable outage fallback during cooldown. `node scripts/check-live.mjs` reported Live AI OFF because no API key/.env exists. Real provider access and microphone audibility remain unverified.

## Voice choice and actual audio samples

98 tests pass, including local English voice filtering, explicit voice choice, Zira preference, pitch/rate presets, asynchronous voice loading, distinct space/dragon stories and safety-before-story selection. Three RIFF/WAVE samples were synthesized with Microsoft Zira Desktop: fox 617328 bytes, space 590410 bytes, dragon 633628 bytes. Generating files does not verify audible playback. User reported no sound; separate browser-speech and prerecorded-WAV controls were added for diagnosis. Live provider access is still unverified.
