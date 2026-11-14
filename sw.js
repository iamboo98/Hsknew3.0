const C='hsk-v2-5';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
 const media=/\.(mp3|webp|png)$/.test(u.pathname);
 e.respondWith(media?caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok){const c=res.clone();caches.open(C).then(x=>x.put(e.request,c))}return res}))
  :fetch(e.request).then(res=>{if(res.ok){const c=res.clone();caches.open(C).then(x=>x.put(e.request,c))}return res}).catch(()=>caches.match(e.request)));});
