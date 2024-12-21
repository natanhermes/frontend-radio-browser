import './index.css'

import { QueryClientProvider } from '@tanstack/react-query'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'

import { RadioStationProvider } from './context/StationContext'
import { queryClient } from './lib/react-query'
import { router } from './routes'

export function App() {
  return (
    <HelmetProvider>
      <Helmet titleTemplate="%s | Radio Browser" />
      <QueryClientProvider client={queryClient}>
        <RadioStationProvider>
          <RouterProvider router={router} />
        </RadioStationProvider>
      </QueryClientProvider>
      <Toaster richColors closeButton position="top-right" visibleToasts={1} />
    </HelmetProvider>
  )
}
