// No identifiers, answers, scores, or local progress leave this device.
const KEY='road-ready-analytics-disabled';
// Enable after activating Analytics Engine and deploying the USAGE binding.
export const USAGE_ENABLED=false;
export function analyticsOptedOut(){try{return localStorage.getItem(KEY)==='1';}catch{return true;}}
export function analyticsEnabled(){
 try{return globalThis.location?.hostname==='dmv.l3v.ai'&&navigator.onLine!==false&&navigator.doNotTrack!=='1'&&!navigator.globalPrivacyControl&&localStorage.getItem(KEY)!=='1';}catch{return false;}
}
export function toggleAnalytics(){
 try{localStorage.setItem(KEY,localStorage.getItem(KEY)==='1'?'0':'1');globalThis.location?.reload();}catch{}
}
export function track(event,details={}){
 if(!USAGE_ENABLED||!analyticsEnabled())return;
 const payload={event,state:details.state,language:details.language,mode:details.mode||'',topic:details.topic||'',target:details.target||''};
 try{void fetch('/api/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),credentials:'omit',referrerPolicy:'no-referrer',keepalive:true}).catch(()=>{});}catch{}
}
export function initAnalytics(details){
 if(!analyticsEnabled())return;
 if(!document.querySelector('script[src*="cloudflareinsights.com"]')){
  const script=document.createElement('script');script.defer=true;script.src='https://static.cloudflareinsights.com/beacon.min.js';script.dataset.cfBeacon=JSON.stringify({token:'173fd0478c44424c8bf2210e2b0607b5'});document.head.append(script);
 }
 track('app_open',details);
}
