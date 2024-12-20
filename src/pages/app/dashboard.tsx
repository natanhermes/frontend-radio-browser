import { Helmet } from 'react-helmet-async'

import { AppSidebar } from '@/components/app-sidebar'
import { FavoriteRadioStations } from '@/components/favorite-radios'
import { Header } from '@/components/header'
import { SidebarProvider } from '@/context/SidebarContext'
import { useRadioStations } from '@/hooks/use-radio-stations'

export function Dashboard() {
  const { favoriteRadioStations } = useRadioStations()

  return (
    <>
      <Helmet title="Home" />

      <SidebarProvider>
        <AppSidebar />

        <main className="w-full p-2">
          <Header icon="search" />

          <FavoriteRadioStations radios={favoriteRadioStations} />
        </main>
      </SidebarProvider>
    </>
  )
}
