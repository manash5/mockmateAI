import React from 'react'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'

interface AppTopbarProps {
  onToggleMobileSidebar: () => void
}

const ROUTE_LABELS: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Your interview sessions' },
  '/profile': { title: 'Profile', subtitle: 'Manage your account' },
}

const AppTopbar: React.FC<AppTopbarProps> = ({ onToggleMobileSidebar }) => {
  const location = useLocation()
  const { user } = useSelector((state: any) => state.auth)
  const routeInfo = ROUTE_LABELS[location.pathname]
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <div className="app-topbar">
      {/* Left: Mobile menu + breadcrumb */}
      <div className="flex items-center gap-3">
        <motion.button
          onClick={onToggleMobileSidebar}
          className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-navy hover:bg-slate-100 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>

        {routeInfo && (
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-base font-bold text-navy" style={{ fontFamily: 'Syne' }}>{routeInfo.title}</h1>
            <p className="text-xs text-slate-400 hidden sm:block">{routeInfo.subtitle}</p>
          </motion.div>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Online status */}
        <div className="hidden sm:flex items-center gap-1.5 bg-green-50 text-green-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-100">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-green-500"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          Online
        </div>

        {/* Notification bell */}
        <motion.button
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-navy hover:bg-slate-100 transition-all relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </motion.button>

        {/* User avatar */}
        <motion.div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold cursor-pointer select-none"
          style={{ background: 'linear-gradient(135deg,#6c63ff,#00d4ff)', fontFamily: 'Syne' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={user?.name}
        >
          {initials}
        </motion.div>
      </div>
    </div>
  )
}

export default AppTopbar
