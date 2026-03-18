import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createSession, getSessions, reset, deleteSession } from '../features/sessions/sessionSlice'
import { toast } from 'react-toastify'
import SessionCard from '../components/SessionCard'
import { motion } from 'framer-motion'
import { AppDispatch } from '@/app/store'

const ROLES = [
  "MERN Stack Developer","MEAN Stack Developer","Full Stack Python","Full Stack Java",
  "Frontend Developer","Backend Developer","Data Scientist","Data Analyst",
  "Machine Learning Engineer","DevOps Engineer","Cloud Engineer (AWS/Azure/GCP)",
  "Cybersecurity Engineer","Blockchain Developer","Mobile Developer (iOS/Android)",
  "Game Developer","UI/UX Designer","QA Automation Engineer","Product Manager"
]
const LEVELS = ["Junior","Mid-Level","Senior"]
const TYPES = [{ label: 'Oral Only', value: 'oral-only' }, { label: 'Coding Mix', value: 'coding-mix' }]
const COUNTS = [5, 10, 15]

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { user } = useSelector((state: any) => state.auth)
  const { sessions, isLoading, isGenerating, isError, message } = useSelector((state: any) => state.sessions)

  const [formData, setFormData] = useState({
    role: user.preferredRole || ROLES[0],
    level: LEVELS[0],
    interviewType: TYPES[1].value,
    count: COUNTS[0],
  })

  useEffect(() => { dispatch(getSessions() as any) }, [dispatch])
  useEffect(() => {
    if (isError && message) { toast.error(message); dispatch(reset()) }
  }, [isError, message, dispatch])

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); dispatch(createSession(formData)) }

  const viewSession = (session: any) => {
    if (session.status === 'completed') navigate(`/review/${session._id}`)
    else if (session.status === 'in-progress') navigate(`/interview/${session._id}`)
    else toast.info('Session not ready yet')
  }

  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    if (window.confirm('Delete this session?')) {
      dispatch(deleteSession(sessionId) as any)
      toast.error('Session deleted')
    }
  }

  const completed = sessions.filter((s: any) => s.status === 'completed')
  const avgScore = completed.length > 0
    ? Math.round(completed.reduce((sum: number, s: any) => sum + (s.overallScore || 0), 0) / completed.length)
    : null

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">

      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1" style={{ fontFamily: 'JetBrains Mono' }}>
            Good to see you
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy" style={{ fontFamily: 'Syne' }}>
            {user.name.split(' ')[0]} <span style={{ color: 'var(--purple)' }}>👋</span>
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Ready for your next technical challenge?</p>
        </div>

        <div className="flex gap-3">
          <StatPill label="Sessions" value={sessions.length} />
          {avgScore !== null && <StatPill label="Avg Score" value={`${avgScore}%`} accent />}
        </div>
      </motion.div>

      {/* New Interview */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="app-card overflow-hidden"
      >
        {/* Dark header */}
        <div className="px-6 py-5 flex items-center gap-3 relative overflow-hidden"
          style={{ background: 'var(--navy)' }}>
          <div className="absolute inset-0 opacity-50"
            style={{
              backgroundImage: 'linear-gradient(rgba(108,99,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.1) 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }} />
          <div className="relative z-10 w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(108,99,255,0.2)', border: '1px solid rgba(108,99,255,0.3)' }}>
            <svg className="w-4 h-4" style={{ color: '#8b85ff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="relative z-10">
            <h2 className="font-bold text-white text-base" style={{ fontFamily: 'Syne' }}>New Interview Session</h2>
            <p className="text-white/35 text-xs">AI-generated questions for your role</p>
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full blur-2xl"
            style={{ background: 'rgba(108,99,255,0.2)' }} />
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="field-label">Role</label>
              <div className="relative">
                <select name="role" value={formData.role} onChange={onChange} className="select-field">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <Chevron />
              </div>
            </div>

            <div>
              <label className="field-label">Level</label>
              <div className="flex gap-1.5">
                {LEVELS.map(l => (
                  <LevelBtn key={l} label={l} active={formData.level === l}
                    onClick={() => setFormData(p => ({ ...p, level: l }))} />
                ))}
              </div>
            </div>

            <div>
              <label className="field-label">Format</label>
              <div className="flex gap-1.5">
                {TYPES.map(t => (
                  <LevelBtn key={t.value} label={t.label} active={formData.interviewType === t.value}
                    onClick={() => setFormData(p => ({ ...p, interviewType: t.value }))} />
                ))}
              </div>
            </div>

            <div>
              <label className="field-label">Questions</label>
              <div className="flex gap-1.5">
                {COUNTS.map(c => (
                  <LevelBtn key={c} label={String(c)} active={formData.count == c}
                    onClick={() => setFormData(p => ({ ...p, count: c }))} />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            <p className="text-xs text-slate-400 flex-1 hidden sm:block">
              Personalized questions based on your role & level
            </p>
            <motion.button
              type="submit"
              disabled={isGenerating}
              className="btn-purple"
              whileHover={!isGenerating ? { scale: 1.02 } : {}}
              whileTap={!isGenerating ? { scale: 0.97 } : {}}
              style={{ padding: '11px 24px' }}
            >
              {isGenerating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Start Interview
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* History */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-navy flex items-center gap-2" style={{ fontFamily: 'Syne' }}>
            <span className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-sm">📊</span>
            Interview History
          </h2>
          {sessions.length > 0 && (
            <span className="text-xs text-slate-400">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {isLoading && sessions.length === 0 ? (
          <div className="flex justify-center py-16"><div className="spinner" /></div>
        ) : sessions.length === 0 ? (
          <div className="app-card py-16 text-center border-2 border-dashed border-slate-100">
            <div className="text-3xl mb-3">🎯</div>
            <p className="font-semibold text-slate-600 text-sm">No interviews yet</p>
            <p className="text-slate-400 text-xs mt-1">Start your first session above</p>
          </div>
        ) : (
          <div className="space-y-3 stagger">
            {sessions.map((session: any) => (
              <SessionCard key={session._id} session={session} onClick={viewSession} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

const StatPill: React.FC<{ label: string; value: string | number; accent?: boolean }> = ({ label, value, accent }) => (
  <div className={`px-4 py-2.5 rounded-2xl border text-center ${accent ? 'border-purple-200' : 'bg-white border-slate-200'}`}
    style={accent ? { background: 'var(--purple-pale)', borderColor: 'rgba(108,99,255,0.2)' } : {}}>
    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
    <p className={`text-xl font-bold leading-none mt-0.5`} style={{ fontFamily: 'Syne', color: accent ? 'var(--purple)' : 'var(--navy)' }}>{value}</p>
  </div>
)

const LevelBtn: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <motion.button
    type="button" onClick={onClick}
    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
      active ? 'text-white border-transparent' : 'text-slate-500 bg-slate-50 border-slate-200 hover:border-slate-300'
    }`}
    style={active ? { background: 'var(--navy)', borderColor: 'transparent' } : {}}
    whileTap={{ scale: 0.96 }}
  >
    {label}
  </motion.button>
)

const Chevron = () => (
  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
)

export default Dashboard
