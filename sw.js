/* Fênix | Leitura — service worker (offline). Versão do cache acompanha a versão do app. */
const C = "fenix-leitura-v1.0";
const A = ["./", "index.html", "manifest.json"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(A)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      if (res && res.ok && new URL(e.request.url).origin === location.origin) {
        const cp = res.clone();
        caches.open(C).then(c => c.put(e.request, cp));
      }
      return res;
    }).catch(() => caches.match("index.html")))
  );
});
