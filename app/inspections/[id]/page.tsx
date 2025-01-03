'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { ChevronLeft, MapPin, Calendar, User, Building2, FileText } from 'lucide-react'
import { Badge } from '../../../components/ui/badge'
import { getInspection, updateInspectionStatus, initDB } from '../../../lib/db'
import { Inspection } from '../../../lib/types'
import { cn } from '../../../lib/utils'
import { ImageViewer } from '../../../components/ui/image-viewer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
import { useToast } from "../../../components/ui/use-toast"
import { getAddressFromCoordinates } from '../../../lib/services/geolocation'

export default function InspectionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [inspection, setInspection] = useState<Inspection | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [currentAddress, setCurrentAddress] = useState<string>('')
  const { toast } = useToast()

  useEffect(() => {
    const loadInspection = async () => {
      try {
        await initDB()
        const data = await getInspection(params.id as string)
        setInspection(data)
        if (data) {
          const address = await getAddressFromCoordinates(
            data.location.latitude,
            data.location.longitude
          )
          setCurrentAddress(address)
        }
      } catch (error) {
        console.error('Error loading inspection:', error)
        toast({
          title: "Error",
          description: "Failed to load inspection details.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadInspection()
  }, [params.id, toast])

  const handleStatusChange = async (newStatus: string) => {
    if (!inspection) return

    try {
      const updatedInspection = await updateInspectionStatus(inspection.id, newStatus as Inspection['status'])
      setInspection(updatedInspection)
      toast({
        title: "Status Updated",
        description: `Inspection status has been updated to ${newStatus}.`,
      })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: "Failed to update inspection status.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 bg-white px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="mb-2"
            onClick={() => router.back()}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </header>
        <div className="p-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (!inspection) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 bg-white px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="mb-2"
            onClick={() => router.back()}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </header>
        <div className="p-4 text-center">
          <p className="text-gray-500">Inspection not found</p>
        </div>
      </main>
    )
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-16 md:pb-0">
        <header className="sticky top-0 z-10 bg-white px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="mb-2"
            onClick={() => router.back()}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </header>

        <div className="px-4 pb-4">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">Complaint #{inspection.id}</h1>
              <Badge variant="secondary">{inspection.status}</Badge>
            </div>
            <p className="mt-1 text-gray-600">{inspection.title}</p>
          </div>

          <div className="space-y-6 rounded-lg bg-white p-4">
            <InfoItem
              icon={MapPin}
              label="Location"
              value={
                <>
                  {currentAddress}
                  <div className="text-sm text-gray-500 mt-1">
                    Lat: {inspection.location.latitude.toFixed(6)}, Long: {inspection.location.longitude.toFixed(6)}
                  </div>
                </>
              }
            />

            <InfoItem
              icon={Calendar}
              label="Scheduled Date"
              value={new Date(inspection.scheduledDate).toLocaleString()}
            />

            <InfoItem
              icon={User}
              label="Inspector"
              value={`${inspection.inspector.name} (ID: ${inspection.inspector.id})`}
            />

            <InfoItem
              icon={Building2}
              label="Community Board"
              value={inspection.communityBoard}
            />

            <InfoItem
              icon={FileText}
              label="Details"
              value={inspection.details}
              className="whitespace-pre-line"
            />

            {inspection.images && inspection.images.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-2">Images</h3>
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                  {inspection.images.map((img, index) => (
                    <div 
                      key={index}
                      className="relative cursor-pointer"
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={`data:image/jpeg;base64,${img}`}
                        alt={`Inspection image ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg hover:opacity-90 transition-opacity"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Update Status:</span>
              <Select
                value={inspection.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className='customUpdateStatus'>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In-Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" variant="outline">
              Add Note
            </Button>
          </div>
        </div>
      </main>

      <ImageViewer
        images={inspection.images || []}
        initialIndex={selectedImageIndex || 0}
        open={selectedImageIndex !== null}
        onOpenChange={(open) => !open && setSelectedImageIndex(null)}
      />
    </>
  )
}

function InfoItem({ 
  icon: Icon, 
  label, 
  value, 
  className 
}: { 
  icon: any
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className="flex gap-3">
      <Icon className="h-5 w-5 shrink-0 text-purple-600" />
      <div>
        <div className="font-medium text-gray-900">{label}</div>
        <div className={cn("mt-1 text-gray-600", className)}>{value}</div>
      </div>
    </div>
  )
}

