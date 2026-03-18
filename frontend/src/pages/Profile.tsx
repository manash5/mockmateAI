import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { updateProfile, reset } from '../features/auth/authSlice'
import { motion } from 'framer-motion'

const ROLES = [
  "MERN Stack Developer","MEAN Stack Developer","Full Stack Python","Full Stack Java",
  "Frontend Developer","Backend Developer","Data Scientist","Data Analyst",
  "Machine Learning Engineer","DevOps Engineer","Cloud Engineer (AWS/Azure/GCP)",
  "Cybersecurity Engineer","Blockchain Developer","Mobile Developer (iOS/Android)",
  "Game Developer","UI/UX Designer","QA Automation Engineer","Product Manager"
]

const Profile: React.FC = () => {
  const dispatch = useDispatch()
  const { user, isSuccess, isError, message, isProfileLoading } = useSelector((state: any) => state.auth)
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '', password: user?.password || '',  preferredRole: user?.preferredRole || '' })

  useEffect(() => {
    if (!isError && !isSuccess) return
    if (isError) toast.error(message)
    if (isSuccess) toast.success('Profile updated!')
    dispatch(reset())
  }, [isError, isSuccess, message, dispatch])

  useEffect(() => {
    if (user) setFormData({ name: user.name || '', email: user.email || '', preferredRole: user.preferredRole || '' , password: user?.password || '',})
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name === user.name && formData.preferredRole === user.preferredRole) { toast.info('No changes to save.'); return }
    dispatch(updateProfile(formData) as any); 
  }

  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-16">
      {/* Avatar card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="app-card p-6 flex items-center gap-5"
      >
        <motion.div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,var(--purple),var(--cyan))', fontFamily: 'Syne' }}
          whileHover={{ scale: 1.05, rotate: -4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          {initials}
        </motion.div>
        <div>
          <h1 className="text-xl font-bold text-navy" style={{ fontFamily: 'Syne' }}>{user?.name}</h1>
          <p className="text-sm text-slate-400 mt-0.5">{user?.email}</p>
          {user?.preferredRole && (
            <span className="inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(108,99,255,0.08)', color: 'var(--purple)', border: '1px solid rgba(108,99,255,0.15)' }}>
              {user.preferredRole}
            </span>
          )}
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="app-card p-6"
      >
        <h2 className="text-base font-bold text-navy mb-5" style={{ fontFamily: 'Syne' }}>Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange}
              className="input-field" placeholder="Your name" />
          </div>
          <div className="opacity-55">
            <label className="field-label">Email <span className="normal-case tracking-normal font-normal text-slate-300">(locked)</span></label>
            <input type="email" disabled value={formData.email}
              className="input-field cursor-not-allowed" style={{ background: 'var(--slate-100)', color: 'var(--slate-400)' }} />
          </div>
          <div>
            <label className="field-label">Target Role</label>
            <div className="relative">
              <select name="preferredRole" value={formData.preferredRole} onChange={handleChange} className="select-field">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <motion.button
            type="submit"
            disabled={isProfileLoading}
            className="btn-primary w-full mt-2"
            style={{ padding: '13px 24px' }}
            whileHover={!isProfileLoading ? { y: -1 } : {}}
            whileTap={!isProfileLoading ? { scale: 0.98 } : {}}
          >
            {isProfileLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : 'Save Changes'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

export default Profile
