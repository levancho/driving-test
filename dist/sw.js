const CACHE='nj-road-ready-v4';
const CORE=['./','./index.html','./style.css','./style.css?v=4','./app.js','./app.js?v=4','./engine.js','./states.js','./questions-ny.js','./manual-pages-ny.json','./questions.js','./questions-ka.js','./i18n.js','./manual-pages.json','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
const SIGNS=['two-way','sharp-turn','divided','winding','merge','hill','lane-reduction','crossroad','school','slippery','hospital','yield-ahead','signal-ahead','workers','flagger','no-uturn','bicycles','keep-right','railroad','crossbuck'].map(s=>'./signs/'+s+'.png');
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll([...CORE,...SIGNS])).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('nj-road-ready-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',e=>{if(e.data==='status')e.waitUntil(caches.open(CACHE).then(c=>c.match('./manual-pages.json')).then(r=>e.ports[0]?.postMessage({ready:!!r})));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).catch(()=>e.request.mode==='navigate'?caches.match('./index.html'):Response.error())));});
