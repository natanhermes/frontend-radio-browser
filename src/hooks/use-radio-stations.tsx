import { useContext } from 'react'

import { RadioStationContext } from '@/context/StationContext'

export function useRadioStations() {
  const context = useContext(RadioStationContext)
  if (!context) {
    throw new Error(
      'useRadioStations must be used within a RadioStationProvider.',
    )
  }

  return context
}
