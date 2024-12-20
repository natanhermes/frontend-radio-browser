import { createBrowserRouter } from 'react-router-dom'

import { NotFound } from './pages/404'
import { Dashboard } from './pages/app/dashboard'

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <NotFound />,
    element: <Dashboard />,
  },
])
