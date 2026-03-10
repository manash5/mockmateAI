import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, reset } from '../features/auth/authSlice'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandLogo } from './ui/brand-logo'

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapse: () => void
  onCloseMobile: () => void
}

const NAV_ITEMS = [
  {
    section: 'Main',
    items: [
      {
        to: '/',
        label: 'Dashboard',
        icon: (
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="7" height="7" rx="1.5" />
            <rect x="11" y="2" width="7" height="7" rx="1.5" />
            <rect x="2" y="11" width="7" height="7" rx="1.5" />
            <rect x="11" y="11" width="7" height="7" rx="1.5" />
          </svg>
        ),
      },
      {
        to: '/profile',
        label: 'Profile',
        icon: (
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="7" r="3" />
            <path d="M3 17c0-3.866 3.134-7 7-7s7 3.134 7 7" />
          </svg>
        ),
      },
    ],
  },
]

const Sidebar: React.FC<SidebarProps> = ({ collapsed, mobileOpen, onToggleCollapse, onCloseMobile }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state: any) => state.auth)

  const onLogout = () => {
    dispatch(logout() as any)
    dispatch(reset())
    navigate('/login')
    onCloseMobile()
  }

  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  const isActive = (path: string) => location.pathname === path

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="sidebar-logo">
        <motion.div
          className="sidebar-logo-icon"
          whileHover={{ rotate: -8, scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          <BrandLogo className=" text-white" animated={false} />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-white font-bold text-sm leading-none" style={{ fontFamily: 'Syne' }}>MockMate AI</p>
              <p className="text-white/25 text-[10px] mt-0.5" style={{ fontFamily: 'JetBrains Mono' }}>Practice Platform</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className="sidebar-nav">
        {NAV_ITEMS.map(section => (
          <div key={section.section}>
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map(item => {
              const active = isActive(item.to)
              return (
                <div key={item.to} className="tooltip">
                  <Link
                    to={item.to}
                    onClick={onCloseMobile}
                    className={`sidebar-item ${active ? 'active' : ''}`}
                  >
                    {active && <div className="sidebar-active-indicator" />}
                    <motion.div
                      className="sidebar-item-icon w-5 h-5"
                      whileHover={{ scale: 1.2, rotate: -6 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                      {item.icon}
                    </motion.div>
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{ duration: 0.18 }}
                          className="sidebar-item-label text-sm"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                  {collapsed && <span className="tooltip-text">{item.label}</span>}
                </div>
              )
            })}
          </div>
        ))}

        {/* History shortcut */}
        <div className="sidebar-section-label mt-4">Sessions</div>
        <div className="tooltip">
          <div className="sidebar-item" style={{ cursor: 'default', opacity: 0.5 }}>
            <motion.div
              className="sidebar-item-icon w-5 h-5"
              whileHover={{ scale: 1.2, rotate: -6 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="10" r="7" />
                <path d="M10 6v4l2.5 2.5" />
              </svg>
            </motion.div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                  className="sidebar-item-label text-sm"
                >
                  History
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          {collapsed && <span className="tooltip-text">History</span>}
        </div>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* User row */}
        <div className="sidebar-user" onClick={() => navigate('/profile')}>
          <motion.div
            className="sidebar-avatar"
            whileHover={{ scale: 1.12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            {initials}
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden flex-1 min-w-0"
              >
                <p className="text-white/80 text-xs font-semibold truncate">{user?.name}</p>
                <p className="text-white/30 text-[10px] truncate mt-0.5">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <div className="tooltip mt-1">
          <motion.button
            onClick={onLogout}
            className="sidebar-item w-full text-left"
            whileHover={{ x: 2 }}
            style={{ color: 'rgba(255,100,100,0.6)' }}
          >
            <motion.div
              className="sidebar-item-icon w-5 h-5"
              whileHover={{ scale: 1.2, rotate: 8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 7l4 3-4 3M7 10h10M10 3H5a2 2 0 00-2 2v10a2 2 0 002 2h5" />
              </svg>
            </motion.div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                  className="sidebar-item-label text-sm"
                >
                  Sign out
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          {collapsed && <span className="tooltip-text">Sign out</span>}
        </div>
      </div>

      {/* Collapse toggle (desktop) */}
      <motion.button
        className="collapse-btn hidden md:flex"
        onClick={onToggleCollapse}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        <motion.svg
          className="w-3.5 h-3.5"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
        </motion.svg>
      </motion.button>
    </>
  )

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={onCloseMobile}
      />

      {/* Sidebar */}
      <motion.aside
        className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {sidebarContent}
      </motion.aside>
    </>
  )
}

export default Sidebar
