import {readFileSync,writeFileSync} from 'node:fs';
const p='../worker/voice.js';let s=readFileSync(p,'utf8');
s=s.replace("'network':'The browser speech service could not connect. Try again or use the keyboard backup.'", "'network':'Speech-to-text could not connect to the browser’s recognition service. If this is VS Code’s preview, open http://127.0.0.1:3000 in a separate Google Chrome window. Check your internet connection and microphone permission. This error is not the conversation server or an OpenAI API-key error.'");
s=s.replace('<p>Sprout speaks through your selected computer speaker. Tap Talk for each turn.</p>', '<p>Sprout speaks through your selected computer speaker. Tap Talk for each turn.</p><p class="voice-note"><b>Microphone setup:</b> Open http://127.0.0.1:3000 in a separate Google Chrome window, outside VS Code. Browser speech recognition may require internet and is not supported by every embedded preview.</p>');
writeFileSync(p,s);
