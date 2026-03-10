import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { login, googleLogin, reset } from '../features/auth/authSlice'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { GoogleLogin } from '@react-oauth/google'
import { motion } from 'framer-motion'
import { BackgroundPaths } from '../components/ui/background-paths'
import { BrandLogo } from '../components/ui/brand-logo'

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const { email, password } = formData
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isLoading, isError, isSuccess, message } = useSelector((state: any) => state.auth)

  useEffect(() => {
    if (isError) { toast.error(message); dispatch(reset()) }
    if (isSuccess || user) { navigate('/'); dispatch(reset()) }
  }, [user, isError, isSuccess, message, navigate, dispatch])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(login({ email, password }) as any)
  }

  const handleGoogleSuccess = (cred: any) => {
    if (cred.credential) dispatch(googleLogin(cred.credential) as any)
    else toast.error('Google login failed')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" />
          <p className="text-slate-400 text-sm">Signing you in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--navy)' }}>
        <BackgroundPaths />
        {/* Orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.25) 0%, transparent 70%)' }} />
        <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)' }} />

        <div className="relative z-10">
          <Link to="/landing" className="flex items-center gap-3 group">
            <motion.div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#6c63ff,rgba(108,99,255,0.5))' }}
              whileHover={{ rotate: -8, scale: 1.05 }}
            >
              <BrandLogo className="text-white" />
            </motion.div>
            <span className="text-white font-bold" style={{ fontFamily: 'Syne' }}>MockMate AI</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight" style={{ fontFamily: 'Syne' }}>
              Sharpen your skills.<br />
              <span style={{ background: 'linear-gradient(135deg,#8b85ff,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Land the job.
              </span>
            </h2>
            <p className="text-white/40 text-sm mt-3 leading-relaxed max-w-xs">
              Practice with AI-generated questions. Get scored on technical depth, confidence, and clarity.
            </p>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['#6c63ff','#00d4ff','#00e5a0','#fbbf24'].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-navy flex items-center justify-center text-xs text-white font-bold"
                  style={{ background: c }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="text-white/40 text-xs">12,400+ developers practicing</p>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/20 text-xs" style={{ fontFamily: 'JetBrains Mono' }}>// version 2.0 — 2024</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 lg:max-w-md flex flex-col items-center justify-center p-8 sm:p-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#6c63ff,rgba(108,99,255,0.5))' }}>
              <BrandLogo className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-navy" style={{ fontFamily: 'Syne' }}>MockMate AI</span>
          </div>

          <h1 className="text-3xl font-bold text-navy mb-1" style={{ fontFamily: 'Syne' }}>Welcome back</h1>
          <p className="text-slate-400 text-sm mb-8">Sign in to continue your practice sessions</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="field-label">Email</label>
              <input type="email" name="email" value={email} onChange={onChange}
                className="input-field" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input type="password" name="password" value={password} onChange={onChange}
                className="input-field" placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn-primary w-full mt-2" style={{ padding: '13px 24px' }}>
              Sign in
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google login failed')}
              theme="outline" size="large" text="continue_with" shape="rectangular"
            />
          </div>

          <p className="mt-8 text-center text-sm text-slate-400">
            New here?{' '}
            <Link to="/register" className="font-semibold transition-colors" style={{ color: 'var(--purple)' }}>
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
