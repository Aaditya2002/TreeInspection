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

// Update Inspection type to include isLatest flag
interface InspectionWithLatest extends Inspection {
  isLatest?: boolean
}

mapboxgl.accessToken = 'pk.eyJ1IjoiYWRpdHlhMTcwMzIwMDIiLCJhIjoiY201NTk0eGE1MmhsYzJtcHpwZHkxYzI1YSJ9.-crvgtTpoASRfBDF9PvHGA'

export default function InspectionMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [inspections, setInspections] = useState<InspectionWithLatest[]>([])
  const [selectedInspection, setSelectedInspection] = useState<InspectionWithLatest | null>(null)
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
      // Sort by creation date to determine the latest
      const sortedInspections = loadedInspections.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      
      // Mark the most recent inspection
      const inspectionsWithLatest = sortedInspections.map((inspection, index) => ({
        ...inspection,
        isLatest: index === 0
      }))
      
      setInspections(inspectionsWithLatest)

      // Load offline inspections
      const offlineInspections = JSON.parse(localStorage.getItem('pendingInspections') || '[]')
      if (offlineInspections.length > 0) {
        setInspections(prev => [...prev, ...offlineInspections.map(item => ({
          ...item.inspection,
          isLatest: false
        }))])
      }
    } catch (error) {
      console.error('Error loading inspections:', error)
    }
  }

  const createMarkerElement = (inspection: InspectionWithLatest) => {
    const el = document.createElement('div')
    el.className = `marker ${inspection.isLatest ? 'latest' : ''}`
    el.style.fontSize = '24px'
    el.style.cursor = 'pointer'
    el.style.width = '24px'
    el.style.height = '24px'
    el.style.display = 'flex'
    el.style.alignItems = 'center'
    el.style.justifyContent = 'center'
    el.innerHTML = '🌳'
    
    if (inspection.isLatest) {
      const pulse = document.createElement('div')
      pulse.className = 'pulse-ring'
      el.appendChild(pulse)
    }
    
    return el
  }

  useEffect(() => {
    if (!map.current) return

    const markers = document.getElementsByClassName('marker')
    while(markers[0]) {
      markers[0].parentNode?.removeChild(markers[0])
    }

    inspections.forEach(inspection => {
      const el = createMarkerElement(inspection)

      new mapboxgl.Marker({ element: el })
        .setLngLat([inspection.location.longitude, inspection.location.latitude])
        .addTo(map.current!)

      el.addEventListener('click', () => {
        setSelectedInspection(inspection)
      })
    })
  }, [inspections])

  const handleNewInspection = async (newInspection: Omit<Inspection, "id">, images: File[]) => {
    // Reset isLatest flag for all existing inspections
    const updatedInspections = inspections.map(inspection => ({
      ...inspection,
      isLatest: false
    }))

    const inspectionWithId: InspectionWithLatest = {
      ...newInspection,
      id: Date.now().toString(),
      isLatest: true // Mark the new inspection as latest
    }

    try {
      await saveInspection(inspectionWithId, images)
      setInspections([inspectionWithId, ...updatedInspections])
      
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
      const storedInspections = JSON.parse(localStorage.getItem('pendingInspections') || '[]')
      storedInspections.push({ inspection: inspectionWithId, images })
      localStorage.setItem('pendingInspections', JSON.stringify(storedInspections))
      setInspections([inspectionWithId, ...updatedInspections])
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
        
        .marker {
          position: relative;
          transition: transform 0.2s ease;
        }
        
        .marker:hover {
          transform: scale(1.2);
        }
        
        .marker.latest {
          z-index: 1;
        }
        
        .pulse-ring {
          position: absolute;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(76, 175, 80, 0.3);
          border: 2px solid rgba(76, 175, 80, 0.5);
          animation: pulse 2s infinite;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
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

