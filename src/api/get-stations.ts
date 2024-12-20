import { AxiosResponse } from 'axios'

import { RadioStationInfo } from '@/dtos/radio-station-info'
import { api } from '@/lib/axios'

export interface GetRadioStationsBody {
  limit?: number
  params?: {
    searchQuery: string
    offset: number
  }
}

export async function getRadioStations({
  limit = 10,
  params,
}: GetRadioStationsBody): Promise<RadioStationInfo[]> {
  try {
    let response = await api.post<
      RadioStationInfo[],
      AxiosResponse<RadioStationInfo[]>
    >(`/search?limit=${limit}&hidebroken=${true}`, {
      name: params?.searchQuery,
      offset: params?.offset,
    })

    if (response.data.length === 0 && params?.searchQuery) {
      response = await api.post<
        RadioStationInfo[],
        AxiosResponse<RadioStationInfo[]>
      >(`/search?limit=${limit}&hidebroken=${true}`, {
        country: params?.searchQuery,
        offset: params?.offset,
      })
    }

    if (response.data.length === 0 && params?.searchQuery) {
      response = await api.post<
        RadioStationInfo[],
        AxiosResponse<RadioStationInfo[]>
      >(`/search?limit=${limit}&hidebroken=${true}`, {
        language: params?.searchQuery,
        offset: params?.offset,
      })
    }

    return response.data
  } catch (error) {
    console.error('search radio stations error:', error)
    return []
  }
}
