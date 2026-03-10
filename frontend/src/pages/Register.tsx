import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { register, reset } from '../features/auth/authSlice'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { BackgroundPaths } from '../components/ui/background-paths'
import { BrandLogo } from '../components/ui/brand-logo'

const Register: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', password2: '' })
  const { name, email, password, password2 } = formData
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isLoading, isError, isSuccess, message } = useSelector((state: any) => state.auth)

  useEffect(() => {
    if (isError) { toast.error(message); dispatch(reset()) }
    if (isSuccess) { toast.success('Account created!'); navigate('/'); dispatch(reset()) }
    if (user && !isSuccess) navigate('/')
  }, [user, isError, isSuccess, message, navigate, dispatch])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== password2) toast.error('Passwords do not match')
    else dispatch(register({ name, email, password }) as any)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" />
          <p className="text-slate-400 text-sm">Creating your account...</p>
        </div>
      </div>
    )
  }

  const features = [
    { icon: '🎯', text: 'Role-specific question generation' },
    { icon: '🎤', text: 'Voice & code answer support' },
    { icon: '🧠', text: 'Detailed AI feedback and scoring' },
    { icon: '📈', text: 'Progress tracking over time' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--navy)' }}>
        <BackgroundPaths />
        <div className="absolute top-10 right-10 w-80 h-80 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-20 left-10 w-64 h-64 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.2) 0%, transparent 70%)' }} />

        <div className="relative z-10">
          <Link to="/landing" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#6c63ff,rgba(108,99,255,0.5))' }}>
              <BrandLogo className="text-white" />
            </div>
            <span className="text-white font-bold" style={{ fontFamily: 'Syne' }}>MockMate AI</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight" style={{ fontFamily: 'Syne' }}>
              Your interview<br />
              <span style={{ background: 'linear-gradient(135deg,#8b85ff,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                transformation starts here
              </span>
            </h2>
          </div>

          <div className="space-y-3">
            {features.map((f, i) => (
              <motion.div
                key={f.text}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.2)' }}>
                  {f.icon}
                </div>
                <span className="text-white/50 text-sm">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/20 text-xs" style={{ fontFamily: 'JetBrains Mono' }}>// Free to start — no credit card</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 lg:max-w-md flex flex-col items-center justify-center p-8 sm:p-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#6c63ff,rgba(108,99,255,0.5))' }}>
              <BrandLogo className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-navy" style={{ fontFamily: 'Syne' }}>MockMate AI</span>
          </div>

          <h1 className="text-3xl font-bold text-navy mb-1" style={{ fontFamily: 'Syne' }}>Create account</h1>
          <p className="text-slate-400 text-sm mb-8">Join thousands of developers practicing smarter</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="field-label">Full name</label>
              <input type="text" name="name" value={name} onChange={onChange}
                className="input-field" placeholder="Your name" required />
            </div>
            <div>
              <label className="field-label">Email</label>
              <input type="email" name="email" value={email} onChange={onChange}
                className="input-field" placeholder="you@example.com" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label">Password</label>
                <input type="password" name="password" value={password} onChange={onChange}
                  className="input-field" placeholder="••••••••" required />
              </div>
              <div>
                <label className="field-label">Confirm</label>
                <input type="password" name="password2" value={password2} onChange={onChange}
                  className="input-field" placeholder="••••••••" required />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full mt-2" style={{ padding: '13px 24px' }}>
              Create account →
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold transition-colors" style={{ color: 'var(--purple)' }}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Register
