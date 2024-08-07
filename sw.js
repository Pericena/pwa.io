// Nombre del caché, utilizado para identificar y versionar el caché
const CACHE_NAME = 'v1_pwa_app_cache';

// Lista de URLs que se deben almacenar en caché para el uso offline
const urlsToCache = [
  'assets/images/logo/s2.png',
  'assets/images/.*',
];

// Evento de instalación del Service Worker
self.addEventListener("install", (e) => {
  e.waitUntil(
    // Abre el caché con el nombre especificado
    caches.open(CACHE_NAME)
      .then(cache => {
        // Añade todas las URLs especificadas al caché
        return cache.addAll(urlsToCache)
          .then(() => {
            // Obliga al Service Worker a tomar el control inmediato sin esperar
            self.skipWaiting();
          })
          .catch(console.log); // Manejo de errores
      })
  );
});

// Evento de activación del Service Worker
self.addEventListener('activate', e => {
  const cacheWhitelist = [CACHE_NAME]; // Lista blanca de cachés permitidos

  e.waitUntil(
    // Obtiene todos los nombres de los cachés existentes
    caches.keys()
      .then(cacheNames => {
        // Elimina los cachés que no están en la lista blanca
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      // Reclama el control de los clientes sin esperar a que recarguen la página
      .then(() => self.clients.claim())
  );
});

// Evento de interceptación de solicitudes de red
self.addEventListener('fetch', e => {
  e.respondWith(
    // Busca la solicitud en el caché
    caches.match(e.request)
      .then(res => {
        // Devuelve la respuesta en caché si está disponible
        if (res) {
          return res;
        }
        // Realiza la solicitud de red si no está en caché
        return fetch(e.request)
          .then(response => {
            // Verifica si la respuesta es válida antes de almacenarla en caché
            if (!response || response.status !== 200 || response.type !== 'basic') {
              // Enviar mensaje a todos los clientes si hay un error en la solicitud de recursos
              self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                  client.postMessage('Falló algo al solicitar recursos: ' + e.request.url);
                });
              });
              return response;
            }
            // Clona la respuesta antes de almacenarla en caché
            const responseToCache = response.clone();
            // Abre el caché y almacena la respuesta
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(e.request, responseToCache);
              });
            return response;
          });
      })
      // Manejo de errores en la solicitud de recursos
      .catch(err => {
        console.log('Falló algo al solicitar recursos:', err);
        // Enviar mensaje a todos los clientes si hay un error en la solicitud de recursos
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage('Falló algo al solicitar recursos');
          });
        });
      })
  );
});

// Evento de mensaje del Service Worker
self.addEventListener('message', event => {
  if (event.data === 'Falló algo al solicitar recursos') {
    // Mostrar ventana o notificación de error al usuario
    // ... tu código aquí ...
  }
});
