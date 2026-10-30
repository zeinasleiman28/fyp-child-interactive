# Audio boundary for the future bear

The conversational agent receives text and returns checked text. It never opens a microphone, speaker, network audio stream or hardware device. `worker/audio.js` owns the demo audio implementation; `worker/voice.js` owns the turn controls and consumes only this small driver interface:

```js
{
  inputAvailable: true,
  createInput() { /* return one turn: */
    return {
      start() {}, stop() {}, abort() {},
      onStart: null,        // () => void
      onText: null,         // (finalTranscript: string) => void
      onError: null,        // (safeErrorCode: string) => void
      onEnd: null           // () => void
    };
  },
  speak(checkedText, { onEnd, onError }) {},
  cancelSpeech() {}
}
```

Each input turn emits at most one final transcript before onEnd. stop finalizes; abort discards. The controller ignores late events after abort, stops listening before playback, caps turns at 12 seconds, and validates transcripts at 500 characters before the server validates them again. Output is only a checked server response or authored UI guidance; input audio/transcripts are never echoed through speech synthesis. Playback cancellation must not start another microphone turn.

Current adapter: Web Speech recognition → final transcript; installed local English voice → computer speaker. The browser does not expose its internal PCM format to this app. Recognition may use its own provider. This is a working laptop-oriented implementation, not an ESP32 transport or local offline STT implementation.

Future adapter: ESP32-S3 mic → authenticated Wi-Fi audio stream → Pi/Jetson STT → onText → existing agent/guard → checked text → TTS → ESP32 amp/speaker. A suitable internal source contract for the future brain is an abortable AsyncIterable<Uint8Array> with explicit metadata `{sampleRate:16000, channels:1, encoding:'pcm_s16le'}`; nominal 20 ms chunks contain 640 bytes. The future source and resampler must actually verify that format. A network driver wraps the source, bounds buffers/turn duration, transcribes it, and exposes the turn interface above. The output implementation can synthesize PCM and send it back over the same authenticated device channel.

Marc's proposed hardware: Seeed XIAO ESP32-S3 Sense, ReSpeaker Lite 2-mic array, MAX98357A amplifier and 40 mm speaker; brain: Raspberry Pi 5 or Jetson Orin Nano. Compatibility, wiring, audio clock/sample rate, resampling and physical playback still need hardware validation. Mutual TLS, device identity/pairing, replay protection, backpressure, reconnect behavior and certificate lifecycle belong in the future transport; none is claimed to exist in this laptop demo. A device identity must be mapped to server-owned sessions by the brain, never accepted as a freely chosen client session/role. No raw-audio upload endpoint was opened in the existing local server.

Replacing the audio adapter does not require modifying the conversation policy, history, moderation, output gate or model provider. It does require implementing and testing transport/STT/TTS for the actual hardware. RAG and embedded firmware are outside the current agent deliverable.
