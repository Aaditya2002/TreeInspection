import { openDB, DBSchema } from 'idb'
import { Inspection } from './types'

interface TreeInspectionDB extends DBSchema {
  inspections: {
    key: string
    value: Inspection
    indexes: {
      'by-status': string
      'by-date': string
    }
  }
}

let db: any = null

export async function initDB() {
  if (db) return db

  try {
    db = await openDB<TreeInspectionDB>('tree-inspection-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('inspections')) {
          const inspectionStore = db.createObjectStore('inspections', {
            keyPath: 'id',
          })
          inspectionStore.createIndex('by-status', 'status')
          inspectionStore.createIndex('by-date', 'scheduledDate')
        }
      },
    })

    return db
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

export async function saveInspection(inspection: Inspection, images: File[]): Promise<Inspection> {
  const db = await initDB()

  try {
    await db.put('inspections', inspection)
    return inspection
  } catch (error) {
    console.error('Error saving inspection:', error)
    throw error
  }
}

export async function getInspection(id: string): Promise<Inspection | undefined> {
  const db = await initDB()
  return db.get('inspections', id)
}

export async function getAllInspections(): Promise<Inspection[]> {
  const db = await initDB()
  return db.getAll('inspections')
}

export async function updateInspectionStatus(id: string, status: Inspection['status']): Promise<Inspection> {
  const db = await initDB()
  const inspection = await db.get('inspections', id)
  if (!inspection) {
    throw new Error('Inspection not found')
  }

  const updatedInspection = {
    ...inspection,
    status,
    updatedAt: new Date().toISOString(),
  }

  await db.put('inspections', updatedInspection)
  return updatedInspection
}

