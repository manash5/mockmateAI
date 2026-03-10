import React from 'react'
import { motion } from 'framer-motion'

interface Session {
  _id: string
  role: string
  level: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'  // Added 'failed'
  overallScore?: number
  createdAt: string
}

interface Props {
  session: Session
  onClick: (session: Session) => void
  onDelete: (e: React.MouseEvent, sessionId: string) => void
}

const ROLE_ICONS: Record<string, string> = {
  Python: '🐍', MERN: '⚛️', MEAN: '⚛️', React: '⚛️', Frontend: '⚛️',
  Data: '📊', Machine: '📊', DevOps: '☁️', Cloud: '☁️',
  Security: '🛡️', Cyber: '🛡️', Blockchain: '⛓️', Web3: '⛓️',
  Mobile: '📱', iOS: '📱', Android: '📱', Game: '🎮',
  UI: '🎨', UX: '🎨', Designer: '🎨', QA: '🧪', Test: '🧪',
  Product: '📝', Manager: '📝', Java: '☕', Backend: '☕',
}

const getIcon = (role: string) => {
  for (const [key, icon] of Object.entries(ROLE_ICONS)) {
    if (role.includes(key)) return icon
  }
  return '💻'
}

const STATUS_CONFIG = {
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-400', label: 'Completed' },
  'in-progress': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', dot: 'bg-amber-400', label: 'In Progress' },
  pending: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', dot: 'bg-blue-400', label: 'Pending' },
  failed: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', dot: 'bg-rose-400', label: 'Failed' },
}

const SessionCard: React.FC<Props> = ({ session, onClick, onDelete }) => {
  const sc = STATUS_CONFIG[session.status]  // Now this will work for 'failed' too
  const icon = getIcon(session.role)
  const scoreColor = session.status === 'completed'
    ? (session.overallScore && session.overallScore >= 75 ? 'text-emerald-600' : 'text-amber-500')
    : 'text-slate-300'

  return (
    <motion.div
      onClick={() => onClick(session)}
      className="app-card session-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 cursor-pointer select-none"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Rest of your JSX remains the same */}
      <motion.div
        className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl bg-slate-50 border border-slate-100 flex-shrink-0"
        whileHover={{ scale: 1.12, rotate: -6 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        {icon}
      </motion.div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-navy text-sm truncate group-hover:text-purple transition-colors" style={{ fontFamily: 'Syne' }}>
          {session.role}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-400">
            {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-200" />
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">{session.level}</span>
        </div>
      </div>

      <div className="hidden sm:flex flex-col items-center flex-shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Score</span>
        <span className={`text-2xl font-bold leading-none mt-0.5 ${scoreColor}`} style={{ fontFamily: 'Syne' }}>
          {session.status === 'completed' ? session.overallScore : '—'}
        </span>
      </div>

      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className={`badge ${sc.bg} ${sc.text} border ${sc.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
          {sc.label}
        </span>
        <span className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--purple)' }}>
          {session.status === 'completed' ? 'View results' : 'Resume'}
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>

      <div className="hidden sm:block w-px h-10 bg-slate-100" />

      <motion.button
        onClick={(e) => { e.stopPropagation(); if (session.status !== 'pending') onDelete(e, session._id) }}
        className={`p-2.5 rounded-xl transition-colors flex-shrink-0 ${
          session.status !== 'pending' ? 'text-slate-300 hover:text-rose-500 hover:bg-rose-50' : 'text-slate-200 cursor-not-allowed'
        }`}
        whileHover={session.status !== 'pending' ? { scale: 1.1 } : {}}
        whileTap={session.status !== 'pending' ? { scale: 0.9 } : {}}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </motion.button>
    </motion.div>
  )
}

export default SessionCard