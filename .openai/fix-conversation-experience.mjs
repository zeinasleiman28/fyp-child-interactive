import {readFileSync,writeFileSync} from 'node:fs';
let p='../worker/index.js',s=readFileSync(p,'utf8');
s=s.replace("const reply = (code, text, choices=[]) => ({code,text,choices,engine:'curated-v1'});", "const reply = (code, text, choices=[], activity=['riddle','math'].includes(code)?code:'') => ({code,text,choices,activity,engine:'curated-v1'});");
s=s.replace("  const t = message.normalize", "  let t = message.normalize");
const anchor="  if (/\\b(hi|hello|hey)\\b/.test(t)";
const at=s.indexOf(anchor);if(at<0)throw Error('activity insertion');
const intents=String.raw`  // Safety checks above always run before friendly intent aliases.
  const q=message.normalize('NFKC').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
  const next=/^(?:yes|yes please|okay|ok|go on|continue|continue the story|what happens next|next|keep going|tell me more|please continue)$/;
  if (/what can you do|what do you know|what (?:stories|adventures|games) (?:do you (?:know|have)|can)|what are (?:the|your) adventures|give me (?:some )?(?:choices|options)/.test(q)) return reply('activity-menu','We can follow Pip the fox to a glowing tree, solve a towel riddle, or count paper stars. Say “tell me a story,” “give me a riddle,” or “math puzzle.”',['Start a story','Give me a riddle','Math puzzle']);
  if (activity==='story-choice') {
    if (/\bowl\b/.test(q)||/^(first|first one|the first one|option one|1)$/.test(q)||next.test(q)) t='visit the owl';
    else if (/\bbridge\b/.test(q)||/^(second|second one|the second one|option two|2)$/.test(q)) t='cross the bridge';
  }
  if (activity==='story-ending-choice') {
    if (/\bplant\b/.test(q)||/^(first|first one|the first one|option one|1)$/.test(q)||next.test(q)) t='plant the seed';
    else if (/\bshare\b/.test(q)||/^(second|second one|the second one|option two|2)$/.test(q)) t='share with a friend';
  }
  if (t!=='visit the owl'&&t!=='cross the bridge'&&t!=='plant the seed'&&t!=='share with a friend') {
    if (/\bhint\b/.test(q)) t='hint';
    else if (['riddle','math'].includes(activity)&&/answer|dont know|do not know|give up|tell me|no idea/.test(q)) t='reveal answer';
    else if (/\b(story|stories|adventure|fairy tale|bedtime)\b/.test(q)) t='start a story';
    else if (/\b(riddle|riddles)\b/.test(q)||/^(?:can you |please )?(?:give|tell) me a puzzle(?: please)?$/.test(q)) t='give me a riddle';
    else if (/\b(math|maths|number puzzle|counting|paper stars)\b/.test(q)) t='math puzzle';
    else if (/\b(space|planet|planets|venus)\b/.test(q)||/^(?:tell|give) me (?:a |an? interesting )?(?:fun )?fact(?: please)?$/.test(q)) t='space fact';
    else if (/\b(animal|animals|octopus|octopuses)\b/.test(q)) t='animal fact';
    else if (/\bkindness\b/.test(q)) t='kindness challenge';
    else if (/\bowl\b/.test(q)) t='visit the owl';
    else if (/\bbridge\b/.test(q)) t='cross the bridge';
    else if (/\bplant.*seed\b/.test(q)) t='plant the seed';
    else if (/\bshare.*(?:friend|seed)\b/.test(q)) t='share with a friend';
  }
`;
s=s.slice(0,at)+intents+s.slice(at);
s=s.replace("['Visit the owl','Cross the bridge']);", "['Visit the owl','Cross the bridge'],'story-choice');");
s=s.replaceAll("['Plant the seed','Share with a friend']);", "['Plant the seed','Share with a friend'],'story-ending-choice');");
s=s.replace("I’m still a small demo, so I only know a few safe adventures. I won’t guess about something I don’t know. Pick one and let’s explore!", "I don’t have a prepared answer to that. Let’s begin a little adventure: Pip the fox found a seed glowing like a star. Should Pip visit the sleepy owl or cross the little bridge?");
s=s.replace("['Start a story','Give me a riddle','Space fact']);\n}", "['Visit the owl','Cross the bridge'],'story-choice');\n}");
// A visible mode near the voice controls, initialized from server configuration.
s=s.replace('<span><span id="mode">Curated demo · awaiting first reply</span></span>', '<span>Mode is shown above the voice controls.</span>');
s=s.replace("const dollAudio=(${createBrowserAudio.toString()})(window);", "const runtimeMode='BOOT_MODE';\ndocument.querySelector('#mode').textContent=runtimeMode==='live'?'Live AI configured · awaiting checked reply':'Curated demo · live AI not configured';\nconst dollAudio=(${createBrowserAudio.toString()})(window);");
s=s.replace('audio:dollAudio,onMessage:submit', 'audio:dollAudio,mode:runtimeMode,onMessage:submit');
s=s.replace("const agent=createAgent(options); return", "const agent=createAgent(options); const env=options.env||process.env; const mode=env.OPENAI_API_KEY?.trim()&&env.SPROUT_MODE!=='curated'?'live':'curated'; return");
s=s.replace("page.replaceAll('NONCE',nonce)", "page.replaceAll('NONCE',nonce).replaceAll('BOOT_MODE',mode)");
s=s.replace("Ages 8–12</span>", "Ages 8–12</span>");
s=s.replace('<div class="grid"><div class="card"><h3>What actually runs', '<div class="warning"><b>Enable real conversation</b><br>Set OPENAI_API_KEY in the project’s local .env file and restart the server. Without that key, only prewritten activities run. Keep the key private; never enter it in this page or chat. See README for the exact setup.</div><div class="grid"><div class="card"><h3>What actually runs');
writeFileSync(p,s);
p='../worker/agent.js';s=readFileSync(p,'utf8');
s=s.replace("if(!env.OPENAI_API_KEY||env.SPROUT_MODE==='curated'){", "if(!env.OPENAI_API_KEY?.trim()||env.SPROUT_MODE==='curated'||time<(session.fallbackUntil||0)){");
s=s.replace("session.activity=['riddle','math'].includes(body.code)?body.code:'';", "session.activity=body.activity||'';");
s=s.replace("reason:'Live AI is not configured'", "reason:time<(session.fallbackUntil||0)?'Live AI temporarily unavailable':env.SPROUT_MODE==='curated'?'Demo mode selected':'Live AI is not configured'");
s=s.replace("if(reset){session.history=[];session.activity='';", "if(reset){session.history=[];session.activity='';session.fallbackUntil=0;");
s=s.replace("}catch{session.history=[];return {body:authored('The live AI garden is resting. This is an authored demo reply, not live AI. We can try a riddle: what gets wetter the more it dries?','service-fallback','Live AI unavailable'),cookie};}", "}catch{session.history=[];session.fallbackUntil=time+60000;session.activity='riddle';return {body:authored('Let’s try a little puzzle: what gets wetter the more it dries? You can ask for a hint.','service-fallback','Live AI temporarily unavailable'),cookie};}");
writeFileSync(p,s);
p='../worker/voice.js';s=readFileSync(p,'utf8');
s=s.replace('audio,onMessage,isBusy=()=>false}', "audio,onMessage,mode='curated',isBusy=()=>false}");
s=s.replace('suppressReply=false;', 'suppressReply=false,introduced=false,demoAnnounced=false;');
// Only replace the declaration above, not the reset in thinking().
s=s.replace('thinking(){stopAll();suppressReply=false,introduced=false,demoAnnounced=false;processing=true;', 'thinking(){stopAll();suppressReply=false;processing=true;');
s=s.replace("say('Hi! I am Sprout, a computer helper. This is the doll voice demo. Use Talk for a short question, or choose a story or puzzle.');", "if(!introduced){introduced=true;demoAnnounced=mode!=='live';say('Hi! I’m Sprout, a computer helper. '+(mode==='live'?'':'Live AI is off, so we’re using prewritten stories and puzzles for now. ')+'Say tell me a story, give me a riddle, or ask a question.');}else say('Voice is on. What shall we explore?');");
s=s.replace("last=(data.engine==='live-ai'?'Live AI reply. ':'Curated demo reply. ')+data.text;state('Reply ready.');if(!suppressReply)say(last);", "last=data.text;state('Reply ready.');if(!suppressReply){const announce=data.engine==='curated-v1'&&!demoAnnounced&&/unavailable|not configured|Demo mode/.test(data.reason||'');if(announce){demoAnnounced=true;say('Live AI is unavailable, so we’re using prewritten activities for now. '+last);}else say(last);}");
s=s.replace('<div class="eyebrow">Doll voice · laptop demo</div>', '<div class="eyebrow">Doll voice · laptop demo</div><p id="mode" class="mode-label" role="status">Checking conversation mode…</p>');
s=s.replace('Spoken replies identify live AI or curated demo.', 'The mode label identifies live AI or prewritten activities. Demo mode is announced once.');
s=s.replace('export const voiceStyles=`', 'export const voiceStyles=`.mode-label{display:inline-block;padding:6px 10px;border:1px solid #b6ca9f;border-radius:8px;background:#fffefa;font-weight:650}');
writeFileSync(p,s);
