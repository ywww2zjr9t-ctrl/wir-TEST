const CACHE='wir-player-0048-shell';
const ASSETS=['./index.html','./style.css?v=0048','./app.js?v=0048','./version.json','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
const PLAYLIST_CACHE='wir-playlist-offline-v1';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(key=>key.startsWith('wir-player-')&&key!==CACHE).map(key=>caches.delete(key)));
 await self.clients.claim();
})())});
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;
 const url=new URL(req.url);if(url.origin!==location.origin)return;
 // Offline-Audiodateien werden separat durch app.js gespeichert; niemals hier löschen.
 if(/\.(mp3|m4a|m4b)$/i.test(url.pathname))return;
 if(url.pathname.endsWith('/playlist.json')){
  event.respondWith(fetch(req).then(async response=>{
   if(response.ok){const cache=await caches.open(PLAYLIST_CACHE);await cache.put('./playlist.json',response.clone())}
   return response;
  }).catch(async()=>await (await caches.open(PLAYLIST_CACHE)).match('./playlist.json')||Response.error()));return;
 }
 // Versionsprüfung immer online, nie mit einer veralteten Antwort aus dem Cache.
 if(url.pathname.endsWith('/version.json')){
  event.respondWith(fetch(req,{cache:'no-store'}).catch(()=>caches.match('./version.json')));return;
 }
 // App-Shell online zuerst: Bei einem GitHub-Update keine alten Dateien ausliefern.
 if(req.mode==='navigate'||/\/(index\.html|app\.js|style\.css)$/.test(url.pathname)){
  event.respondWith(fetch(req,{cache:'no-store'}).then(response=>{
   if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req.mode==='navigate'?'./index.html':req,copy)))}
   return response;
  }).catch(async()=>await caches.match(req.mode==='navigate'?'./index.html':req)||Response.error()));return;
 }
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(response=>{
  if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)))}return response;
 })));
});
