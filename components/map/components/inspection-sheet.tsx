'use client'

import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../../components/ui/sheet"
import { Button } from "../../../components/ui/button"
import { MapPin, Calendar, User, Building2, FileText, ArrowLeft } from 'lucide-react'
import type { Inspection } from "../../../lib/types"
import { cn } from "../../../lib/utils"
import { getAddressFromCoordinates, syncPendingAddresses } from '../../../lib/services/geolocation'
import { ImageViewer } from "../../../components/ui/image-viewer"

interface InspectionSheetProps {
  inspection: Inspection | null;
  onClose: () => void;
}

export function InspectionSheet({ inspection, onClose }: InspectionSheetProps) {
  const [currentAddress, setCurrentAddress] = useState<string>('')
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  useEffect(() => {
    if (inspection) {
      setCurrentAddress(inspection.location.address)
      updateAddress(inspection.location.latitude, inspection.location.longitude)
    }
  }, [inspection])

  useEffect(() => {
    const handleAddressUpdate = (event: CustomEvent) => {
      if (!inspection) return
      
      const { latitude, longitude, address } = event.detail
      if (
        latitude === inspection.location.latitude &&
        longitude === inspection.location.longitude
      ) {
        setCurrentAddress(address)
      }
    }

    window.addEventListener('addressUpdated', handleAddressUpdate as EventListener)
    return () => {
      window.removeEventListener('addressUpdated', handleAddressUpdate as EventListener)
    }
  }, [inspection])

  useEffect(() => {
    window.addEventListener('online', syncPendingAddresses)
    return () => {
      window.removeEventListener('online', syncPendingAddresses)
    }
  }, [])

  const updateAddress = async (latitude: number, longitude: number) => {
    try {
      const address = await getAddressFromCoordinates(latitude, longitude)
      setCurrentAddress(address)
    } catch (error) {
      console.error('Error updating address:', error)
    }
  }

  if (!inspection) return null

  return (
    <>
      <Sheet open={!!inspection} onOpenChange={onClose}>
        <SheetContent 
          side="bottom" 
          className={cn(
            "h-[90vh] p-0 bg-white",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
            "duration-300 ease-in-out"
          )}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 p-4 border-b">
              <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-100">
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <SheetTitle className="text-xl">Inspection Details</SheetTitle>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-6">
                <div>
                  <div className="inline-block mt-2 px-4 py-1 text-sm bg-purple-100 text-purple-700 rounded-full font-medium">
                    {inspection.status}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900">{inspection.title}</h3>

                <div className="space-y-6">
                  <InfoItem 
                    icon={MapPin} 
                    label="Location" 
                    value={
                      <>
                        {currentAddress}
                        <div className="text-sm text-gray-500">
                          Lat: {inspection.location.latitude.toFixed(6)}, Long: {inspection.location.longitude.toFixed(6)}
                        </div>
                      </>
                    }
                  />
                  <InfoItem icon={Calendar} label="Scheduled Date" value={new Date(inspection.scheduledDate).toLocaleString()} />
                  <InfoItem icon={User} label="Inspector" value={`${inspection.inspector.name} (ID: ${inspection.inspector.id})`} />
                  <InfoItem icon={Building2} label="Community Board" value={inspection.communityBoard} />
                  <InfoItem icon={FileText} label="Details" value={inspection.details} />

                  {inspection.images && inspection.images.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Images</h4>
                      <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                        {inspection.images.map((img, index) => (
                          <div 
                            key={index} 
                            className="relative aspect-square cursor-pointer"
                            onClick={() => setSelectedImageIndex(index)}
                          >
                            <img 
                              src={`data:image/jpeg;base64,${img}`}
                              alt={`Inspection image ${index + 1}`}
                              className="rounded-lg object-cover w-full h-full hover:opacity-90 transition-opacity"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex gap-3">
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Update Status
                </Button>
                <Button variant="outline" className="flex-1">
                  Add Note
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ImageViewer
        images={inspection.images || []}
        initialIndex={selectedImageIndex || 0}
        open={selectedImageIndex !== null}
        onOpenChange={(open) => !open && setSelectedImageIndex(null)}
      />
    </>
  )
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string | JSX.Element }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-purple-600" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">{label}</h4>
        <p className="text-gray-600">{value}</p>
      </div>
    </div>
  )
}

