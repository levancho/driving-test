import {states} from './dist/states.js';
const events=new Set(['app_open','test_start','test_complete','state_change','language_change','link_click']);
const targets=new Set(['','coffee','l3v','tools','echora']);
const modes=new Set(['','quick','exam','topic','mistakes']);
const reply=status=>new Response(null,{status,headers:{'Cache-Control':'no-store'}});
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname!=='/api/event')return env.ASSETS.fetch(request);
  if(request.method!=='POST')return reply(405);
  if(!env.USAGE)return reply(503);
  if(request.headers.get('Origin')!=='https://dmv.l3v.ai')return reply(403);
  if(request.headers.get('DNT')==='1'||request.headers.get('Sec-GPC')==='1')return reply(204);
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return reply(415);
  // IP is used transiently for abuse limiting, never written to the analytics dataset.
  const limited=await env.EVENT_LIMITER.limit({key:request.headers.get('CF-Connecting-IP')||'unknown'});
  if(!limited.success)return reply(429);
  if(Number(request.headers.get('Content-Length'))>1024)return reply(413);
  let data;
  try{
   const reader=request.body?.getReader();if(!reader)return reply(400);
   let length=0;const chunks=[];
   while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>1024){await reader.cancel();return reply(413);}chunks.push(value);}
   const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
   data=JSON.parse(new TextDecoder().decode(bytes));
  }catch{return reply(400);}
  if(!data||Array.isArray(data)||Object.keys(data).some(k=>!['event','state','language','mode','topic','target'].includes(k)))return reply(400);
  const {event,state,language,mode='',topic='',target=''}=data;
  if(!events.has(event)||!Object.hasOwn(states,state)||!['en','ka'].includes(language)||!modes.has(mode)||!targets.has(target)||!(topic===''||states[state].topics.includes(topic)))return reply(400);
  if((event==='test_start'||event==='test_complete')&&!mode)return reply(400);
  if(event==='link_click'&&!target)return reply(400);
  const ua=request.headers.get('User-Agent')||'';
  const device=/Mobile|Android|iPhone|iPad/i.test(ua)?'mobile':'desktop';
  const country=/^[A-Z]{2}$/.test(request.cf?.country||'')?request.cf.country:'unknown';
  try{env.USAGE.writeDataPoint({blobs:[event,state,language,mode,topic,target,country,device],doubles:[1],indexes:['dmv']});}catch{return reply(503);}
  return reply(204);
 }
};
