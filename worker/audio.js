/**
 * Audio driver contract (no DOM and no agent-policy knowledge):
 * inputAvailable: boolean
 * createInput(): { start(), stop(), abort(), onStart, onText(text), onError(code), onEnd }
 * speak(checkedText, {onEnd, onError}): void; cancelSpeech(): void
 * Only the final transcript crosses into /api/chat. Raw audio never becomes agent input.
 * A future network driver can receive 16 kHz mono PCM16LE, transcribe it on the
 * brain, and implement the same turn contract. It must honor abort and emit one
 * final onText per turn. Browser recognition here hides its internal audio format.
 */
export function createBrowserAudio(window) {
 const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 const synth=window.speechSynthesis;
 let selectedVoice='',style='playful';
 const voices=()=>synth?.getVoices().filter(v=>v.localService&&/^en(?:-|$)/i.test(v.lang))||[];
 const id=v=>v.voiceURI||v.name||v.lang;
 const preferred=()=>voices().find(v=>/zira|hazel|susan|samantha/i.test(v.name||''))||voices().find(v=>v.default)||voices()[0];
 return {
  inputAvailable:!!Recognition,
  listVoices(){return voices().map(v=>({id:id(v),name:v.name||v.lang,lang:v.lang}));},
  getVoice(){return selectedVoice|| (preferred()?id(preferred()):'');},
  setVoice(value){if(voices().some(v=>id(v)===value))selectedVoice=value;},
  setStyle(value){style=['playful','gentle','natural'].includes(value)?value:'playful';},
  onVoicesChanged(callback){synth?.addEventListener?.('voiceschanged',callback);},
  createInput(){
   if(!Recognition)throw Error('Speech input unavailable');
   const recognition=new Recognition();
   recognition.lang='en-US';recognition.continuous=false;recognition.interimResults=false;recognition.maxAlternatives=1;
   const turn={start:()=>recognition.start(),stop:()=>recognition.stop(),abort:()=>recognition.abort(),onStart:null,onText:null,onError:null,onEnd:null};
   recognition.onstart=()=>turn.onStart?.();
   recognition.onresult=e=>{const result=e.results?.[e.resultIndex||0];if(result?.isFinal)turn.onText?.(result[0]?.transcript||'');};
   recognition.onerror=e=>turn.onError?.(e.error);
   recognition.onend=()=>turn.onEnd?.();
   return turn;
  },
  cancelSpeech(){synth?.cancel();},
  speak(text,{onEnd,onError}){
   const voice=voices().find(v=>id(v)===selectedVoice)||preferred();
   if(!synth||!window.SpeechSynthesisUtterance||!voice)throw Error('No installed English voice is available. Add an English voice in Windows Speech settings, then try again.');
   const utterance=new window.SpeechSynthesisUtterance(text);utterance.voice=voice;utterance.lang=voice.lang;const preset={playful:{rate:1.02,pitch:1.45},gentle:{rate:.9,pitch:1.15},natural:{rate:.95,pitch:1}}[style];utterance.rate=preset.rate;utterance.pitch=preset.pitch;
   utterance.volume=1;utterance.onend=onEnd;utterance.onerror=onError;synth.resume?.();synth.speak(utterance);
  }
 };
}
