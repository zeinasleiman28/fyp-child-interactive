import {readFileSync,writeFileSync} from 'node:fs';
let p='../tests/voice.test.mjs',s=readFileSync(p,'utf8');s=s.replace("speechSynthesis:{getVoices:()=>voices,cancel()", "speechSynthesis:{getVoices:()=>voices,addEventListener(k,f){windowEvents['synth:'+k]=f;},cancel()");writeFileSync(p,s);
