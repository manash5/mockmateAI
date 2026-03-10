import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, reset } from '../features/auth/authSlice'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandLogo } from './ui/brand-logo'

const Header: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user } = useSelector((state: any) => state.auth)

  const onLogout = () => {
    dispatch(logout() as any)
    dispatch(reset())
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <header className='sticky top-0 z-50 w-full glass border-b border-white/60 shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between'>
        {/* Logo */}
        <Link to='/' className='flex items-center gap-2.5 group'>
          <div className='w-8 h-8 rounded-xl bg-navy flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow'>
            <BrandLogo className=' text-purple-light' animated={false} />
          </div>
          <div className='flex flex-col leading-none'>
            <span className='text-sm font-700 tracking-tight text-navy'>MockMate AI</span>
            <span className='text-[10px] text-slate-400 font-500 tracking-wider uppercase'>Practice Platform</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className='hidden md:flex items-center gap-1'>
          {user ? (
            <>
              <NavLink to='/' active={isActive('/')}>Dashboard</NavLink>
              <NavLink to='/profile' active={isActive('/profile')}>Profile</NavLink>
              <div className='flex items-center gap-2 ml-2 bg-navy/5 rounded-2xl px-3 py-1.5 border border-navy/10'>
                <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
                <span className='text-xs font-600 text-navy/70'>{user.name.split(' ')[0]}</span>
              </div>
              <button
                onClick={onLogout}
                className='ml-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-700 rounded-xl transition-all uppercase tracking-wide border border-rose-100 hover:border-rose-200'
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to='/login' active={isActive('/login')}>Sign In</NavLink>
              <Link
                to='/register'
                className='ml-2 px-4 py-2 bg-navy text-white text-sm font-600 rounded-xl hover:bg-navy-700 transition-all shadow-sm'
              >
                Get Started
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className='md:hidden w-9 h-9 rounded-xl bg-navy/5 border border-navy/10 flex items-center justify-center text-navy/60 hover:text-navy transition-colors'
        >
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            {isMenuOpen
              ? <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
              : <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 6h16M4 12h16M4 18h16' />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className='md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg'
          >
            <div className='p-6 space-y-2'>
              {user ? (
                <>
                  <div className='flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-100'>
                    <div className='w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse'></div>
                    <span className='font-600 text-navy text-sm'>{user.name}</span>
                  </div>
                  <MobileNavLink to='/' onClick={() => setIsMenuOpen(false)} active={isActive('/')}>Dashboard</MobileNavLink>
                  <MobileNavLink to='/profile' onClick={() => setIsMenuOpen(false)} active={isActive('/profile')}>Profile</MobileNavLink>
                  <button onClick={onLogout} className='w-full mt-3 bg-rose-50 text-rose-600 py-3 rounded-2xl font-700 text-sm border border-rose-100'>
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <MobileNavLink to='/login' onClick={() => setIsMenuOpen(false)} active={isActive('/login')}>Sign In</MobileNavLink>
                  <MobileNavLink to='/register' onClick={() => setIsMenuOpen(false)} active={isActive('/register')}>Register</MobileNavLink>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

const NavLink: React.FC<{ to: string; active: boolean; children: React.ReactNode }> = ({ to, active, children }) => (
  <Link
    to={to}
    className={`px-4 py-2 rounded-xl text-sm font-500 transition-all ${
      active
        ? 'bg-navy/8 text-navy font-600'
        : 'text-slate-500 hover:text-navy hover:bg-navy/5'
    }`}
  >
    {children}
  </Link>
)

const MobileNavLink: React.FC<{ to: string; onClick: () => void; active: boolean; children: React.ReactNode }> = ({ to, onClick, active, children }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`block py-3 px-4 rounded-2xl text-sm font-500 transition-all ${
      active ? 'bg-purple-pale text-purple font-600' : 'text-slate-600 hover:bg-slate-50'
    }`}
  >
    {children}
  </Link>
)

export default Header
