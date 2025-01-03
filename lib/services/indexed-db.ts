import { Inspection } from '../types'

const DB_NAME = 'inspections-db'
const DB_VERSION = 1

interface DB {
  getAll(store: string): Promise<any[]>
  get(store: string, key: string): Promise<any>
  put(store: string, value: any): Promise<void>
  delete(store: string, key: string): Promise<void>
}

export async function openDB(): Promise<DB> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      resolve({
        async getAll(store: string) {
          return new Promise((resolve, reject) => {
            const transaction = db.transaction(store, 'readonly')
            const objectStore = transaction.objectStore(store)
            const request = objectStore.getAll()
            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error)
          })
        },
        async get(store: string, key: string) {
          return new Promise((resolve, reject) => {
            const transaction = db.transaction(store, 'readonly')
            const objectStore = transaction.objectStore(store)
            const request = objectStore.get(key)
            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error)
          })
        },
        async put(store: string, value: any) {
          return new Promise((resolve, reject) => {
            const transaction = db.transaction(store, 'readwrite')
            const objectStore = transaction.objectStore(store)
            const request = objectStore.put(value)
            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
          })
        },
        async delete(store: string, key: string) {
          return new Promise((resolve, reject) => {
            const transaction = db.transaction(store, 'readwrite')
            const objectStore = transaction.objectStore(store)
            const request = objectStore.delete(key)
            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
          })
        },
      })
    }
    request.onupgradeneeded = (event) => {
      const db = request.result
      if (!db.objectStoreNames.contains('inspections')) {
        db.createObjectStore('inspections', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('offlineInspections')) {
        db.createObjectStore('offlineInspections', { keyPath: 'id' })
      }
    }
  })
}

