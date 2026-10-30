// Run manually after configuring .env. Never prints credentials or response bodies.
import {existsSync} from 'node:fs';
if(existsSync(new URL('../.env',import.meta.url)))process.loadEnvFile(new URL('../.env',import.meta.url));
if(!process.env.OPENAI_API_KEY?.trim()||process.env.SPROUT_MODE==='curated'){
 console.error('Live AI is OFF. Set OPENAI_API_KEY in the project-root .env file and SPROUT_MODE=live. Keep your key private.');process.exitCode=1;
}else{
 const {createAgent}=await import('../worker/agent.js');
 const result=await createAgent().handle(new Request('http://localhost/'),{message:'Explain why rainbows form in two short sentences for a child.'});
 if(result.body.engine==='live-ai'){console.log('PASS: live input moderation, policy review, generation and output checks completed.');}
 else{console.error('Live AI check did not complete: '+result.body.reason+'. Check API billing, model access, internet and provider status. No unchecked output was displayed.');process.exitCode=1;}
}
