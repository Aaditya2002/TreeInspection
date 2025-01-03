'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Button } from '../../components/ui/button'
import { Plus } from 'lucide-react'
import { InspectionSheet } from './components/inspection-sheet'
import { NewInspectionDialog } from './components/new-inspection-dialog'
import type { Inspection } from '../../lib/types'
import { getAllInspections, saveInspection } from '../../lib/db'
import { useNotificationStore } from '../../lib/stores/notification-store'

mapboxgl.accessToken = 'pk.eyJ1IjoiYWRpdHlhMTcwMzIwMDIiLCJhIjoiY201NTk0eGE1MmhsYzJtcHpwZHkxYzI1YSJ9.-crvgtTpoASRfBDF9PvHGA'

export default function InspectionMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null)
  const [isNewInspectionOpen, setIsNewInspectionOpen] = useState(false)
  const [currentLocation, setCurrentLocation] = useState({ longitude: -73.935242, latitude: 40.730610 })
  const { addNotification } = useNotificationStore()

  useEffect(() => {
    if (!mapContainer.current || !mapboxgl.accessToken) return

    const initializeMap = async () => {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [currentLocation.longitude, currentLocation.latitude],
        zoom: 13
      })

      await map.current.once('load')
    }

    initializeMap()

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = { longitude: position.coords.longitude, latitude: position.coords.latitude }
        setCurrentLocation(newLocation)
        map.current?.flyTo({ center: [newLocation.longitude, newLocation.latitude] })
      },
      (error) => {
        console.error('Error getting location:', error)
      }
    )

    loadInspections()

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [])

  const loadInspections = async () => {
    try {
      const loadedInspections = await getAllInspections()
      setInspections(loadedInspections)

      // Load offline inspections
      const offlineInspections = JSON.parse(localStorage.getItem('pendingInspections') || '[]')
      setInspections(prev => [...prev, ...offlineInspections.map(item => item.inspection)])
    } catch (error) {
      console.error('Error loading inspections:', error)
    }
  }

  useEffect(() => {
    if (!map.current) return

    const markers = document.getElementsByClassName('marker')
    while(markers[0]) {
      markers[0].parentNode?.removeChild(markers[0])
    }

    inspections.forEach(inspection => {
      const el = document.createElement('div')
      el.className = 'marker'
      el.style.width = '24px'
      el.style.height = '24px'
      el.style.borderRadius = '50%'
      el.style.backgroundColor = inspection.synced ? '#9333EA' : '#FFA500'
      el.style.cursor = 'pointer'
      el.style.border = '3px solid white'
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'

      new mapboxgl.Marker(el)
        .setLngLat([inspection.location.longitude, inspection.location.latitude])
        .addTo(map.current!)

      el.addEventListener('click', () => {
        setSelectedInspection(inspection)
      })
    })
  }, [inspections])

  const handleNewInspection = async (newInspection: Omit<Inspection, "id">, images: File[]) => {
    const inspectionWithId: Inspection = {
      ...newInspection,
      id: Date.now().toString(),
    }
    try {
      await saveInspection(inspectionWithId, images)
      setInspections(prev => [...prev, inspectionWithId])
      if (map.current) {
        map.current.flyTo({
          center: [inspectionWithId.location.longitude, inspectionWithId.location.latitude],
          zoom: 15
        })
      }
      addNotification({
        type: 'success',
        title: 'Inspection Created',
        message: 'New inspection has been created and synced successfully.',
      })
    } catch (error) {
      console.error('Error saving inspection:', error)
      // Store locally if save fails (offline support)
      const storedInspections = JSON.parse(localStorage.getItem('pendingInspections') || '[]')
      storedInspections.push({ inspection: inspectionWithId, images })
      localStorage.setItem('pendingInspections', JSON.stringify(storedInspections))
      setInspections(prev => [...prev, inspectionWithId])
      addNotification({
        type: 'warning',
        title: 'Offline Mode',
        message: 'Inspection saved locally. It will be uploaded when online.',
      })
    }
  }

  return (
    <>
      <style jsx global>{`
        .mapboxgl-map {
          width: 100%;
          height: 100%;
        }
      `}</style>
      
      <div className="w-full h-[calc(100vh-4rem)]">
        <div className="relative w-full h-full">
          <div ref={mapContainer} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />
          
          <div className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm border-b shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
              <h1 className="text-xl font-semibold">Map View</h1>
              <Button 
                onClick={() => setIsNewInspectionOpen(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Inspection
              </Button>
            </div>
          </div>

          <InspectionSheet
            inspection={selectedInspection}
            onClose={() => setSelectedInspection(null)}
          />

          <NewInspectionDialog
            open={isNewInspectionOpen}
            onOpenChange={setIsNewInspectionOpen}
            onSave={handleNewInspection}
          />
        </div>
      </div>
    </>
  )
}

