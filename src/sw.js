/* Luparo Calc · service worker: deixa o app abrir sem internet */
const V='luparo-calc-__V__';
const CORE=['/','/index.html','/manifest.webmanifest','/icon-192.png','/icon-512.png','/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k.startsWith('luparo-calc-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
function pagina(req){return new Promise(res=>{let ok=false;const fim=r=>{if(!ok&&r){ok=true;res(r)}};
 const t=setTimeout(()=>caches.match('/index.html').then(fim),4000);
 fetch(req).then(r=>{clearTimeout(t);if(r.ok){const cp=r.clone();caches.open(V).then(c=>c.put('/index.html',cp))}fim(r)})
  .catch(()=>{clearTimeout(t);caches.match('/index.html').then(m=>{if(!ok){ok=true;res(m||Response.error())}})})})}
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(u.hostname.endsWith('supabase.co'))return;
 if(r.mode==='navigate'||(u.origin===location.origin&&(u.pathname==='/'||u.pathname==='/index.html'))){e.respondWith(pagina(r));return}
 if(u.origin===location.origin||u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
  e.respondWith(caches.match(r).then(m=>{const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>m);return m||net}))}
});
