'use client'

import { Dialog, DialogContent } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { X, Download, MapPin, Calendar, User, Building2 } from 'lucide-react'
import { Badge } from "../../components/ui/badge"
import type { Inspection } from "../../lib/types"
import { ImageViewer } from "../../components/ui/image-viewer"
import { useState } from "react"

interface ReportPreviewProps {
  inspection: Inspection
  open: boolean
  onOpenChange: (open: boolean) => void
  onDownload: () => void
}

export function ReportPreview({ inspection, open, onOpenChange, onDownload }: ReportPreviewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl p-0">
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Inspection Details</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={onDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">#{inspection.id}</span>
                  <Badge variant={
                    inspection.status === 'Pending' ? 'secondary' :
                    inspection.status === 'In-Progress' ? 'default' : 'destructive'
                  }>
                    {inspection.status}
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold mt-1">{inspection.title}</h3>
              </div>
              <time className="text-sm text-gray-500">
                {new Date(inspection.scheduledDate).toLocaleDateString()}
              </time>
            </div>

            <div className="grid gap-6">
              <InfoItem
                icon={MapPin}
                label="Location"
                value={inspection.location.address}
                subValue={`${inspection.location.latitude.toFixed(6)}, ${inspection.location.longitude.toFixed(6)}`}
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

              <div>
                <h4 className="font-medium mb-2">Details</h4>
                <p className="text-gray-600 whitespace-pre-line">{inspection.details}</p>
              </div>

              {inspection.images && inspection.images.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Images</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {inspection.images.map((img, index) => (
                      <div 
                        key={index}
                        className="relative aspect-video cursor-pointer rounded-lg overflow-hidden"
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img
                          src={`data:image/jpeg;base64,${img}`}
                          alt={`Inspection image ${index + 1}`}
                          className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
  subValue 
}: { 
  icon: React.ElementType
  label: string
  value: string
  subValue?: string
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-1">
        <Icon className="h-5 w-5 text-purple-600" />
      </div>
      <div>
        <h4 className="font-medium">{label}</h4>
        <p className="text-gray-600">{value}</p>
        {subValue && (
          <p className="text-sm text-gray-500">{subValue}</p>
        )}
      </div>
    </div>
  )
}

