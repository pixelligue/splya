import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { createBrowserRouter } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import Overview from './Overview'
import TeamsManager from './TeamsManager'
import TournamentsAndMatches from './TournamentsAndMatches'
import PromptTester from './PromptTester'
import Heroes from './Heroes'
import HeroDetails from './heroes/[id]'
import AdminRoute from '../../components/AdminRoute'

const router = createBrowserRouter([
  {
    path: '/admin',
    element: <AdminRoute><AdminLayout /></AdminRoute>,
    children: [
      { path: '', element: <Overview /> },
      { path: 'teams-manager', element: <TeamsManager /> },
      { path: 'tournaments', element: <TournamentsAndMatches /> },
      { path: 'heroes', element: <Heroes /> },
      { path: 'heroes/:id', element: <HeroDetails /> },
      { path: 'prompts', element: <PromptTester /> }
    ]
  }
])

const App = () => {
  return <RouterProvider router={router} />
}

export default App 