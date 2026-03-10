import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const NotFound: React.FC = () => (
  <div className="flex items-center justify-center min-h-[70vh]">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center max-w-sm mx-auto px-4"
    >
      <div className="relative inline-block mb-8">
        <span className="text-8xl font-bold select-none" style={{ color: 'var(--slate-100)', fontFamily: 'Syne' }}>404</span>
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--navy)', boxShadow: '0 8px 32px rgba(8,14,31,0.2)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--purple-bright)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </motion.div>
      </div>
      <h2 className="text-2xl font-bold text-navy mb-2" style={{ fontFamily: 'Syne' }}>Page not found</h2>
      <p className="text-slate-400 text-sm mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/"
        className="btn-primary inline-flex gap-2"
        style={{ padding: '12px 24px' }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Back to Dashboard
      </Link>
    </motion.div>
  </div>
)

export default NotFound
