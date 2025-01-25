import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import Navigation from './components/Navigation'
import Auth from './pages/Auth'
import Landing from './pages/Landing'
import Partners from './pages/Partners'
import About from './pages/About'
import Dashboard from './pages/Dashboard'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import AdminLayout from './pages/admin/AdminLayout'
import Overview from './pages/admin/Overview'
import TeamsManager from './pages/admin/TeamsManager'
import TournamentsAndMatches from './pages/admin/TournamentsAndMatches'
import PromptTester from './pages/admin/PromptTester'
import Heroes from './pages/admin/Heroes'
import HeroDetails from './pages/admin/heroes/HeroDetails'
import PredictionsManager from './pages/admin/PredictionsManager'
import ApiTest from './components/ApiTest'

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<><Navigation /><Landing /></>} />
          <Route path="/auth" element={<><Navigation /><Auth /></>} />
          <Route path="/partners" element={<><Navigation /><Partners /></>} />
          <Route path="/about" element={<><Navigation /><About /></>} />
          <Route path="/dashboard/*" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<Overview />} />
            <Route path="teams-manager" element={<TeamsManager />} />
            <Route path="tournaments" element={<TournamentsAndMatches />} />
            <Route path="heroes" element={<Heroes />} />
            <Route path="heroes/:id" element={<HeroDetails />} />
            <Route path="prompts" element={<PromptTester />} />
            <Route path="predictions" element={<PredictionsManager />} />
            <Route path="api-test" element={<ApiTest />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
