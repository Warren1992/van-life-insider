'use strict';

const cachePrefix = 'van-life-insider-shell-';
const cacheName = cachePrefix + 'v1';
const offlineUrl = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName)
      .then((cache) => cache.add(offlineUrl))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names
        .filter((name) => name.startsWith(cachePrefix) && name !== cacheName)
        .map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.mode !== 'navigate' || request.method !== 'GET' ||
      new URL(request.url).origin !== self.location.origin) return;

  // Always prefer the live website. Never cache requests, personal data or posts.
  event.respondWith(fetch(request).catch(async () => {
    const cached = await caches.match(offlineUrl, { cacheName });
    return cached || new Response('Van Life Insider needs an internet connection.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }));
});
