
export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      }
    )
  })
}

export async function getAddressFromCoordinates(latitude: number, longitude: number): Promise<string> {
  try {
    // Try to get from cache first
    const cacheKey = `address_${latitude}_${longitude}`
    const cachedAddress = localStorage.getItem(cacheKey)
    if (cachedAddress) {
      return cachedAddress
    }

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&types=place,locality,region,country`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch address')
    }

    const data = await response.json()
    
    // Extract relevant parts of the address
    const features = data.features || []
    const addressParts = features.map((f: any) => f.text).filter(Boolean)
    
    // Combine into a readable address
    const address = addressParts.join(', ')
    
    // Cache the result
    localStorage.setItem(cacheKey, address)
    
    // Also store in pending updates if offline
    if (!navigator.onLine) {
      const pendingUpdates = JSON.parse(localStorage.getItem('pendingAddressUpdates') || '[]')
      pendingUpdates.push({ latitude, longitude, timestamp: Date.now() })
      localStorage.setItem('pendingAddressUpdates', JSON.stringify(pendingUpdates))
    }

    return address || 'Address not available'
  } catch (error) {
    console.error('Error fetching address:', error)
    
    // If offline, try to get from cache
    if (!navigator.onLine) {
      const cacheKey = `address_${latitude}_${longitude}`
      const cachedAddress = localStorage.getItem(cacheKey)
      if (cachedAddress) {
        return cachedAddress
      }
    }
    
    // Store coordinates for later sync
    const pendingUpdates = JSON.parse(localStorage.getItem('pendingAddressUpdates') || '[]')
    pendingUpdates.push({ latitude, longitude, timestamp: Date.now() })
    localStorage.setItem('pendingAddressUpdates', JSON.stringify(pendingUpdates))
    
    // Return a fallback address format
    return `Area near ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`
  }
}

export async function syncPendingAddresses(): Promise<void> {
  if (!navigator.onLine) return

  const pendingUpdates = JSON.parse(localStorage.getItem('pendingAddressUpdates') || '[]')
  if (pendingUpdates.length === 0) return

  const updates = [...pendingUpdates]
  localStorage.setItem('pendingAddressUpdates', '[]')

  for (const update of updates) {
    try {
      const address = await getAddressFromCoordinates(update.latitude, update.longitude)
      const cacheKey = `address_${update.latitude}_${update.longitude}`
      localStorage.setItem(cacheKey, address)
      
      // Dispatch an event to notify components of the update
      window.dispatchEvent(new CustomEvent('addressUpdated', {
        detail: { latitude: update.latitude, longitude: update.longitude, address }
      }))
    } catch (error) {
      console.error('Error syncing address:', error)
      // Re-add to pending updates if failed
      const currentPending = JSON.parse(localStorage.getItem('pendingAddressUpdates') || '[]')
      currentPending.push(update)
      localStorage.setItem('pendingAddressUpdates', JSON.stringify(currentPending))
    }
  }
}

// Add online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncPendingAddresses()
  })
}
