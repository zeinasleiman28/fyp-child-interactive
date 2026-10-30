import {readFileSync,writeFileSync} from 'node:fs';
let p='../worker/voice.js',s=readFileSync(p,'utf8');s=s.replace('  stop:stopAll','  settled(){talk.disabled=!enabled||!Recognition||processing||isBusy()||!!active;replay.disabled=!enabled||!last||processing||!!active;},\n  stop:stopAll');writeFileSync(p,s);
p='../worker/index.js';s=readFileSync(p,'utf8').replace('finally{busy=false;send.disabled=false;','finally{busy=false;dollVoice.settled();send.disabled=false;').replace('finally{busy=false}};const dialog','finally{busy=false;dollVoice.settled()}};const dialog');writeFileSync(p,s);
