// Verifica si el navegador soporta Service Workers
if ('serviceWorker' in navigator) {
  // Intenta registrar el archivo 'sw.js' como Service Worker
  navigator.serviceWorker.register('sw.js')
    .then(reg => 
      // Si el registro es exitoso, imprime un mensaje en la consola con los detalles del registro
      console.log('Registro de SW exitoso', reg)
    )
    .catch(err => 
      // Si ocurre un error durante el registro, imprime una advertencia en la consola con los detalles del error
      console.warn('Error al tratar de registrar el sw', err)
    );
}
