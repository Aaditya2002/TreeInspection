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
  const accessToken = "pk.eyJ1IjoiYWRpdHlhMTcwMzIwMDIiLCJhIjoiY201NTk0eGE1MmhsYzJtcHpwZHkxYzI1YSJ9.-crvgtTpoASRfBDF9PvHGA"; // Hardcoded API key
  try {
    // Try to get from cache first
    const cacheKey = `address_${latitude}_${longitude}`
    const cachedAddress = localStorage.getItem(cacheKey)
    if (cachedAddress) {
      const parsedCache = JSON.parse(cachedAddress)
      // Check if cache is still valid (24 hours)
      if (parsedCache.timestamp > Date.now() - 24 * 60 * 60 * 1000) {
        return parsedCache.address
      }
    }

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}&types=place,locality,region,country`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch address')
    }

    const data = await response.json()
    
    // Extract place, region (state), and country
    const features = data.features || []
    const place = features.find((f: any) => f.place_type.includes('place'))?.text
    const region = features.find((f: any) => f.place_type.includes('region'))?.text
    const country = features.find((f: any) => f.place_type.includes('country'))?.text
    
    // Combine into a readable address
    const addressParts = [place, region, country].filter(Boolean)
    const address = addressParts.join(', ')
    
    // Cache the result with timestamp
    const cacheData = {
      address,
      timestamp: Date.now()
    }
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    
    // Store in pending updates if offline
    if (!navigator.onLine) {
      const pendingUpdates = JSON.parse(localStorage.getItem('pendingAddressUpdates') || '[]')
      pendingUpdates.push({ 
        latitude, 
        longitude, 
        timestamp: Date.now(),
        status: 'pending'
      })
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
        const parsedCache = JSON.parse(cachedAddress)
        return parsedCache.address
      }
    }
    
    // Store coordinates for later sync
    const pendingUpdates = JSON.parse(localStorage.getItem('pendingAddressUpdates') || '[]')
    pendingUpdates.push({ 
      latitude, 
      longitude, 
      timestamp: Date.now(),
      status: 'failed'
    })
    localStorage.setItem('pendingAddressUpdates', JSON.stringify(pendingUpdates))
    
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
      localStorage.setItem(cacheKey, JSON.stringify({
        address,
        timestamp: Date.now()
      }))
      
      // Dispatch an event to notify components of the update
      window.dispatchEvent(new CustomEvent('addressUpdated', {
        detail: { 
          latitude: update.latitude, 
          longitude: update.longitude, 
          address,
          status: 'synced'
        }
      }))
    } catch (error) {
      console.error('Error syncing address:', error)
      // Re-add to pending updates if failed
      const currentPending = JSON.parse(localStorage.getItem('pendingAddressUpdates') || '[]')
      currentPending.push({
        ...update,
        status: 'failed',
        lastAttempt: Date.now()
      })
      localStorage.setItem('pendingAddressUpdates', JSON.stringify(currentPending))
    }
  }
}

// Add online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', syncPendingAddresses)
}

