const C='hsk-v3-1';
const META='hsk-meta';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C&&k!==META).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin||u.pathname.endsWith('/__meta'))return;
 const media=/\.(mp3|webp|png)$/.test(u.pathname);
 e.respondWith(media?caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok){const c=res.clone();caches.open(C).then(x=>x.put(e.request,c))}return res}))
  :fetch(e.request).then(res=>{if(res.ok){const c=res.clone();caches.open(C).then(x=>x.put(e.request,c))}return res}).catch(()=>caches.match(e.request)));});

/* ---- nhắc học: trang lưu trạng thái vào cache META, SW kiểm tra định kỳ ---- */
const dk=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
async function readMeta(){try{const c=await caches.open(META);const r=await c.match('/__meta');return r?await r.json():null}catch(e){return null}}
async function writeMeta(m){const c=await caches.open(META);await c.put('/__meta',new Response(JSON.stringify(m),{headers:{'content-type':'application/json'}}))}
async function remindCheck(){const m=await readMeta();if(!m||!m.on)return;const now=new Date(),today=dk(now);
  const [h,mi]=(m.time||'20:00').split(':').map(Number);if(now.getHours()*60+now.getMinutes()<h*60+mi)return;
  if(m.lastStudy===today||m.lastNotified===today)return;
  const cl=await self.clients.matchAll({type:'window'});if(cl.some(c=>c.visibilityState==='visible'))return;
  m.lastNotified=today;await writeMeta(m);
  await self.registration.showNotification('学中文 · Đến giờ học rồi! 🐼',{body:m.streak>0?`Giữ chuỗi ${m.streak} ngày nhé — chỉ cần 5 phút ôn thẻ nhớ.`:'Hôm nay bạn chưa học. Vào ôn vài từ mới nào!',icon:'icon-192.png',badge:'icon-192.png',tag:'study-reminder',data:{url:'./#home'}})}
self.addEventListener('periodicsync',e=>{if(e.tag==='study-reminder')e.waitUntil(remindCheck())});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='remind-check')e.waitUntil(remindCheck())});
self.addEventListener('notificationclick',e=>{e.notification.close();const url=(e.notification.data&&e.notification.data.url)||'./';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cl=>{for(const c of cl){if('focus' in c){c.navigate&&c.navigate(url).catch(()=>{});return c.focus()}}return self.clients.openWindow(url)}))});
