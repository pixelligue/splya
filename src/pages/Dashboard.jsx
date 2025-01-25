import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardSidebar from '../components/DashboardSidebar'
import AnalyticsFeed from '../components/AnalyticsFeed'
import Analytics from './dashboard/Analytics'
import Live from './dashboard/Live'
import Match from './dashboard/Match'
import Subscriptions from './dashboard/Subscriptions'
import DashboardLayout from '../components/DashboardLayout'
import Predictions from './dashboard/Predictions'
import Matches from './dashboard/Matches'
import Settings from './dashboard/Settings'
import { useSubscription } from '../hooks/useSubscription'
import PredictionStats from '../components/PredictionStats'
import HeroesList from './dashboard/HeroesList'

const ProtectedRoute = ({ children, requiresPro }) => {
  const { subscription, loading } = useSubscription()
  
  // Если данные загружаются, показываем загрузку
  if (loading) {
    return <div>Загрузка...</div>
  }
  
  // Если не требуется PRO или у пользователя есть PRO подписка
  if (!requiresPro || (subscription && subscription.level === 'pro')) {
    return children
  }
  
  // В противном случае редиректим на страницу подписок
  return <Navigate to="/dashboard/subscriptions" replace />
}

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-black">
      <DashboardSidebar />
      <div className="ml-80">
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route index element={
              <div className="dashboard-home">
                <PredictionStats />
              </div>
            } />
            <Route 
              path="predictions" 
              element={
                <div className="predictions-section">
                  <Predictions />
                </div>
              } 
            />
            <Route 
              path="matches" 
              element={
                <div className="matches-section">
                  <Matches />
                </div>
              } 
            />
            <Route 
              path="analytics" 
              element={
                <ProtectedRoute requiresPro>
                  <div className="analytics-section">
                    <Analytics />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="settings" 
              element={
                <div className="subscription-info">
                  <Settings />
                </div>
              } 
            />
            <Route 
              path="live" 
              element={
                <ProtectedRoute requiresPro>
                  <Live />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="live/:matchId" 
              element={
                <ProtectedRoute requiresPro>
                  <Match />
                </ProtectedRoute>
              } 
            />
            <Route path="/heroes-list" element={<ProtectedRoute><HeroesList /></ProtectedRoute>} />
          </Route>
          <Route path="subscriptions" element={<Subscriptions />} />
        </Routes>
      </div>
    </div>
  )
}

export default Dashboard 