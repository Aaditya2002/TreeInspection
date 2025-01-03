export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      
      // Check if there's a waiting worker and notify the user
      if (registration.waiting) {
        notifyUpdateReady(registration)
      }

      // Detect controller change and reload
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            notifyUpdateReady(registration)
          }
        })
      })

      return registration
    } catch (error) {
      console.error('Service worker registration failed:', error)
    }
  }
}

function notifyUpdateReady(registration: ServiceWorkerRegistration) {
  // You can integrate this with your UI notification system
  const updateApp = confirm('New version available! Update now?')
  if (updateApp && registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }
}

