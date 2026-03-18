import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { FloatingIconsHero } from '@/components/ui/floating-icons-hero-section'
import { AnimatedTooltip } from '@/components/ui/animated-tooltip'
import { BrandLogo } from '@/components/ui/brand-logo'


/* ── Preloader ─────────────────────────────────── */
const Preloader: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'loading' | 'done'>('loading')

  useEffect(() => {
    const steps = [10, 25, 45, 60, 75, 88, 96, 100]
    let i = 0
    const timer = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i++])
      } else {
        clearInterval(timer)
        setPhase('done')
        setTimeout(onDone, 600)
      }
    }, 220)
    return () => clearInterval(timer)
  }, [onDone])

  return (
    <AnimatePresence>
      {phase !== 'done' ? (
        <motion.div
          key="loader"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="preloader"
        >
          {/* Animated logo */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-8"
          >
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
              <motion.rect
                x="4" y="4" width="64" height="64" rx="20"
                stroke="bg-blue"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              />
              <motion.rect
                x="4" y="4" width="64" height="64" rx="20"
                fill="bg-blue"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              />
              <motion.path
                d="M22 44 L22 28 L30 36 L38 24 L46 44"
                stroke="#6c63ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1, ease: 'easeInOut' }}
              />
              <motion.circle
                cx="46" cy="44" r="4"
                fill="#00d4ff"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.4, type: 'spring' }}
              />
            </svg>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-center"
            >
              <p className="text-white/90 text-xl font-bold tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                MockMate AI
              </p>
              <p className="text-white/30 text-xs tracking-widest uppercase mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Practice Platform
              </p>
            </motion.div>

            {/* Progress bar */}
            <div className="w-48 h-0.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #6c63ff, #00d4ff)' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
            <p className="text-white/20 text-xs font-mono">{progress}%</p>
          </motion.div>

          {/* Background particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-purple-400/40"
              style={{
                left: `${10 + i * 7}%`,
                top: `${20 + (i % 5) * 15}%`,
              }}
              animate={{ y: [-10, 10, -10], opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 3 + i * 0.3, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

/* ── Animated counter ──────────────────────────── */
const Counter: React.FC<{ to: number; suffix?: string; duration?: number }> = ({ to, suffix = '', duration = 2 }) => {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = to / (duration * 60)
    const timer = setInterval(() => {
      start = Math.min(start + step, to)
      setVal(Math.round(start))
      if (start >= to) clearInterval(timer)
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [inView, to, duration])

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

/* ── Particle field ────────────────────────────── */
const ParticleField: React.FC = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2,
    dur: 4 + Math.random() * 6,
    delay: Math.random() * 4,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            background: p.id % 3 === 0 ? '#00d4ff' : '#6c63ff',
            opacity: 0.4,
          }}
          animate={{ y: [-20, 20, -20], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

/* ── 3D Floating Card ──────────────────────────── */
const FloatingDashboard: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)
    const dy = (e.clientY - cy) / (rect.height / 2)
    setRotate({ x: -dy * 10, y: dx * 10 })
  }

  const handleMouseLeave = () => setRotate({ x: 0, y: 0 })

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
      className="relative w-full max-w-md mx-auto"
    >
      <motion.div
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="glass-card p-6 relative overflow-hidden"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-white/40 text-xs font-mono tracking-wider">NEURAL.AI</p>
            <p className="text-white font-bold text-sm mt-0.5" style={{ fontFamily: 'Syne' }}>Interview Dashboard</p>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/40 text-xs">Live</span>
          </div>
        </div>

        {/* Score ring */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
              <motion.circle
                cx="40" cy="40" r="34" fill="none"
                stroke="url(#scoreGrad)" strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 34}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 34 * 0.18 }}
                transition={{ delay: 1.2, duration: 1.5, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6c63ff" />
                  <stop offset="100%" stopColor="#00d4ff" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-lg" style={{ fontFamily: 'Syne' }}>82%</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {[
              { label: 'Technical', pct: 88, color: '#6c63ff' },
              { label: 'Confidence', pct: 74, color: '#00d4ff' },
              { label: 'Communication', pct: 81, color: '#00e5a0' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between mb-0.5">
                  <span className="text-white/40 text-xs">{item.label}</span>
                  <span className="text-white/60 text-xs">{item.pct}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ delay: 1.4, duration: 1.2, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question preview */}
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <p className="text-white/30 text-xs font-mono mb-1.5">// Current Question</p>
          <p className="text-white/70 text-xs leading-relaxed">
            Explain the difference between <span className="text-purple-300">async/await</span> and Promises in JavaScript...
          </p>
        </div>

        {/* Bottom icons */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/08">
          {[
            { emoji: '🎤', label: 'Voice', active: true },
            { emoji: '💻', label: 'Code', active: false },
            { emoji: '📊', label: 'Score', active: false },
          ].map(item => (
            <div key={item.label} className={`flex flex-col items-center gap-1 cursor-pointer group`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all duration-300 ${item.active ? 'bg-purple/30 border border-purple/40' : 'bg-white/5 border border-white/10 group-hover:bg-purple/20'}`}>
                {item.emoji}
              </div>
              <span className="text-white/30 text-xs">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Glow overlay */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
      </motion.div>

      {/* Shadow depth */}
      <div className="absolute inset-x-8 bottom-0 h-8 bg-purple/20 blur-xl rounded-full translate-y-4" />
    </motion.div>
  )
}

/* ── Scroll-reveal wrapper ─────────────────────── */
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const SectionIntro: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0.05 }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28, filter: 'blur(4px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const IconFigma = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10A10 10 0 0 1 2 12 10 10 0 0 1 12 2z" fill="#2C2C2C"/>
    <path d="M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5V7z" fill="#0ACF83"/>
    <path d="M12 12a5 5 0 0 1-5-5 5 5 0 0 1 5-5v10z" fill="#A259FF"/>
    <path d="M12 17a5 5 0 0 1-5-5h10a5 5 0 0 1-5 5z" fill="#F24E1E"/>
    <path d="M7 12a5 5 0 0 1 5 5v-5H7z" fill="#FF7262"/>
  </svg>
)

const IconGoogle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.9999 12.24C21.9999 11.4933 21.9333 10.76 21.8066 10.0533H12.3333V14.16H17.9533C17.7333 15.3467 17.0133 16.3733 15.9666 17.08V19.68H19.5266C21.1933 18.16 21.9999 15.4533 21.9999 12.24Z" fill="#4285F4"/>
    <path d="M12.3333 22C15.2333 22 17.6866 21.0533 19.5266 19.68L15.9666 17.08C15.0199 17.7333 13.7933 18.16 12.3333 18.16C9.52659 18.16 7.14659 16.28 6.27992 13.84H2.59326V16.5133C4.38659 20.0267 8.05992 22 12.3333 22Z" fill="#34A853"/>
    <path d="M6.2799 13.84C6.07324 13.2267 5.9599 12.58 5.9599 11.92C5.9599 11.26 6.07324 10.6133 6.2799 10L2.59326 7.32667C1.86659 8.78667 1.45326 10.32 1.45326 11.92C1.45326 13.52 1.86659 15.0533 2.59326 16.5133L6.2799 13.84Z" fill="#FBBC05"/>
    <path d="M12.3333 5.68C13.8933 5.68 15.3133 6.22667 16.3866 7.24L19.6 4.02667C17.68 2.29333 15.2266 1.33333 12.3333 1.33333C8.05992 1.33333 4.38659 3.97333 2.59326 7.32667L6.27992 10C7.14659 7.56 9.52659 5.68 12.3333 5.68Z" fill="#EA4335"/>
  </svg>
)

const IconApple = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.482 15.334C16.274 16.146 15.238 17.554 15.238 19.138C15.238 21.694 17.062 22.846 19.33 22.99C21.682 23.122 23.53 21.73 23.53 19.138C23.53 16.57 21.742 15.334 19.438 15.334C18.23 15.334 17.482 15.334 17.482 15.334ZM19.438 1.018C17.074 1.018 15.238 2.41 15.238 4.982C15.238 7.554 17.062 8.702 19.33 8.842C21.682 8.974 23.53 7.582 23.53 4.982C23.518 2.41 21.742 1.018 19.438 1.018Z" />
  </svg>
)

const IconMicrosoft = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.4 2H2v9.4h9.4V2Z" fill="#F25022"/>
    <path d="M22 2h-9.4v9.4H22V2Z" fill="#7FBA00"/>
    <path d="M11.4 12.6H2V22h9.4V12.6Z" fill="#00A4EF"/>
    <path d="M22 12.6h-9.4V22H22V12.6Z" fill="#FFB900"/>
  </svg>
)

const IconGitHub = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
)

const IconSlack = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.5 10a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" fill="#36C5F0"/><path d="M9 15.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill="#2EB67D"/><path d="M14 8.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" fill="#ECB22E"/><path d="M15.5 15a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" fill="#E01E5A"/><path d="M10 14h4v-1.5a1.5 1.5 0 0 0-1.5-1.5h-1a1.5 1.5 0 0 0-1.5 1.5V14Z" fill="#E01E5A"/><path d="M8.5 14a1.5 1.5 0 0 0 1.5 1.5h1.5v-1a1.5 1.5 0 0 0-1.5-1.5H8.5v1Z" fill="#ECB22E"/><path d="M15.5 10a1.5 1.5 0 0 0-1.5-1.5H12.5v4a1.5 1.5 0 0 0 1.5 1.5h1.5v-4Z" fill="#36C5F0"/><path d="M14 8.5a1.5 1.5 0 0 0-1.5-1.5h-1v4a1.5 1.5 0 0 0 1.5 1.5h1v-4Z" fill="#2EB67D"/>
  </svg>
)

const IconNotion = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm.111 5.889h3.222v10.222h-3.222V7.889zm-4.333 0h3.222v10.222H7.778V7.889z"/>
  </svg>
)

const IconStripe = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z" fill="#635BFF"/><path d="M6 7H18V9H6V7Z" fill="white"/><path d="M6 11H18V13H6V11Z" fill="white"/><path d="M6 15H14V17H6V15Z" fill="white"/>
  </svg>
)

const IconDiscord = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.482a1.88 1.88 0 0 0-1.635-.482C17.398 3.42 16.02 3 12 3s-5.398.42-6.682 1.001a1.88 1.88 0 0 0-1.635.483c-1.875 1.2-2.325 3.61-1.568 5.711 1.62 4.47 5.063 7.8 9.885 7.8s8.265-3.33 9.885-7.8c.757-2.1-.307-4.51-1.568-5.711ZM8.45 13.4c-.825 0-1.5-.75-1.5-1.65s.675-1.65 1.5-1.65c.825 0 1.5.75 1.5 1.65s-.675 1.65-1.5 1.65Zm7.1 0c-.825 0-1.5-.75-1.5-1.65s.675-1.65 1.5-1.65c.825 0 1.5.75 1.5 1.65s-.675 1.65-1.5 1.65Z" fill="#5865F2"/>
  </svg>
)

const IconX = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231L18.244 2.25zM17.03 19.75h1.866L7.156 4.25H5.16l11.874 15.5z"/>
  </svg>
)

const IconSpotify = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm4.125 14.175c-.188.3-.563.413-.863.225-2.437-1.5-5.5-1.725-9.15-1.012-.338.088-.675-.15-.763-.488-.088-.337.15-.675.488-.762 3.937-.787 7.287-.525 9.975 1.125.3.187.412.562.225.862zm.9-2.7c-.225.363-.675.488-1.037.263-2.7-1.65-6.825-2.1-9.975-1.162-.413.113-.825-.15-1-.562-.15-.413.15-.825.563-1 .362-.112 3.487-.975 6.6 1.312.362.225.487.675.262 1.038v.112zm.113-2.887c-3.225-1.875-8.55-2.025-11.512-1.125-.487.15-.975-.15-1.125-.637-.15-.488.15-.975.638-1.125 3.337-.975 9.15-.787 12.825 1.312.45.263.6.825.337 1.275-.263.45-.825.6-1.275.337v-.038z" fill="#1DB954"/>
  </svg>
)

const IconDropbox = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8l-6 4 6 4 6-4-6-4z" fill="#0061FF"/><path d="M6 12l6 4 6-4-6-4-6 4z" fill="#007BFF"/><path d="M12 16l6-4-6-4-6 4 6 4z" fill="#4DA3FF"/><path d="M18 12l-6-4-6 4 6 4 6-4z" fill="#0061FF"/>
  </svg>
)

const IconTwitch = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.149 0L.707 3.028v17.944h5.66v3.028h3.028l3.028-3.028h4.243l7.07-7.07V0H2.15zm19.799 13.434l-3.535 3.535h-4.95l-3.029 3.029v-3.03H5.14V1.414h16.808v12.02z" fill="#9146FF"/><path d="M15.53 5.303h2.12v6.36h-2.12v-6.36zm-4.95 0h2.12v6.36h-2.12v-6.36z" fill="#9146FF"/>
  </svg>
)

const IconLinear = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="linear-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#5E5CE6" /><stop offset="100%" stopColor="#2C2C2C" /></linearGradient></defs><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-4 9h8v2H8v-2z" fill="url(#linear-grad)"/>
  </svg>
)

const IconYouTube = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.582 6.186A2.482 2.482 0 0 0 19.82 4.42C18.1 4 12 4 12 4s-6.1 0-7.82.42c-.98.26-1.74.98-1.762 1.766C2 7.94 2 12 2 12s0 4.06.418 5.814c.022.786.782 1.506 1.762 1.766C6.1 20 12 20 12 20s6.1 0 7.82-.42c.98-.26 1.74-.98 1.762-1.766C22 16.06 22 12 22 12s0-4.06-.418-5.814zM9.75 15.5V8.5L15.75 12 9.75 15.5z" fill="#FF0000"/>
  </svg>
)

type FeatureCardItem = {
  icon: string
  title: string
  desc: string
}

const FeatureDeck: React.FC<{ features: FeatureCardItem[]; lockRef?: React.RefObject<HTMLElement | null> }> = ({ features, lockRef }) => {
  const deckSceneRef = useRef<HTMLDivElement>(null)
  const wheelBufferRef = useRef(0)
  const [stage, setStage] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)

  const total = features.length

  useEffect(() => {
    const threshold = 260

    const onWheel = (event: WheelEvent) => {
      const scene = lockRef?.current ?? deckSceneRef.current
      if (!scene) {
        wheelBufferRef.current = 0
        return
      }

      const rect = scene.getBoundingClientRect()
      const viewportMid = window.innerHeight * 0.5
      const sceneActive = rect.top <= viewportMid && rect.bottom >= viewportMid
      if (!sceneActive) {
        wheelBufferRef.current = 0
        return
      }

      const scrollingDown = event.deltaY > 0
      const scrollingUp = event.deltaY < 0
      const shouldLockDown = scrollingDown && stage < total
      const shouldLockUp = scrollingUp && stage > 0

      if (!shouldLockDown && !shouldLockUp) {
        wheelBufferRef.current = 0
        return
      }

      event.preventDefault()
      wheelBufferRef.current += event.deltaY

      if (Math.abs(wheelBufferRef.current) < threshold) return

      if (wheelBufferRef.current > 0 && stage < total) {
        setDirection(1)
        setStage((prev) => Math.min(total, prev + 1))
      }

      if (wheelBufferRef.current < 0 && stage > 0) {
        setDirection(-1)
        setStage((prev) => Math.max(0, prev - 1))
      }

      wheelBufferRef.current = 0
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [stage, total])

  const dealtCount = stage
  const activeIndex = dealtCount > 0 ? dealtCount - 1 : -1
  const prevIndex = dealtCount > 1 ? dealtCount - 2 : null

  const deckRemaining = Math.max(0, total - dealtCount)
  const upcomingIndices = Array.from({ length: Math.min(4, deckRemaining) }, (_, layer) => dealtCount + layer)

  const activeCard = activeIndex >= 0 ? features[activeIndex] : null
  const previousCard = prevIndex !== null ? features[prevIndex] : null

  const cardClass = 'flex h-full w-full flex-col rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 p-5 text-slate-100 shadow-[0_20px_45px_rgba(15,23,42,0.35)]'

  return (
    <div ref={deckSceneRef} className="max-w-6xl mx-auto h-full">
      <div className="grid h-full items-start mt-10 gap-8 lg:grid-cols-[18rem_minmax(0,204rem)_18rem]">
        <div className="relative mx-auto h-[22rem] w-full max-w-[16rem]" style={{ perspective: 1200 }}>
          {upcomingIndices.length > 0 ? (
            upcomingIndices.slice().reverse().map((featureIndex, reverseLayerIndex) => {
              const layer = upcomingIndices.length - reverseLayerIndex - 1
              const feature = features[featureIndex]

              return (
                <motion.div
                  key={`deck-${feature.title}`}
                  className="absolute inset-0 rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 p-5 text-slate-100 shadow-[0_18px_35px_rgba(15,23,42,0.35)]"
                  animate={{
                    y: layer * 12,
                    x: layer * -2,
                    rotateZ: layer % 2 === 0 ? -1 : 1,
                    scale: 1 - layer * 0.02,
                  }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  style={{ zIndex: 20 - layer }}
                >
                  <div className="text-2xl">{feature.icon}</div>
                  <h3 className="mt-3 text-lg font-bold text-white" style={{ fontFamily: 'Syne' }}>{feature.title}</h3>
                </motion.div>
              )
            })
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
              Deck finished
            </div>
          )}

          <div className="pointer-events-none absolute -bottom-8 left-0 right-0 text-center text-xs text-slate-500">
            {stage < total ? 'Scroll slowly to deal cards. Page unlocks after all cards are shown.' : 'All cards shown. Continue scrolling.'}
          </div>
        </div>

        <div className="mx-auto h-[24rem] w-full max-w-[24rem]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            {activeCard ? (
              <motion.div
                key={`active-${activeCard.title}`}
                custom={direction}
                initial={{ x: direction === 1 ? -120 : 120, rotateZ: direction === 1 ? -4 : 4 }}
                animate={{ x: 0, rotateZ: 0 }}
                exit={{ x: direction === 1 ? 120 : -120, rotateZ: direction === 1 ? 4 : -4 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className={cardClass}
              >
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-cyan-400 animate-pulse" />
                  <div className="text-xs text-slate-200">MockMate Module</div>
                </div>
                <div className="mt-5 text-3xl">{activeCard.icon}</div>
                <h3 className="mt-3 text-xl font-bold text-white" style={{ fontFamily: 'Syne' }}>{activeCard.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-200">{activeCard.desc}</p>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-300">Enabled</span>
                  <span className="text-sm font-medium text-cyan-300">In focus</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-center"
                initial={{ x: 80 }}
                animate={{ x: 0 }}
                exit={{ x: -80 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={cardClass}
              >
                <div className="my-auto text-center">
                  <p className="text-sm text-slate-200">Scroll to start dealing cards from the deck.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mx-auto h-[24rem] w-full max-w-[16rem]">
          <AnimatePresence initial={false} mode="wait">
            {previousCard ? (
              <motion.div
                key={`previous-${previousCard.title}`}
                initial={{ x: -90, rotateZ: -5 }}
                animate={{ x: 0, rotateZ: 2 }}
                exit={{ x: 100, rotateZ: 6 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex h-full w-full flex-col rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 p-5 text-slate-100 shadow-[0_18px_35px_rgba(15,23,42,0.3)]"
              >
                <div className="text-xs text-slate-200">Previous card</div>
                <div className="mt-4 text-3xl">{previousCard.icon}</div>
                <h3 className="mt-3 text-lg font-bold text-white" style={{ fontFamily: 'Syne' }}>{previousCard.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-200">{previousCard.desc}</p>
              </motion.div>
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
                Dealt cards land here
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/* ── Main Landing ──────────────────────────────── */
const Landing: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state: any) => state.auth)
  const [loaded, setLoaded] = useState(false)
  const [navScrolled, setNavScrolled] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const featureSectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const features = [
    { icon: '🎯', title: 'Role-Specific Questions', desc: 'AI generates tailored questions for 18+ tech roles and experience levels.' },
    { icon: '🎤', title: 'Voice Analysis', desc: 'Record verbal answers with real-time transcription and confidence scoring.' },
    { icon: '💻', title: 'Live Code Editor', desc: 'Monaco-powered editor with 18+ languages and instant syntax highlighting.' },
    { icon: '🧠', title: 'AI Feedback', desc: 'Receive detailed evaluation on technical accuracy, clarity and confidence.' },
    { icon: '📈', title: 'Progress Tracking', desc: 'Visualize improvement over time with per-question performance charts.' },
    { icon: '⚡', title: 'Real-time Updates', desc: 'Socket-powered live evaluation — see scores appear as AI analyzes your answer.' },
  ]

  const steps = [
    { num: '01', title: 'Choose Your Role', desc: 'Select from 18+ tech roles and set your experience level.' },
    { num: '02', title: 'Answer Questions', desc: 'Speak or type your answers in our intelligent interview environment.' },
    { num: '03', title: 'Get AI Feedback', desc: 'Receive detailed analysis with scores, improvements, and ideal answers.' },
  ]

  const heroIcons = [
    { id: 1, icon: IconGoogle, className: 'top-[10%] left-[8%]' },
    { id: 2, icon: IconApple, className: 'top-[10%] right-[8%]' },
    { id: 3, icon: IconMicrosoft, className: 'top-[28%] left-[4%]' },
    { id: 4, icon: IconFigma, className: 'top-[28%] right-[4%]' },
    { id: 5, icon: IconGitHub, className: 'bottom-[28%] left-[6%]' },
    { id: 6, icon: IconSlack, className: 'bottom-[28%] right-[6%]' },
    { id: 7, icon: IconNotion, className: 'top-[48%] left-[12%]' },
    { id: 8, icon: IconStripe, className: 'top-[48%] right-[12%]' },
    { id: 9, icon: IconDiscord, className: 'bottom-[12%] left-[10%]' },
    { id: 10, icon: IconX, className: 'bottom-[12%] right-[10%]' },
    { id: 11, icon: IconSpotify, className: 'top-[8%] left-[30%]' },
    { id: 12, icon: IconDropbox, className: 'top-[8%] right-[30%]' },
    { id: 13, icon: IconTwitch, className: 'bottom-[10%] left-[32%]' },
    { id: 14, icon: IconYouTube, className: 'bottom-[10%] right-[32%]' },
    { id: 15, icon: IconLinear, className: 'top-[18%] left-[50%] -translate-x-1/2' },
  ]

  const testimonialPeople = [
    {
      id: 1,
      name: 'Aarav Sharma',
      designation: 'Frontend Developer',
      image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 2,
      name: 'Neha Kapoor',
      designation: 'Backend Engineer',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 3,
      name: 'Rohan Mehta',
      designation: 'SDE Candidate',
      image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 4,
      name: 'Emily Das',
      designation: 'Data Analyst',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 5,
      name: 'Karan Verma',
      designation: 'Full-stack Developer',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=900&q=80',
    },
  ]

  


  return (
    <div className="landing-body min-h-screen">
      <Preloader onDone={() => setLoaded(true)} />

      <AnimatePresence>
        {loaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="h-screen w-screen overflow-y-auto no-scrollbar snap-y snap-mandatory scroll-smooth overscroll-y-contain"
          >
            {/* ── NAV ── */}
            <nav className={`landing-nav ${navScrolled ? 'scrolled' : ''}`}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#6c63ff,rgba(108,99,255,0.5))' }}>
                  <BrandLogo className="text-white" />
                </div>
                <span className="text-[var(--navy)] font-bold text-base" style={{ fontFamily: 'Syne' }}>
                  MockMate AI
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="hidden md:flex items-center gap-8"
              >
                {['Features', 'How it works', 'Pricing'].map(item => (
                  <a key={item} href={`#${item.toLowerCase().replace(/\s/g,'-')}`} className="nav-link">{item}</a>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex items-center gap-3"
              >
                <Link to="/login" className="btn-outline" style={{ padding: '9px 20px', fontSize: '0.875rem' }}>
                  Sign in
                </Link>
                <Link to="/register" className="btn-glow" style={{ padding: '9px 20px', fontSize: '0.875rem' }}>
                  Get started →
                </Link>
              </motion.div>
            </nav>

            {/* ── HERO ── */}
            <FloatingIconsHero
              ref={heroRef}
              title="Master Every Interview" 
              subtitle="Practice with AI-generated questions tailored to your role. Get real-time feedback on your code and verbal answers."
              ctaText="Start Practicing Free"
              ctaHref="/register"
              icons={heroIcons}
              className="h-screen w-screen snap-start snap-always"
            >
              <motion.div
                className="relative z-10 text-center px-4 max-w-6xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.7 }}
                  className="hero-eyebrow mb-6"
                  style={{ opacity: 1 }}
                >
                  ⟋ AI-Powered Technical Interview Practice
                </motion.div>

                <motion.h1
                  className="hero-title text-[var(--navy)] mb-6"
                  style={{ opacity: 1 }}
                >
                  <motion.span
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8, ease: [0.22,1,0.36,1] }}
                    className="block"
                  >
                    Master Every
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.8, ease: [0.22,1,0.36,1] }}
                    className="block gradient-word"
                  >
                    Interview
                  </motion.span>
                </motion.h1>

                <motion.p
                  className="hero-subtitle max-w-xl mx-auto mb-10"
                  style={{ opacity: 1 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                >
                  Practice smarter with role-based AI interviews and instant feedback.
                </motion.p>

                <motion.div
                  className="hero-cta flex flex-col sm:flex-row gap-4 justify-center items-center"
                  style={{ opacity: 1 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.7 }}
                >
                  <Link to="/register" className="btn-glow text-base px-8 py-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Start Practicing Free
                  </Link>
                  <Link to="/login" className="btn-outline text-base px-8 py-4">
                    Sign in →
                  </Link>
                </motion.div>
              </motion.div>
            </FloatingIconsHero>

            {/* ── 3D DASHBOARD PREVIEW ── */}
            <section className="h-screen w-screen snap-start snap-always px-4 relative flex items-center" style={{ background: 'linear-gradient(180deg, var(--navy) 0%, #0a1228 100%)' }}>
              <SectionIntro className="max-w-6xl mx-auto w-full">
                <Reveal className="grid lg:grid-cols-2 gap-16 items-center">
                  <div>
                    <p className="text-purple-300 text-xs font-mono tracking-widest uppercase mb-4">// Dashboard Preview</p>
                    <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6" style={{ fontFamily: 'Syne' }}>
                      See your growth in{' '}
                      <span className="gradient-text">real time</span>
                    </h2>
                    <p className="text-white/40 text-base leading-relaxed mb-8">
                      Track every answer, score, and improvement over time. Our AI gives you the insights you need to pass your next interview.
                    </p>
                    <div className="space-y-4">
                      {['Live socket-powered evaluations', 'Per-question score breakdown', 'AI-generated ideal answers'].map(item => (
                        <div key={item} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(108,99,255,0.2)', border: '1px solid rgba(108,99,255,0.4)' }}>
                            <div className="w-2 h-2 rounded-full bg-purple-400" />
                          </div>
                          <span className="text-white/60 text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <FloatingDashboard />
                </Reveal>
              </SectionIntro>
            </section>

            {/* ── FEATURES ── */}
            <section ref={featureSectionRef} id="features" className="h-screen w-screen snap-start snap-always px-4 relative overflow-hidden" style={{ background: '#ffffff' }}>
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(circle at 10% 20%, rgba(108,99,255,0.08), transparent 45%), radial-gradient(circle at 90% 85%, rgba(0,212,255,0.08), transparent 40%)'
              }} />
              <SectionIntro className="max-w-6xl mx-auto h-full flex flex-col justify-center pt-20 mt-20" delay={0.08}>
                <div className="text-center">
                  <p className="text-purple-700 text-xs font-mono tracking-widest uppercase mb-4">// Feature System</p>
                  <h2 className="text-4xl md:text-5xl font-bold text-[var(--navy)]" style={{ fontFamily: 'Syne' }}>Tools That Make You
                    <span className="gradient-text"> Interview-Ready</span>
                  </h2>
                  <p className="text-slate-500 mt-4 max-w-2xl mx-auto text-sm">Every card below maps to a real part of your preparation loop: practice, evaluate, iterate, and improve.</p>
                </div>

                <div className="flex-1 min-h-0">
                  <FeatureDeck features={features} lockRef={featureSectionRef} />
                </div>
              </SectionIntro>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section id="how-it-works" className="h-screen w-screen snap-start snap-always px-4 relative flex items-center" style={{ background: 'linear-gradient(180deg, #0a1228 0%, var(--navy) 100%)' }}>
              <div className="absolute inset-0 opacity-30">
                <div className="orb orb-2" style={{ opacity: 0.4 }} />
              </div>
              <SectionIntro className="max-w-4xl mx-auto relative z-10 w-full" delay={0.08}>
                <Reveal className="text-center mb-16">
                  <p className="text-purple-300 text-xs font-mono tracking-widest uppercase mb-4">// How it works</p>
                  <h2 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: 'Syne' }}>
                    Three steps to{' '}
                    <span className="gradient-text">interview ready</span>
                  </h2>
                </Reveal>

                <div className="relative">
                  {/* Connector line */}
                  <div className="absolute top-12 left-0 right-0 h-px hidden lg:block"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(108,99,255,0.3), transparent)' }} />

                  <div className="grid lg:grid-cols-3 gap-8">
                    {steps.map((step, i) => (
                      <Reveal key={step.num} delay={i * 0.15}>
                        <div className="text-center p-6">
                          <div className="w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center relative"
                            style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)' }}>
                            <span className="text-3xl font-bold text-purple-300" style={{ fontFamily: 'JetBrains Mono' }}>{step.num}</span>
                            <div className="absolute inset-0 rounded-3xl" style={{ boxShadow: '0 0 30px rgba(108,99,255,0.15)' }} />
                          </div>
                          <h3 className="text-white font-bold text-xl mb-3" style={{ fontFamily: 'Syne' }}>{step.title}</h3>
                          <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>
              </SectionIntro>
            </section>

            {/* ── STATS BAND ── */}
            <section className="h-screen w-screen snap-start snap-always px-4 flex items-center" style={{ background: '#ffffff', borderTop: '1px solid rgba(15,27,56,0.08)', borderBottom: '1px solid rgba(15,27,56,0.08)' }}>
              <SectionIntro className="max-w-6xl mx-auto w-full" delay={0.1}>
                <div className="text-center mb-12">
                  <p className="text-purple-700 text-xs font-mono tracking-widest uppercase mb-3">// Testimonials</p>
                  <h3 className="text-3xl md:text-4xl font-bold text-[var(--navy)]" style={{ fontFamily: 'Syne' }}>
                    What learners are saying
                  </h3>
                </div>

                <div className="flex justify-center mb-14 pt-10">
                  <AnimatedTooltip items={testimonialPeople} autoPlay intervalMs={2600} />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Mock Interviews', val: 89000, suffix: '+' },
                    { label: 'Tech Roles', val: 18, suffix: '' },
                    { label: 'Score Improvement', val: 34, suffix: '%' },
                    { label: 'Developers', val: 12400, suffix: '+' },
                  ].map(s => (
                    <Reveal key={s.label}>
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
                        <div className="text-[var(--navy)] text-3xl font-bold" style={{ fontFamily: 'Syne' }}>
                          <Counter to={s.val} suffix={s.suffix} />
                        </div>
                        <p className="text-slate-500 text-sm mt-1">{s.label}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </SectionIntro>
            </section>

            {/* ── CTA ── */}
            <section className="h-screen w-screen snap-start snap-always px-4 flex flex-col justify-between" style={{ background: 'var(--navy)' }}>
              <div className="flex-1 flex items-center justify-center">
              <SectionIntro className="max-w-2xl mx-auto text-center w-full" delay={0.08}>
                <div className="glass-card p-10 md:p-14 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <div className="orb orb-1" style={{ width: '400px', height: '400px', top: '-100px', left: '-100px' }} />
                  </div>
                  <div className="relative z-10">
                    <p className="text-purple-300 text-xs font-mono tracking-widest uppercase mb-4">// Ready?</p>
                    <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Syne' }}>
                      Land your dream job
                    </h2>
                    <p className="text-white/40 text-base mb-8 max-w-sm mx-auto">
                      Join thousands of developers who practice smarter and interview better.
                    </p>
                    <Link to="/register" className="btn-glow text-base px-10 py-4">
                      Start for free — no credit card
                    </Link>
                  </div>
                </div>
              </SectionIntro>
              </div>
              
            <footer className="w-full border-t bg-navy-800 py-6" style={{ borderColor: 'rgba(15,27,56,0.1)' }}>
              <div className="max-w-6xl mx-auto px-2 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#6c63ff,rgba(108,99,255,0.5))' }}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <span className="text-slate-700 text-sm" style={{ fontFamily: 'Syne' }}>MockMate AI</span>
                </div>
                <p className="text-slate-500 text-xs">© 2024 MockMate AI. Built with ❤️ for developers.</p>
                <div className="flex gap-6">
                  <Link to="/login" className="text-slate-500 text-xs hover:text-slate-900 transition-colors">Sign in</Link>
                  <Link to="/register" className="text-slate-500 text-xs hover:text-slate-900 transition-colors">Register</Link>
                </div>
              </div>
            </footer>
            </section>

            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Landing
