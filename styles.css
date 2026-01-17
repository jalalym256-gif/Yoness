// ALFAJR Tailoring Service Worker
// Version: 6.0

const CACHE_NAME = 'alfajr-v6-cache';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// نصب Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching app shell...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('✅ App shell cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Cache installation failed:', error);
      })
  );
});

// فعال‌سازی و پاک‌سازی کش‌های قدیمی
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activated');
      return self.clients.claim();
    })
  );
});

// استراتژی Cache First با Fallback به Network
self.addEventListener('fetch', event => {
  // فقط GET requests را cache می‌کنیم
  if (event.request.method !== 'GET') return;
  
  // برای API requests، از network first استفاده می‌کنیم
  if (event.request.url.includes('/api/')) {
    event.respondWith(networkFirstStrategy(event));
    return;
  }
  
  // برای static assets، از cache first استفاده می‌کنیم
  event.respondWith(cacheFirstStrategy(event));
});

// استراتژی Cache First
async function cacheFirstStrategy(event) {
  const cachedResponse = await caches.match(event.request);
  
  if (cachedResponse) {
    // همزمان با بازگرداندن cache، نسخه جدید را fetch می‌کنیم
    event.waitUntil(updateCache(event));
    return cachedResponse;
  }
  
  // اگر در cache نبود، از network بگیر
  try {
    const networkResponse = await fetch(event.request);
    
    // اگر response معتبر بود، در cache ذخیره کن
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(event.request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // اگر آفلاین هستیم و صفحه اصلی خواستیم
    if (event.request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    
    throw error;
  }
}

// استراتژی Network First
async function networkFirstStrategy(event) {
  try {
    const networkResponse = await fetch(event.request);
    
    // اگر response معتبر بود، در cache ذخیره کن
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(event.request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // اگر network در دسترس نبود، از cache استفاده کن
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// بروزرسانی cache در پس‌زمینه
async function updateCache(event) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch(event.request);
    
    if (response && response.status === 200) {
      await cache.put(event.request, response);
    }
  } catch (error) {
    // خطا در بروزرسانی cache - بی‌خطر است
    console.log('Cache update failed:', error);
  }
}

// Background Sync برای داده‌های آفلاین
self.addEventListener('sync', event => {
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  console.log('🔄 Syncing offline data...');
  
  try {
    // اینجا می‌توانید منطق sync داده‌های آفلاین را اضافه کنید
    // مثلاً ارسال داده‌های ذخیره شده در IndexedDB به سرور
    
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        timestamp: new Date().toISOString()
      });
    });
    
    console.log('✅ Offline data synced');
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

// Push Notifications
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'اعلان جدید از ALFAJR',
    icon: '/assets/icon-192.png',
    badge: '/assets/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'مشاهده'
      },
      {
        action: 'close',
        title: 'بستن'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'ALFAJR', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Periodic Background Sync (اگر مرورگر پشتیبانی کند)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', event => {
    if (event.tag === 'periodic-data-sync') {
      event.waitUntil(syncDataPeriodically());
    }
  });
}

async function syncDataPeriodically() {
  console.log('🔄 Periodic sync started...');
  // منطق sync دوره‌ای
}