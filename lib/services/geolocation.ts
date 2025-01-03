export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
    } else {
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
    }
  })
}

export async function getAddressFromCoordinates(latitude: number, longitude: number): Promise<string> {
  try {
    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`)
    const data = await response.json()
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name
    }
    return 'Address not found'
  } catch (error) {
    console.error('Error fetching address:', error)
    return 'Error fetching address'
  }
}

