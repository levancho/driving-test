import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker.js';
const event={event:'test_start',state:'nj',language:'en',mode:'quick',topic:'',target:''};
const request=(data=event,headers={},method='POST')=>new Request('https://dmv.l3v.ai/api/event',{method,headers:{Origin:'https://dmv.l3v.ai','Content-Type':'application/json',...headers},...(method==='POST'?{body:typeof data==='string'?data:JSON.stringify(data)}:{})});
test('Collector writes only approved dimensions, never IP, answers, or raw user agent',async()=>{
 const points=[];const env={EVENT_LIMITER:{limit:async()=>({success:true})},USAGE:{writeDataPoint:p=>points.push(p)}};
 assert.equal((await worker.fetch(request(event,{'CF-Connecting-IP':'192.0.2.1','User-Agent':'iPhone private'}),env)).status,204);
 assert.deepEqual(points[0],{blobs:['test_start','nj','en','quick','','','unknown','mobile'],doubles:[1],indexes:['dmv']});
 for(const body of [{...event,answer:2},{...event,state:'xx'},{...event,topic:'private text'},{...event,event:'unknown'},null,'invalid'])assert.equal((await worker.fetch(request(body),env)).status,400);
 assert.equal(points.length,1);
});
test('Collector rejects cross-origin, oversized, non-POST and rate-limited events',async()=>{
 const env={EVENT_LIMITER:{limit:async()=>({success:true})},USAGE:{writeDataPoint:()=>{throw Error('Must not write');}}};
 for(const [r,status] of [[request(event,{Origin:'https://evil.test'}),403],[request(event,{},'GET'),405],[request('x'.repeat(1025)),413],[request(event,{'Content-Type':'text/plain'}),415],[request(event,{DNT:'1'}),204],[request(event,{'Sec-GPC':'1'}),204]])assert.equal((await worker.fetch(r,env)).status,status);
 env.EVENT_LIMITER.limit=async()=>({success:false});assert.equal((await worker.fetch(request(),env)).status,429);
});
test('Static files still use the existing assets binding',async()=>{const r=await worker.fetch(new Request('https://dmv.l3v.ai/'),{ASSETS:{fetch:()=>new Response('app')}});assert.equal(await r.text(),'app');});
test('Browser tracking honors privacy signals and sends no additional properties',async()=>{
 const calls=[];const memory=new Map();globalThis.location={hostname:'dmv.l3v.ai'};Object.defineProperty(globalThis,'navigator',{value:{onLine:true},configurable:true});globalThis.localStorage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};globalThis.fetch=async(...args)=>{calls.push(args);};
 // Exercise the prepared collector client while production usage tracking is paused.
 const {readFile}=await import('node:fs/promises');
 const source=(await readFile(new URL('../dist/analytics.js',import.meta.url),'utf8')).replace('USAGE_ENABLED=false','USAGE_ENABLED=true');
 const {track,analyticsEnabled}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 track('test_start',{...event,answer:3,score:99});assert.equal(calls.length,1);assert.deepEqual(JSON.parse(calls[0][1].body),event);
 navigator.doNotTrack='1';track('app_open',event);assert.equal(analyticsEnabled(),false);
 navigator.doNotTrack='0';navigator.globalPrivacyControl=true;track('app_open',event);
 navigator.globalPrivacyControl=false;memory.set('road-ready-analytics-disabled','1');track('app_open',event);assert.equal(calls.length,1);
 memory.clear();globalThis.fetch=()=>Promise.reject(Error('offline'));track('app_open',event);await new Promise(r=>setTimeout(r,0));
});
