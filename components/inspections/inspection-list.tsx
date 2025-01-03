'use client'

import { useEffect, useState } from 'react'
import { Card } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import Link from 'next/link'
import { MapPin, Clock } from 'lucide-react'
import { getAllInspections, initDB } from '../../lib/db'
import { Inspection } from '../../lib/types'
import React from 'react'

export function InspectionList() {
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadInspections = async () => {
      try {
        await initDB() // Ensure DB is initialized
        const data = await getAllInspections()
        setInspections(data)
      } catch (error) {
        console.error('Error loading inspections:', error)
        // Optionally, you can set an error state here to display to the user
      } finally {
        setLoading(false)
      }
    }
    loadInspections()
  }, [])

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </Card>
        ))}
      </div>
    )
  }

  if (inspections.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No inspections found</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {inspections.map((inspection) => (
        <Link 
          key={inspection.id} 
          href={`/inspections/${inspection.id}`}
          className="block transition-transform hover:scale-[1.02]"
        >
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">#{inspection.id}</span>
                  <Badge variant={
                    inspection.status === 'Pending' ? 'secondary' :
                    inspection.status === 'In-Progress' ? 'default' : 'destructive'
                  }>
                    {inspection.status}
                  </Badge>
                </div>
                <h3 className="font-medium">{inspection.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {inspection.location.address}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(inspection.scheduledDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}

