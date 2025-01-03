import { InspectionList } from '../components/inspections/inspection-list'
import React from 'react'

export default function HomePage() {
  return (
    <main className="pb-16 md:pb-0">
      <header className="border-b p-4 bg-white sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-purple-600">🌳</span>
            Welcome to Tree Inspections
          </h1>
          <p className="text-gray-600 mt-1">Manage and track your tree inspections</p>
        </div>
      </header>
      
      <InspectionList />
    </main>
  )
}

