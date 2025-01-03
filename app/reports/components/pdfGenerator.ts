import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Inspection } from '../../../lib/types'

export const generatePDF = (inspections: Inspection[], filter: string) => {
  const doc = new jsPDF()

  // Set font
  doc.setFont('helvetica', 'bold')

  // Title
  doc.setFontSize(20)
  doc.text('Tree Inspection Report', 105, 15, { align: 'center' })

  // Summary
  doc.setFontSize(16)
  doc.text('Summary', 20, 30)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.text(`Filter: ${filter === 'all' ? 'All Statuses' : filter}`, 20, 40)
  doc.text(`Total Inspections: ${inspections.length}`, 20, 50)
  doc.text(`Pending: ${inspections.filter(i => i.status === 'Pending').length}`, 20, 60)
  doc.text(`In Progress: ${inspections.filter(i => i.status === 'In-Progress').length}`, 20, 70)
  doc.text(`Completed: ${inspections.filter(i => i.status === 'Completed').length}`, 20, 80)

  // Inspection Details
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('Inspection Details', 20, 100)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  const headers = [['ID', 'Title', 'Status', 'Date']]
  const data = inspections.map(inspection => [
    inspection.id,
    inspection.title,
    inspection.status,
    new Date(inspection.scheduledDate).toLocaleDateString()
  ])

  // @ts-ignore
  doc.autoTable({
    startY: 110,
    head: headers,
    body: data,
  })

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages()
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.text(`Generated on ${new Date().toLocaleString()} - Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10)
  }

  // Save the PDF
  doc.save(`tree-inspections-report-${new Date().toISOString().split('T')[0]}.pdf`)
}
