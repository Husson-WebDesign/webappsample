/* Public allowlist only. Change VERSION for an intentional release. */
const PREFIX="wdapp-edu.example.workshoppocket-McBride_P5_Northern_Bloom_main_-"+encodeURIComponent(self.registration.scope)+'-';
const VERSION='v1';
const CACHE=PREFIX+VERSION;
const FILES=[
  "./wdapp-offline.html",
  "./wdapp.webmanifest",
  "./wdapp-icons/192.png",
  "./wdapp-icons/512.png",
  "./wdapp-register.js",
  "./about.html",
  "./contact.html",
  "./css/style.css",
  "./images/York-Flowers.png",
  "./index.html",
  "./js/script.js",
  "./services.html"
];
const ROOT=self.registration.scope;
const ALLOWED=new Set(FILES.map(p=>new URL(p,ROOT).href));
const FALLBACK=new URL('./wdapp-offline.html',ROOT).href;
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(path=>new Request(new URL(path,ROOT),{cache:'reload'}))))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k))))));
/* No automatic skipWaiting or clients.claim: close old tabs, then reopen to test activation. */
self.addEventListener('fetch',event=>{
 const r=event.request,url=new URL(r.url);
 if(r.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(ROOT))return;
 if(r.mode==='navigate'){
  event.respondWith(fetch(r).catch(async()=>{const cache=await caches.open(CACHE);const page=ALLOWED.has(r.url)?await cache.match(r):null;if(page)return page;const fallback=await cache.match(FALLBACK);if(fallback)return new Response((await fallback.text()).replace('href="./index.html"','href="'+new URL('index.html',ROOT).href+'"'),{headers:{'Content-Type':'text/html; charset=utf-8'}});return new Response('Offline: reconnect to continue',{status:503,headers:{'Content-Type':'text/plain'}});}));
  return;
 }
 if(ALLOWED.has(r.url))event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(r))||fetch(r)));
});
