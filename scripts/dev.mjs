import http from 'node:http';
import { existsSync } from 'node:fs';
if(existsSync(new URL('../.env',import.meta.url)))process.loadEnvFile(new URL('../.env',import.meta.url));
const {default:worker}=await import('../worker/index.js');
const port=Number(process.env.PORT||3000);
const origin='http://127.0.0.1:'+port;
const server=http.createServer(async(req,res)=>{
 try{
 if(req.headers.host!=='127.0.0.1:'+port&&req.headers.host!=='localhost:'+port){res.writeHead(403);res.end('Host denied');return;}
 const chunks=[];let size=0;for await(const c of req){size+=c.length;if(size>4096){res.writeHead(413);res.end('Request too large');return;}chunks.push(c);}
 const headers={...req.headers,'CF-Connecting-IP':req.socket.remoteAddress};
 const request=new Request('http://'+req.headers.host+req.url,{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
 const response=await worker.fetch(request);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(500);res.end('The garden is resting. Please try again.');}
});
server.requestTimeout=15000;server.headersTimeout=10000;server.timeout=45000;
server.listen(port,'127.0.0.1',()=>console.log('Sprout local demo: '+origin+' (mode is labeled on each reply)'));
