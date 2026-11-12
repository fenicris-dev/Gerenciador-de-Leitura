/* Fênix | Leitura v1.2 — service worker (offline). O cache acompanha a versão do app. */
const C = "fenix-leitura-v1.2";
const A = ["./", "index.html", "manifest.json"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => Promise.all(A.map(u => c.add(new Request(u, { cache: "reload" }))))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C && x.indexOf("fenix-leitura-") === 0).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  /* só o que é deste endereço: o core, o Firebase e as consultas seguem direto pela rede */
  if (new URL(r.url).origin !== self.location.origin) return;
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then(res => {
      if (res && res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put("index.html", cp)); }
      return res;
    }).catch(() => caches.match("index.html").then(x => x || caches.match("./"))));
    return;
  }
  e.respondWith(caches.match(r).then(x => x || fetch(r).then(res => {
    if (res && res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); }
    return res;
  })));
});
