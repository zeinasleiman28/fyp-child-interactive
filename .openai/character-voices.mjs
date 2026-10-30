import {readFileSync,writeFileSync} from 'node:fs';
let p='../worker/audio.js',s=readFileSync(p,'utf8');s=s.replace(' const synth=window.speechSynthesis;', ` const synth=window.speechSynthesis;
 let selectedVoice='',style='playful';
 const voices=()=>synth?.getVoices().filter(v=>v.localService&&/^en(?:-|$)/i.test(v.lang))||[];
 const id=v=>v.voiceURI||v.name||v.lang;
 const preferred=()=>voices().find(v=>/zira|hazel|susan|samantha/i.test(v.name||''))||voices().find(v=>v.default)||voices()[0];`);
s=s.replace('  inputAvailable:!!Recognition,', `  inputAvailable:!!Recognition,
  listVoices(){return voices().map(v=>({id:id(v),name:v.name||v.lang,lang:v.lang}));},
  getVoice(){return selectedVoice|| (preferred()?id(preferred()):'');},
  setVoice(value){if(voices().some(v=>id(v)===value))selectedVoice=value;},
  setStyle(value){style=['playful','gentle','natural'].includes(value)?value:'playful';},
  onVoicesChanged(callback){synth?.addEventListener?.('voiceschanged',callback);},`);
s=s.replace("const voice=synth?.getVoices().find(v=>v.localService&&/^en(?:-|$)/i.test(v.lang));", "const voice=voices().find(v=>id(v)===selectedVoice)||preferred();");
s=s.replace('utterance.rate=.92;utterance.pitch=1.05;', "const preset={playful:{rate:1.02,pitch:1.45},gentle:{rate:.9,pitch:1.15},natural:{rate:.95,pitch:1}}[style];utterance.rate=preset.rate;utterance.pitch=preset.pitch;");writeFileSync(p,s);
p='../worker/voice.js';s=readFileSync(p,'utf8');const anchor=' const inputAvailable=audio.inputAvailable;';s=s.replace(anchor,anchor+`
 const voiceChoice=get('voice-choice'),styleChoice=get('voice-style'),preview=get('voice-preview');
 function populateVoices(){const voices=audio.listVoices?.()||[];voiceChoice.replaceChildren();for(const voice of voices){const option=document.createElement('option');option.value=voice.id;option.textContent=voice.name+' ('+voice.lang+')';voiceChoice.append(option);}voiceChoice.disabled=!voices.length;if(voices.length)voiceChoice.value=audio.getVoice?.()||voices[0].id;}
 populateVoices();audio.onVoicesChanged?.(populateVoices);
 voiceChoice.onchange=()=>{stopAll();audio.setVoice?.(voiceChoice.value);state('Voice changed. Press Try voice to hear it.');};
 styleChoice.onchange=()=>{stopAll();audio.setStyle?.(styleChoice.value);state('Voice style changed. Press Try voice to hear it.');};
 preview.onclick=()=>{if(processing||isBusy())return;enabled=true;introduced=true;say('Hello, explorer! I’m Sprout. A tiny dragon has found a cloud shaped like a pancake. Shall we follow it?');};`);
s=s.replace('<p id="voice-status" role="status">Voice is off.</p>', '<details class="voice-settings"><summary>Choose Sprout’s voice</summary><label>Installed voice <select id="voice-choice" aria-label="Installed voice"></select></label><label>Character style <select id="voice-style" aria-label="Character style"><option value="playful" selected>Playful character</option><option value="gentle">Gentle storyteller</option><option value="natural">Natural voice</option></select></label><button id="voice-preview" type="button">Try voice</button><p>Choose a voice such as Zira if available. Playful style raises pitch; the result depends on the installed voice. No character imitation is promised.</p></details><div class="voice-buttons story-samples"><button type="button" data-prompt="Tell me a story">Fox story</button><button type="button" data-prompt="Tell me a space story">Space story</button><button type="button" data-prompt="Tell me a dragon story">Dragon story</button></div><p id="voice-status" role="status">Voice is off.</p>');
s=s.replace('export const voiceStyles=`', 'export const voiceStyles=`.voice-settings{padding:8px 0}.voice-settings label{display:block;font-size:13px;margin:9px 0}.voice-settings select{max-width:100%;padding:7px;border:1px solid #b6ca9f;border-radius:8px;margin-left:8px;font:inherit}.voice-settings button{padding:8px 14px;border-radius:9px;border:1px solid #b6ca9f;background:#fffefa;font:inherit}.story-samples button{font-size:13px;padding:9px 12px}');writeFileSync(p,s);
p='../tests/voice.test.mjs';s=readFileSync(p,'utf8');s=s.replace("dataset:{},setAttribute", "dataset:{},children:[],replaceChildren(){this.children=[];},append(child){this.children.push(child);},setAttribute");s=s.replace("const document={hidden:false,querySelector", "const document={hidden:false,createElement(){return {value:'',textContent:''};},querySelector");writeFileSync(p,s);
