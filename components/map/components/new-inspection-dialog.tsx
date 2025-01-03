'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Label } from "../../../components/ui/label"
import { useState, useRef, useEffect } from "react"
import { Camera, X, Loader2 } from 'lucide-react'
import type { Inspection } from "../../../lib/types"
import { cn } from "../../../lib/utils"
import { ScrollArea } from "../../../components/ui/scroll-area"
import { useNotificationStore } from '../../../lib/stores/notification-store'
import mapboxgl from 'mapbox-gl';

interface NewInspectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (inspection: Omit<Inspection, "id">, images: File[]) => Promise<void>
}

export function NewInspectionDialog({ open, onOpenChange, onSave }: NewInspectionDialogProps) {
  const [images, setImages] = useState<File[]>([])
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [useManualLocation, setUseManualLocation] = useState(false)
  const [manualLocation, setManualLocation] = useState('')
  const { addNotification } = useNotificationStore()

  const getCurrentLocation = () => new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        (error) => reject(error)
      )
    } else {
      reject(new Error('Geolocation is not supported by this browser.'))
    }
  })

  const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}`
      )
      const data = await response.json()
      return data.features[0]?.place_name || `${latitude}, ${longitude}`
    } catch (error) {
      console.error('Error getting address:', error)
      return `${latitude}, ${longitude}`
    }
  }

  useEffect(() => {
    if (open) {
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then(result => {
          if (result.state === 'prompt') {
            navigator.geolocation.getCurrentPosition(() => {}, () => {}, { enableHighAccuracy: true })
          }
        })
      }
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title || images.length === 0) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide a title and at least one image.',
      })
      return
    }

    setLoading(true)
    try {
      let latitude, longitude, address

      if (useManualLocation) {
        if (!manualLocation) {
          addNotification({
            type: 'error',
            title: 'Location Error',
            message: 'Please enter a location manually.',
          })
          setLoading(false)
          return
        }
        address = manualLocation
        latitude = 0
        longitude = 0
      } else {
        try {
          const location = await getCurrentLocation()
          latitude = location.latitude
          longitude = location.longitude
          address = await getAddressFromCoordinates(latitude, longitude)
        } catch (locationError) {
          console.error('Geolocation error:', locationError)
          addNotification({
            type: 'error',
            title: 'Location Error',
            message: 'Failed to get current location. Please enter location manually.',
          })
          setUseManualLocation(true)
          setLoading(false)
          return
        }
      }

      const inspection: Omit<Inspection, "id"> = {
        title,
        status: 'Pending',
        location: {
          address,
          latitude,
          longitude,
        },
        scheduledDate: new Date().toISOString(),
        inspector: {
          name: 'Victor Smith',
          id: 'VS001',
        },
        communityBoard: '211',
        details: details || `LOCATION: ${address}\nINSPECTION DATE: ${new Date().toLocaleString()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        synced: false,
        images: []
      }

      await onSave(inspection, images)
      addNotification({
        type: 'success',
        title: 'Inspection Created',
        message: 'New inspection has been created successfully.',
      });

      setTitle('')
      setDetails('')
      setImages([])
      setManualLocation('')
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating inspection:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create inspection. Please try again.',
      })
    } finally {
      setLoading(false)
      stopCamera()
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
    }
  }

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `image_${Date.now()}.jpg`, { type: 'image/jpeg' })
            setImages(prev => [...prev, file])
          }
        }, 'image/jpeg')
      }
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      setIsCameraActive(false)
    }
  }

  <style jsx global>{`
    .DialogContent {
      scrollbar-width: thin;
      scrollbar-color: #888 #f1f1f1;
    }
    .DialogContent::-webkit-scrollbar {
      width: 6px;
    }
    .DialogContent::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    .DialogContent::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 3px;
    }
    .DialogContent::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `}</style>

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen) stopCamera()
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-[425px] bg-white max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">New Inspection</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                stopCamera()
                onOpenChange(false)
              }}
              className="h-8 w-8 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-gray-700">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter inspection title"
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="details" className="text-gray-700">Details (Optional)</Label>
                <Textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Enter inspection details"
                  className="mt-1.5 min-h-[100px]"
                />
              </div>

              <div>
                <Label className="text-gray-700">Images</Label>
                <div className="mt-1.5">
                  {isCameraActive ? (
                    <div className="space-y-2">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-48 object-cover rounded-lg bg-black"
                      />
                      <div className="flex gap-2">
                        <Button type="button" onClick={captureImage}>
                          Capture
                        </Button>
                        <Button type="button" variant="outline" onClick={stopCamera}>
                          Stop Camera
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={startCamera}
                      className="w-full justify-center py-6 border-dashed"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Start Camera
                    </Button>
                  )}
                </div>
                
                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {images.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Captured ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 sticky bottom-0 bg-white py-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setTitle('')
                  setDetails('')
                  setImages([])
                  stopCamera()
                  onOpenChange(false)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2"/> : null} Save Inspection
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
