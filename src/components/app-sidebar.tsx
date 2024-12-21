import { useQuery } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { getRadioStations } from '@/api/get-stations'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { RadioStationInfo } from '@/dtos/radio-station-info'
import { useRadioStations } from '@/hooks/use-radio-stations'

import { Button } from './ui/button'
import { Input } from './ui/input'

export function AppSidebar() {
  const { favoriteRadioStations, addRadioToFavorites } = useRadioStations()

  const [offsetPagination, setOffsetPagination] = useState(0)
  const [searchQuery, setSearchQuery] = useState<string>('')

  const { data: radios, refetch } = useQuery({
    queryKey: ['stations'],
    queryFn: () =>
      getRadioStations({
        params: {
          searchQuery,
          offset: offsetPagination,
        },
      }),
  })

  const toggleFavoriteRadioStation = (radio: RadioStationInfo) => {
    if (favoriteRadioStations.includes(radio)) {
      return
    }
    toast.promise(addRadioToFavorites(radio), {
      success: 'successfully favorited radio',
      error: 'This radio station is currently offline.',
    })
  }

  const validateEmptyStationName = (stationName: string) => {
    return stationName.trim() === '' ? 'no name available' : stationName
  }

  const isFavorite = (radio: RadioStationInfo) =>
    favoriteRadioStations.some(
      (favorite) => favorite.stationuuid === radio.stationuuid,
    )

  useEffect(() => {
    refetch()
  }, [offsetPagination, refetch, searchQuery])

  return (
    <>
      <Sidebar>
        <SidebarHeader />
        <SidebarContent>
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="mb-4 justify-center">
              <Input
                className="w-3/4 dark:bg-card"
                placeholder="Search here"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {radios?.map((radio) => (
                  <SidebarMenuItem key={radio.stationuuid}>
                    <SidebarMenuButton
                      asChild
                      disabled={isFavorite(radio)}
                      className={`${isFavorite(radio) ? 'cursor-not-allowed' : 'cursor-pointer'} justify-between`}
                      isActive={isFavorite(radio)}
                      onClick={() => toggleFavoriteRadioStation(radio)}
                    >
                      <div>
                        <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                          {validateEmptyStationName(radio.name)}
                        </span>
                        {radio.lastcheckok && <Check />}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
              <div className="flex items-center justify-around">
                <Button
                  variant="link"
                  disabled={offsetPagination === 0}
                  onClick={() =>
                    setOffsetPagination((prev) =>
                      prev === 0 ? prev : prev - 10,
                    )
                  }
                >
                  Prev
                </Button>
                <Button
                  variant="link"
                  onClick={() => setOffsetPagination((prev) => prev + 10)}
                >
                  Next
                </Button>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  )
}
