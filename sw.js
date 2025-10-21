/*
 * ------------------------------------------------------------------
 * Service Worker: sw.js
 * ------------------------------------------------------------------
 */
const CACHE_NAME = 'library-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/script.js', // يجب أن يكون script.js
  '/data/books.json',
  'https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
  // يمكنك إضافة مسارات لأغلفة الكتب الأكثر شيوعاً هنا لاحقاً
];

// تثبيت ملف الخدمة (Install)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// اعتراض الطلبات وعرضها من الذاكرة المؤقتة (Fetch)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا وجد استجابة في الذاكرة المؤقتة، اعرضها
        if (response) {
          return response;
        }
        // وإلا، قم بطلبها من الشبكة
        return fetch(event.request);
      })
  );
});

// تحديث ملفات الخدمة القديمة (Activate)
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName); // حذف الكاش القديم
          }
        })
      );
    })
  );
});
