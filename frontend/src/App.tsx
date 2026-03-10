import React, { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useSocket from './hooks/useSocket'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { motion, AnimatePresence } from 'framer-motion'

import Sidebar from './components/Sidebar'
import AppTopbar from './components/AppTopbar'
import PrivateRoute from './components/PrivateRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import InterviewRunner from './pages/InterviewRunner'
import SessionReview from './pages/SessionReview'
import NotFound from './pages/NotFound'

/* Pages that use the full-screen app layout with sidebar */
const APP_ROUTES = ['/', '/profile', '/interview', '/review']

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

/* App shell (sidebar layout) used by authenticated routes */
const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed(c => !c)}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <AppTopbar onToggleMobileSidebar={() => setMobileOpen(o => !o)} />
        <main className="p-5 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

const App: React.FC = () => {
  useSocket()

  return (
    <>
      <Routes>
        {/* Landing page — public */}
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={
          <div className="mesh-bg min-h-screen">
            <PageTransition><Login /></PageTransition>
          </div>
        } />
        <Route path="/register" element={
          <div className="mesh-bg min-h-screen">
            <PageTransition><Register /></PageTransition>
          </div>
        } />

        {/* Authenticated app routes */}
        <Route path="/" element={<PrivateRoute />}>
          <Route path="/" element={
            <AppShell>
              <PageTransition><Dashboard /></PageTransition>
            </AppShell>
          } />
          <Route path="/profile" element={
            <AppShell>
              <PageTransition><Profile /></PageTransition>
            </AppShell>
          } />
          <Route path="/interview/:sessionId" element={
            <AppShell>
              <PageTransition><InterviewRunner /></PageTransition>
            </AppShell>
          } />
          <Route path="/review/:sessionId" element={
            <AppShell>
              <PageTransition><SessionReview /></PageTransition>
            </AppShell>
          } />
        </Route>

        <Route path="*" element={
          <div className="mesh-bg min-h-screen">
            <PageTransition><NotFound /></PageTransition>
          </div>
        } />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </>
  )
}

export default App
