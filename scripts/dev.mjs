import http from 'node:http';
import { existsSync } from 'node:fs';
import {readFile} from 'node:fs/promises';
const sampleFiles=new Map(['fox','space','dragon'].map(name=>['/samples/'+name+'-story.wav',new URL('../.openai/'+name+'-story.wav',import.meta.url)]));
if(existsSync(new URL('../.env',import.meta.url)))process.loadEnvFile(new URL('../.env',import.meta.url));
const {default:worker}=await import('../worker/index.js');
const port=Number(process.env.PORT||3000);
const origin='http://127.0.0.1:'+port;
const server=http.createServer(async(req,res)=>{
 try{
 if(req.headers.host!=='127.0.0.1:'+port&&req.headers.host!=='localhost:'+port){res.writeHead(403);res.end('Host denied');return;}
 const sample=sampleFiles.get(new URL(req.url,origin).pathname);
 if(sample){
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  if(req.headers['sec-fetch-site']==='cross-site'||(req.headers.origin&&req.headers.origin!=='http://'+req.headers.host)){res.writeHead(403);res.end();return;}
  try{const wav=await readFile(sample);res.writeHead(200,{'Content-Type':'audio/wav','Content-Length':wav.length,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY'});res.end(req.method==='HEAD'?undefined:wav);}catch{res.writeHead(404);res.end('Story sample is not available.');}return;
 }
 const chunks=[];let size=0;for await(const c of req){size+=c.length;if(size>4096){res.writeHead(413);res.end('Request too large');return;}chunks.push(c);}
 const headers={...req.headers,'CF-Connecting-IP':req.socket.remoteAddress};
 const request=new Request('http://'+req.headers.host+req.url,{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
 const response=await worker.fetch(request);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(500);res.end('The garden is resting. Please try again.');}
});
server.requestTimeout=15000;server.headersTimeout=10000;server.timeout=45000;
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'Port '+port+' is already in use. Open the running demo or stop its server before restarting.':'Could not start the local demo. Check the port and permissions.');process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>{console.log('Sprout local demo: '+origin);console.log(process.env.OPENAI_API_KEY?.trim()&&process.env.SPROUT_MODE!=='curated'?'Live AI configured. Run node scripts/check-live.mjs to verify provider access.':'CURATED DEMO: Live AI is off. Set OPENAI_API_KEY in .env and SPROUT_MODE=live, then restart.');});
