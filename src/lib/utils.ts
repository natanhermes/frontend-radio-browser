import { type ClassValue, clsx } from 'clsx'
import { DBSchema, openDB } from 'idb'
import { twMerge } from 'tailwind-merge'

import { RadioStationInfo } from '@/dtos/radio-station-info'

const DB_NAME = 'radioFavoritesDB'
const DB_VERSION = 1
const STORE_NAME = 'favorites'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface RadioStationDB extends DBSchema {
  favorites: {
    key: string
    value: RadioStationInfo
  }
}

export const openDatabase = async () => {
  return openDB<RadioStationDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore('favorites', { keyPath: 'stationuuid' })
    },
  })
}

export const updateFavoriteInIndexedDB = async (
  updatedRadio: Partial<RadioStationInfo>,
  id: string,
): Promise<void> => {
  try {
    const db = await openDatabase()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    const radioToUpdate = await store.get(id)
    if (radioToUpdate) {
      const updatedItem = { ...radioToUpdate, ...updatedRadio }
      store.put(updatedItem)
    }

    transaction.onerror = (event) => {
      console.error('update error:', event)
    }
  } catch (error) {
    console.error('access db error:', error)
  }
}

export const getAllFavoritesRadios = async () => {
  const db = await openDatabase()
  const favorites = await db.getAll('favorites')

  return favorites
}

export const deleteRadioStationById = async (radioStationId: string) => {
  const db = await openDatabase()
  await db.delete('favorites', radioStationId)
}

export const updateRadioStation = async (radioStation: RadioStationInfo) => {
  const db = await openDatabase()
  await db.put('favorites', radioStation)
}
