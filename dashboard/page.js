// Parent dashboard single page. Plain DOM + textContent only (transcripts are untrusted text).
export function pageHtml(nonce) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#3b2f63">
<title>Teddy Parent Dashboard</title>
<style nonce="${nonce}">${CSS}</style></head>
<body>
<div class="sticky">
<header class="top">
  <div class="brand"><span aria-hidden="true">🧸</span> Teddy <small>Parent</small></div>
  <div class="who"><span id="who"></span><button id="logout" class="link" hidden>Sign out</button></div>
</header>
<nav class="tabs" id="tabs" hidden>
  <a href="#/alerts" id="tab-alerts">Alerts <span id="alert-count" class="count"></span></a>
  <a href="#/conversations" id="tab-convs">Conversations</a>
</nav>
</div>
<div class="banner" role="note"><strong>SYNTHETIC DEMO DATA</strong> · fictional conversations</div>
<main id="app" tabindex="-1"></main>
<div id="toast" class="toast" role="status" aria-live="polite" hidden></div>
<script nonce="${nonce}">${JS}</script>
</body></html>`;
}

const CSS = `
:root{--bg:#f6f5fb;--card:#fff;--ink:#1d1b26;--muted:#5d5a6b;--line:#e3e0ee;--brand:#3b2f63;
--child:#fff3e0;--child-line:#f0b264;--teddy:#eaf1ff;--teddy-line:#8fb0ec;
--urgent:#b42318;--urgent-bg:#fee4e2;--important:#93370d;--important-bg:#fef0c7;--obs:#1849a9;--obs-bg:#e0eaff;--ok:#067647;--ok-bg:#dcfae6}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;font:16px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:var(--bg);color:var(--ink);overflow-x:hidden}
button,input,select{font:inherit}
.sticky{position:sticky;top:0;z-index:5}
.top{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 16px;background:var(--brand);color:#fff}
.brand{font-weight:700;font-size:1.1rem}.brand small{font-weight:400;opacity:.8}
.who{display:flex;align-items:center;gap:8px;font-size:.85rem;min-width:0}.who span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.link{background:none;border:0;color:inherit;text-decoration:underline;min-height:44px;padding:0 4px;cursor:pointer}
.banner{background:#fff8db;border-bottom:1px solid #f0d77a;padding:6px 16px;font-size:.8rem}
.tabs{display:flex;background:var(--card);border-bottom:1px solid var(--line)}
.tabs a{flex:1;text-align:center;padding:12px 4px;min-height:48px;color:var(--muted);text-decoration:none;font-weight:600;border-bottom:3px solid transparent}
.tabs a.on{color:var(--brand);border-color:var(--brand)}
.count{display:inline-block;min-width:1.5em;padding:0 6px;border-radius:999px;background:var(--urgent);color:#fff;font-size:.8rem}
.count:empty{display:none}
main{max-width:720px;margin:0 auto;padding:12px 16px 120px}
main:focus{outline:none}
h1{font-size:1.25rem;margin:8px 0}h2{font-size:1rem;margin:18px 0 8px;color:var(--muted)}
.card{display:block;width:100%;text-align:left;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px;margin:0 0 10px;color:inherit;text-decoration:none;cursor:pointer}
.card:focus-visible,.btn:focus-visible,.tabs a:focus-visible{outline:3px solid #7f56d9;outline-offset:2px}
.card.reviewed{opacity:.7}
.row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.meta{color:var(--muted);font-size:.85rem}
.reason{margin:6px 0 2px;font-weight:600;overflow-wrap:anywhere}
.badge{display:inline-block;border-radius:999px;padding:2px 10px;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.02em}
.p-urgent{background:var(--urgent-bg);color:var(--urgent)}.p-important{background:var(--important-bg);color:var(--important)}.p-observation{background:var(--obs-bg);color:var(--obs)}
.tag{display:inline-block;border:1px solid var(--line);border-radius:6px;padding:1px 8px;font-size:.78rem;color:var(--muted);background:#fff}
.tag.synthetic{border-color:#d9a400;color:#7a5b00;background:#fff8db}
.tag.done{border-color:#75e0a7;color:var(--ok);background:var(--ok-bg)}
.btn{min-height:44px;padding:10px 16px;border-radius:10px;border:1px solid var(--brand);background:var(--brand);color:#fff;font-weight:600;cursor:pointer}
.btn.secondary{background:#fff;color:var(--brand)}
.btn.small{min-height:40px;padding:6px 12px;font-size:.9rem}
.note{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--muted);border-radius:8px;padding:10px 12px;margin:8px 0;font-size:.9rem}
.note.warn{border-left-color:#d9a400;background:#fffbea}.note.ok{border-left-color:var(--ok)}
.back{display:inline-flex;align-items:center;min-height:44px;color:var(--brand);font-weight:600;text-decoration:none}
ol.transcript{list-style:none;margin:12px 0;padding:0}
.msg{margin:10px 0;display:flex;flex-direction:column;scroll-margin-top:130px;scroll-margin-bottom:140px}
.msg .who-label{font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin:0 4px 2px}
.bubble{max-width:88%;padding:10px 12px;border-radius:14px;border:1px solid;overflow-wrap:anywhere;white-space:pre-wrap}
.msg.child{align-items:flex-start}.msg.child .bubble{background:var(--child);border-color:var(--child-line);border-top-left-radius:4px}.msg.child .who-label{color:#8a4b00}
.msg.teddy{align-items:flex-end}.msg.teddy .bubble{background:var(--teddy);border-color:var(--teddy-line);border-top-right-radius:4px}.msg.teddy .who-label{color:#1849a9}
.msg.flag-urgent .bubble{border-left:6px solid var(--urgent)}.msg.flag-important .bubble{border-left:6px solid #dc6803}.msg.flag-observation .bubble{border-left:6px solid var(--obs)}
.msg time{font-size:.72rem;color:var(--muted);margin:2px 4px 0}
.msg.focus .bubble{outline:3px solid #7f56d9;outline-offset:3px;box-shadow:0 0 0 8px rgba(127,86,217,.15);animation:pulse 1.2s ease-out 2}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(127,86,217,.45)}100%{box-shadow:0 0 0 14px rgba(127,86,217,0)}}
@media (prefers-reduced-motion:reduce){.msg.focus .bubble{animation:none}}
.obs{max-width:88%;margin-top:6px;border-radius:10px;padding:8px 10px;font-size:.88rem;background:#fff;border:1px dashed var(--line)}
.obs .reason{font-size:.92rem}
.dock{position:fixed;left:0;right:0;bottom:0;z-index:6;background:var(--card);border-top:1px solid var(--line);box-shadow:0 -4px 16px rgba(0,0,0,.08);padding:10px 16px calc(10px + env(safe-area-inset-bottom))}
.dock .inner{max-width:720px;margin:0 auto;display:flex;gap:10px;align-items:center;justify-content:space-between}
.dock .txt{min-width:0;font-size:.9rem}.dock .txt .reason{margin:2px 0 0;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.dock .btn{flex:none}
form.login{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;display:grid;gap:12px;margin-top:12px}
form.login label{display:grid;gap:4px;font-weight:600}
form.login select,form.login input{min-height:44px;padding:8px 10px;border:1px solid #b8b4c8;border-radius:8px;background:#fff;width:100%}
.err{color:var(--urgent);min-height:1.2em}
.toast{position:fixed;left:16px;right:16px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:9;max-width:480px;margin:0 auto;background:#1d1b26;color:#fff;border-radius:12px;padding:12px 14px;display:flex;gap:10px;align-items:center;justify-content:space-between;box-shadow:0 8px 24px rgba(0,0,0,.25)}
.toast[hidden]{display:none}
.toast .btn{background:#fff;color:#1d1b26;border-color:#fff}
details{margin-top:20px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:4px 12px}
summary{min-height:44px;display:flex;align-items:center;cursor:pointer;font-weight:600}
.empty{color:var(--muted);padding:12px 0}
.chart{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:4px 12px 10px;margin-top:16px}
.chart h2{color:var(--ink);margin:10px 0 2px}
.wbars{list-style:none;margin:8px 0 0;padding:0}
.wbar{display:grid;grid-template-columns:minmax(0,6.5em) 1fr 2em;align-items:center;gap:8px;min-height:30px}
.wlabel{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.9rem}
.wtrack{display:block;height:12px;border-bottom:1px solid var(--line)}
.wfill{display:block;height:12px;background:#7f56d9;border-radius:0 4px 4px 0;min-width:4px}
.wcount{font-size:.9rem;font-variant-numeric:tabular-nums;color:var(--muted);text-align:right}
`;

const JS = `(()=>{
'use strict';
const app=document.getElementById('app');
const $=(tag,props={},...kids)=>{const n=document.createElement(tag);for(const[k,v]of Object.entries(props)){if(k==='class')n.className=v;else if(k==='text')n.textContent=v;else if(k.startsWith('on'))n.addEventListener(k.slice(2),v);else if(v!==false&&v!=null)n.setAttribute(k,v===true?'':v);}for(const k of kids.flat())if(k!=null&&k!==false)n.append(k);return n;};
const PRI={urgent:'Urgent',important:'Important',observation:'Observation'};
const TYPE={content:'Conversation content',speech:'Speech pattern'};
const SRC={'keyword-rules':'Teddy keyword safety rules','parent-review-rule':'Dashboard review rule',synthetic:'SYNTHETIC example','upstream-speech':'Speech component',unspecified:'Unspecified source'};
const fmt=iso=>{try{return new Date(iso).toLocaleString(undefined,{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});}catch{return iso;}};
const time=iso=>{try{return new Date(iso).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'});}catch{return '';}};
let me=null,seen=null,pollTimer=null;
async function api(path,opts={}){const r=await fetch('/parent/api/'+path,{credentials:'same-origin',...opts,headers:opts.body?{'Content-Type':'application/json'}:{}});
 if(r.status===401&&path!=='login'){me=null;showLogin();throw new Error('auth');}
 const d=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(d.error||'Request failed'),{status:r.status});return d;}
function setTab(name){document.getElementById('tab-alerts').classList.toggle('on',name==='alerts');document.getElementById('tab-convs').classList.toggle('on',name==='convs');}
function render(...nodes){app.replaceChildren(...nodes.flat(3).filter(n=>n!=null&&n!==false));window.scrollTo(0,0);document.querySelector('.dock')?.remove();}
const priBadge=p=>$('span',{class:'badge p-'+p,text:PRI[p]||p});
const srcTag=s=>$('span',{class:'tag'+(s==='synthetic'?' synthetic':''),text:SRC[s]||s});
function analysisNote(a,obsCount){
 const out=[];
 if(a.content==='complete')out.push($('div',{class:'note ok',text:obsCount?'Content check complete (Teddy keyword safety rules).':'Content check complete: no flags from Teddy keyword safety rules. Keyword rules can miss things, so this is not a guarantee.'}));
 else if(a.content==='pending')out.push($('div',{class:'note warn',text:'Content check PENDING: this conversation has not been checked yet. No alerts here does not mean no concerns.'}));
 else if(a.content==='failed')out.push($('div',{class:'note warn',text:'Content check FAILED: this conversation was not checked. No alerts here does not mean no concerns.'}));
 else out.push($('div',{class:'note warn',text:'Content check not run for this conversation.'}));
 if(a.speech==='synthetic')out.push($('div',{class:'note warn',text:'Speech-pattern notes here are SYNTHETIC examples. No speech-analysis component is connected yet.'}));
 else if(a.speech!=='complete')out.push($('div',{class:'note',text:'Speech-pattern analysis is not available for this conversation.'}));
 return out;}
function updateCount(alerts){const n=alerts.filter(a=>!a.reviewedAt).length;document.getElementById('alert-count').textContent=n?String(n):'';}

async function showAlerts(){
 setTab('alerts');const {alerts}=await api('alerts');updateCount(alerts);
 const open=alerts.filter(a=>!a.reviewedAt),done=alerts.filter(a=>a.reviewedAt);
 const card=a=>$('a',{class:'card'+(a.reviewedAt?' reviewed':''),href:'#/alert/'+encodeURIComponent(a.id),'data-alert':a.id},
  $('div',{class:'row'},priBadge(a.priority),$('span',{class:'tag',text:TYPE[a.type]}),srcTag(a.source),a.reviewedAt?$('span',{class:'tag done',text:'Reviewed'}):null),
  $('p',{class:'reason',text:a.reason}),
  $('div',{class:'meta',text:a.conversationTitle+' · '+fmt(a.at)}),
  $('div',{class:'meta',text:a.pushEligible?'Eligible for phone push (generic text only)':'In-app only (observations never trigger push)'}));
 render($('h1',{text:'Alerts'}),
  $('p',{class:'meta',text:'Items for an adult to review. They are prompts to read the conversation, not diagnoses.'}),
  $('h2',{text:'Needs review ('+open.length+')'}),open.length?open.map(card):$('p',{class:'empty',text:'Nothing waiting for review.'}),
  $('h2',{text:'Reviewed ('+done.length+')'}),done.length?done.map(card):$('p',{class:'empty',text:'None yet.'}),
  $('details',{},$('summary',{text:'About alerts and notifications in this demo'}),
   $('p',{text:'Priority levels: Observation (dashboard only), Important and Urgent (eligible for phone push). Phone push is NOT set up in this demo: it needs an HTTPS deployment and a push sender. New alerts show here and as an in-app message while the dashboard is open.'}),
   $('p',{text:'Any push would say only "New Teddy alert". It would never include what the child said or why it was flagged.'}),
   $('p',{text:'Reviewed state is kept in server memory and resets when the server restarts.'})));
}
async function showConversations(){
 setTab('convs');const {conversations}=await api('conversations');
 render($('h1',{text:'Conversations'}),conversations.length?conversations.map(c=>$('a',{class:'card',href:'#/c/'+encodeURIComponent(c.id),'data-conv':c.id},
  $('div',{class:'row'},c.topPriority?priBadge(c.topPriority):null,c.openAlerts?$('span',{class:'tag',text:c.openAlerts+' open alert'+(c.openAlerts>1?'s':'')}):null,
   c.analysis.content==='complete'?(c.openAlerts?null:$('span',{class:'tag done',text:'Checked · no open alerts'})):$('span',{class:'tag synthetic',text:'Check '+c.analysis.content})),
  $('p',{class:'reason',text:c.title}),
  $('div',{class:'meta',text:fmt(c.startedAt)+' · '+c.messageCount+' messages'+(c.source==='synthetic-fixture'?' · synthetic':c.source==='live-capture'?' · LIVE local capture':'')}))):$('p',{class:'empty',text:'No conversations yet.'}));
}
async function showConversation(convId,alertId){
 setTab('convs');let c;
 try{c=await api('conversations/'+encodeURIComponent(convId));}catch(e){if(e.status===404){render($('a',{class:'back',href:'#/conversations',text:'‹ Conversations'}),$('h1',{text:'Conversation not available'}),$('p',{text:'It may not exist or may belong to another account.'}));return;}throw e;}
 const focus=alertId?c.observations.find(o=>o.id===alertId):null;
 const obsBy=new Map();for(const o of c.observations){if(!obsBy.has(o.messageId))obsBy.set(o.messageId,[]);obsBy.get(o.messageId).push(o);}
 const reviewBtn=o=>$('button',{class:'btn small'+(o.reviewedAt?' secondary':''),'data-review':o.id,text:o.reviewedAt?'Reviewed ✓ (undo)':'Mark reviewed',onclick:async ev=>{ev.currentTarget.disabled=true;await api('alerts/'+encodeURIComponent(o.id)+'/review',{method:'POST',body:JSON.stringify({reviewed:!o.reviewedAt})});await showConversation(convId,alertId);refreshCount();}});
 const RANK=['observation','important','urgent'];
 const top=id=>(obsBy.get(id)||[]).reduce((p,o)=>RANK.indexOf(o.priority)>RANK.indexOf(p)?o.priority:p,'');
 const list=$('ol',{class:'transcript'},c.messages.map(m=>$('li',{class:'msg '+m.speaker+(top(m.id)?' flag-'+top(m.id):'')+(focus&&focus.messageId===m.id?' focus':''),id:'msg-'+m.id,'data-msg':m.id},
  $('span',{class:'who-label',text:(m.speaker==='child'?'🧒 Child':'🧸 Teddy')+(top(m.id)?' · ⚑ Flagged':'')}),
  $('div',{class:'bubble',text:m.text}),
  $('time',{datetime:m.at,text:time(m.at)}),
  (obsBy.get(m.id)||[]).map(o=>$('div',{class:'obs'},$('div',{class:'row'},priBadge(o.priority),$('span',{class:'tag',text:TYPE[o.type]}),srcTag(o.source)),
   $('p',{class:'reason',text:o.reason}),...(focus&&focus.id===o.id?[]:[o.detail?$('p',{class:'meta',text:o.detail}):null,reviewBtn(o)]))))));
 const words=c.childWords||[],max=Math.max(1,...words.map(w=>w.count));
 const chart=$('section',{class:'chart','aria-labelledby':'words-title'},$('h2',{id:'words-title',text:'Words used in this conversation'}),
  $('p',{class:'meta',text:'Child’s messages only · common filler words skipped'}),
  words.length?$('ol',{class:'wbars'},words.map(w=>$('li',{class:'wbar',title:w.word+': '+w.count+(w.count===1?' time':' times')},
   $('span',{class:'wlabel',text:w.word}),$('span',{class:'wtrack'},(()=>{const f=$('span',{class:'wfill'});f.style.width=Math.round(w.count/max*100)+'%';return f;})()),$('span',{class:'wcount',text:String(w.count)})))):$('p',{class:'empty',text:'No words to count yet.'}));
 render($('a',{class:'back',href:focus?'#/alerts':'#/conversations',text:focus?'‹ Alerts':'‹ Conversations'}),
  $('h1',{text:c.title}),$('p',{class:'meta',text:fmt(c.startedAt)+' · '+c.messages.length+' messages · full transcript in order'+(c.source==='synthetic-fixture'?' · SYNTHETIC':c.source==='live-capture'?' · LIVE local capture (memory only)':'')}),
  list,analysisNote(c.analysis,c.observations.length),chart);
 if(focus){
  document.body.append($('div',{class:'dock',role:'region','aria-label':'Selected alert'},$('div',{class:'inner'},
   $('div',{class:'txt'},$('div',{class:'row'},priBadge(focus.priority),$('span',{class:'tag',text:TYPE[focus.type]})),$('p',{class:'reason',text:focus.reason})),reviewBtn(focus))));
  const el=document.getElementById('msg-'+focus.messageId);
  // Jump (no smooth scroll) so the previous Teddy line, the flagged line and the next reply share the screen.
  requestAnimationFrame(()=>{(el.previousElementSibling||el).scrollIntoView({block:'start',behavior:'auto'});el.setAttribute('tabindex','-1');el.focus({preventScroll:true});});
 }else window.scrollTo(0,0);
}
async function openAlert(alertId){
 const {alerts}=await api('alerts');const a=alerts.find(x=>x.id===alertId);
 if(!a){render($('a',{class:'back',href:'#/alerts',text:'‹ Alerts'}),$('h1',{text:'Alert not available'}));return;}
 history.replaceState(null,'','#/c/'+encodeURIComponent(a.conversationId)+'/'+encodeURIComponent(a.id));
 await showConversation(a.conversationId,a.id);
}
async function refreshCount(){try{const {alerts}=await api('alerts');updateCount(alerts);return alerts;}catch{return null;}}
function toast(){const t=document.getElementById('toast');
 t.replaceChildren($('span',{text:'New Teddy alert'}),$('a',{class:'btn small',href:'#/alerts',text:'Open',onclick:()=>{t.hidden=true;}}));t.hidden=false;setTimeout(()=>{t.hidden=true;},10000);}
async function poll(){const alerts=await refreshCount();if(!alerts)return;
 const fresh=alerts.filter(a=>!a.reviewedAt&&a.pushEligible&&!seen.has(a.id));for(const a of alerts)seen.add(a.id);
 if(fresh.length)toast();}
function showLogin(){
 document.getElementById('tabs').hidden=true;document.getElementById('logout').hidden=true;document.getElementById('who').textContent='';clearInterval(pollTimer);
 const err=$('p',{class:'err',role:'alert'});const sel=$('select',{name:'parentId',id:'acct'});const pass=$('input',{name:'passcode',id:'pass',type:'password',inputmode:'numeric',autocomplete:'current-password',required:true});
 api('accounts').then(d=>sel.replaceChildren(...d.accounts.map(a=>$('option',{value:a.id,text:a.name})))).catch(()=>{});
 render($('h1',{text:'Parent sign-in'}),$('p',{class:'meta',text:location.hash.startsWith('#/alert/')?'Sign in to open this alert.':'Sign in to see your child’s Teddy conversations.'}),
  $('form',{class:'login',onsubmit:async ev=>{ev.preventDefault();err.textContent='';try{await api('login',{method:'POST',body:JSON.stringify({parentId:sel.value,passcode:pass.value})});await boot();}catch(e){err.textContent=e.message;}}},
   $('label',{},'Account',sel),$('label',{},'Passcode',pass),err,$('button',{class:'btn',type:'submit',id:'signin',text:'Sign in'})),
  $('div',{class:'note warn',text:'Demo sign-in only (not production authentication). Demo passcodes: Parent A = 1111, Parent B = 2222.'}));
}
async function route(){
 if(!me)return;
 const h=location.hash||'#/alerts';let m;
 try{
  if((m=h.match(/^#\\/alert\\/([^/]+)$/)))await openAlert(decodeURIComponent(m[1]));
  else if((m=h.match(/^#\\/c\\/([^/]+)(?:\\/([^/]+))?$/)))await showConversation(decodeURIComponent(m[1]),m[2]&&decodeURIComponent(m[2]));
  else if(h==='#/conversations')await showConversations();
  else await showAlerts();
 }catch(e){if(e.message!=='auth')render($('div',{class:'note warn',text:'Could not load: '+e.message}));}
}
async function boot(){
 try{me=await api('me');}catch{return;}
 document.getElementById('who').textContent=me.child;document.getElementById('logout').hidden=false;document.getElementById('tabs').hidden=false;
 const alerts=await refreshCount();seen=new Set((alerts||[]).map(a=>a.id));
 clearInterval(pollTimer);pollTimer=setInterval(poll,15000);
 await route();
}
document.getElementById('logout').addEventListener('click',async()=>{await api('logout',{method:'POST',body:'{}'}).catch(()=>{});me=null;location.hash='#/alerts';showLogin();});
addEventListener('hashchange',route);
api('me').then(()=>boot()).catch(()=>{});
})();`;
