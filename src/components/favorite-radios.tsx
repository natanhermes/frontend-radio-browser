import { AudioLines } from 'lucide-react'

import { RadioStationInfo } from '@/dtos/radio-station-info'
import { useRadioStations } from '@/hooks/use-radio-stations'
import { updateFavoriteInIndexedDB } from '@/lib/utils'

import { CardRadio } from './card-radio'

interface FavoriteRadiosProps {
  radios: RadioStationInfo[]
}

export function FavoriteRadioStations({ radios }: FavoriteRadiosProps) {
  const {
    favoriteRadioStations,
    radioPlayingNow,
    removeteRadioFromFavoritesList,
    setFavoriteRadioStations,
  } = useRadioStations()

  const handleUpdateRadio = async (
    updatedRadio: Partial<RadioStationInfo>,
    id: string,
  ) => {
    setFavoriteRadioStations((prevRadios) =>
      prevRadios.map((radio) =>
        radio.stationuuid === id ? { ...radio, ...updatedRadio } : radio,
      ),
    )

    await updateFavoriteInIndexedDB(updatedRadio, id)
  }

  return (
    <div className="mt-4">
      <span>Favorite Radio Stations</span>
      <section className="mt-2 flex flex-col gap-4 rounded-md bg-accent px-2 py-4">
        {radioPlayingNow ? (
          <div className="flex items-center justify-around">
            <div>
              Playing now:
              <span className="font-semibold leading-3 tracking-tight text-primary">
                {radioPlayingNow?.name}
              </span>
            </div>
            <AudioLines className="text-primary" />
          </div>
        ) : (
          favoriteRadioStations.length > 0 && (
            <span className="text-center">no radio playing</span>
          )
        )}

        {favoriteRadioStations.length > 0 ? (
          radios.map((radio) => {
            return (
              <CardRadio
                key={radio.stationuuid}
                radio={radio}
                onUpdate={(updatedFields) =>
                  handleUpdateRadio(updatedFields, radio.stationuuid)
                }
                onRemove={() =>
                  removeteRadioFromFavoritesList(radio.stationuuid)
                }
              />
            )
          })
        ) : (
          <span className="text-center">no radio selected</span>
        )}
      </section>
    </div>
  )
}
