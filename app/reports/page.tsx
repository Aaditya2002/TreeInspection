'use client'

import { useEffect, useState } from 'react'
import { FileText, Download, Filter, FileDown } from 'lucide-react'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { getAllInspections } from '../../lib/db'
import { Inspection } from '../../lib/types'
import { Badge } from '../../components/ui/badge'
import { generatePDF } from './components/pdfGenerator'
import { ReportPreview } from './report-preview'
import { useLongPress } from '../../lib/hooks/use-long-press'

export default function ReportsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null)
  const [pressedCardId, setPressedCardId] = useState<string | null>(null)

  useEffect(() => {
    loadInspections()
  }, [])

  const loadInspections = async () => {
    try {
      const data = await getAllInspections()
      setInspections(data)
    } catch (error) {
      console.error('Error loading inspections:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInspections = inspections.filter(inspection => {
    if (filter === 'all') return true
    return inspection.status.toLowerCase() === filter
  })

  const generateReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      totalInspections: filteredInspections.length,
      statusBreakdown: {
        pending: filteredInspections.filter(i => i.status === 'Pending').length,
        inProgress: filteredInspections.filter(i => i.status === 'In-Progress').length,
        completed: filteredInspections.filter(i => i.status === 'Completed').length,
      },
      inspections: filteredInspections.map(i => ({
        id: i.id,
        title: i.title,
        status: i.status,
        location: i.location.address,
        scheduledDate: i.scheduledDate,
        inspector: i.inspector.name,
      })),
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tree-inspections-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleGeneratePDF = (inspection?: Inspection) => {
    if (inspection) {
      generatePDF([inspection], 'single')
    } else {
      generatePDF(filteredInspections, filter)
    }
  }

  const bind = useLongPress<Inspection>((inspection) => {
    setSelectedInspection(inspection)
  }, {
    threshold: 500,
    onStart: (inspection) => setPressedCardId(inspection.id),
    onEnd: () => setPressedCardId(null),
  })

  return (
    <>
      <main className="pb-16 md:pb-0">
        <header className="border-b p-4 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <h1 className="text-xl font-bold">Reports</h1>
          </div>
        </header>

        <div className="p-4 space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="font-medium">Filter by Status</span>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className='customUpdateStatus'>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <StatCard
                  title="Total Inspections"
                  value={filteredInspections.length}
                />
                <StatCard
                  title="Pending"
                  value={filteredInspections.filter(i => i.status === 'Pending').length}
                />
                <StatCard
                  title="Completed"
                  value={filteredInspections.filter(i => i.status === 'Completed').length}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={generateReport}
                  disabled={filteredInspections.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download JSON
                </Button>
                
                <Button 
                  className="flex-1" 
                  onClick={() => handleGeneratePDF()}
                  disabled={filteredInspections.length === 0}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            {loading ? (
              <Card className="p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </Card>
            ) : (
              filteredInspections.map(inspection => (
                <Card 
                  key={inspection.id} 
                  className={`p-4 transition-colors ${pressedCardId === inspection.id ? 'bg-gray-50' : ''}`}
                  {...bind(inspection)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-purple-600">#{inspection.id}</span>
                        <Badge variant={
                          inspection.status === 'Pending' ? 'secondary' :
                          inspection.status === 'In-Progress' ? 'default' : 'destructive'
                        }>
                          {inspection.status}
                        </Badge>
                      </div>
                      <h3 className="font-medium">{inspection.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {inspection.location.address}
                      </p>
                    </div>
                    <time className="text-sm text-gray-500">
                      {new Date(inspection.scheduledDate).toLocaleDateString()}
                    </time>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      {selectedInspection && (
        <ReportPreview
          inspection={selectedInspection}
          open={!!selectedInspection}
          onOpenChange={(open) => !open && setSelectedInspection(null)}
          onDownload={() => handleGeneratePDF(selectedInspection)}
        />
      )}
    </>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card className="p-4">
      <h3 className="text-sm text-gray-500">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </Card>
  )
}

