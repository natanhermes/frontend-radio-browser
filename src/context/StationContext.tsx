import { createContext, ReactNode, useEffect, useMemo, useState } from 'react'

import { RadioPlayerHandleProps } from '@/components/radio-player'
import { RadioStationInfo } from '@/dtos/radio-station-info'
import {
  deleteRadioStationById,
  getAllFavoritesRadios,
  updateRadioStation,
} from '@/lib/utils'

type RadioStationContext = {
  favoriteRadioStations: RadioStationInfo[]
  radioPlayingNow: RadioStationInfo | undefined
  currentRadioRef: React.RefObject<RadioPlayerHandleProps> | null
  setFavoriteRadioStations: React.Dispatch<
    React.SetStateAction<RadioStationInfo[]>
  >
  setCurrentRadioRef: (
    ref: React.RefObject<RadioPlayerHandleProps> | null,
  ) => void
  setRadioPlayingNow: React.Dispatch<
    React.SetStateAction<RadioStationInfo | undefined>
  >
  removeteRadioFromFavoritesList: (radioStationId: string) => void
  addRadioToFavorites: (radioStation: RadioStationInfo) => Promise<void>
}

export const RadioStationContext = createContext<RadioStationContext | null>(
  null,
)

export const RadioStationProvider = ({ children }: { children: ReactNode }) => {
  const [favoriteRadioStations, setFavoriteRadioStations] = useState<
    RadioStationInfo[]
  >([])
  const [radioPlayingNow, setRadioPlayingNow] = useState<
    RadioStationInfo | undefined
  >()
  const [currentRadioRef, setCurrentRadioRef] =
    useState<React.RefObject<RadioPlayerHandleProps> | null>(null)

  const loadFavoritesFromDB = async () => {
    const favoritesRadios = await getAllFavoritesRadios()
    setFavoriteRadioStations(favoritesRadios)
  }

  const addRadioToFavorites = async (radioStation: RadioStationInfo) => {
    await updateRadioStation(radioStation)
    setFavoriteRadioStations((prev) => [...prev, radioStation])
  }

  const removeteRadioFromFavoritesList = async (radioStationId: string) => {
    await deleteRadioStationById(radioStationId)
    setFavoriteRadioStations((prev) =>
      prev.filter((item) => item.stationuuid !== radioStationId),
    )
  }

  useEffect(() => {
    loadFavoritesFromDB()
  }, [])

  const contextValue = useMemo(
    () => ({
      favoriteRadioStations,
      currentRadioRef,
      radioPlayingNow,
      setFavoriteRadioStations,
      removeteRadioFromFavoritesList,
      setCurrentRadioRef,
      setRadioPlayingNow,
      addRadioToFavorites,
    }),
    [favoriteRadioStations, currentRadioRef, radioPlayingNow],
  )

  return (
    <RadioStationContext.Provider value={contextValue}>
      {children}
    </RadioStationContext.Provider>
  )
}

RadioStationProvider.displayName = 'RadioStationProvider'
