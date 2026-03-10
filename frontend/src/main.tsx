import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { GoogleOAuthProvider } from '@react-oauth/google'
import axios from 'axios'
import './index.css'
import App from './App'
import store from './app/store'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

// Auto-redirect root to /landing for first-time visitors
// (PrivateRoute handles redirect to /login if unauthenticated)
const Root = () => (
  <Routes>
    <Route path="/landing" element={<></>} />
    <Route path="*" element={<App />} />
  </Routes>
)

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url?.includes('login')) {
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// If user visits root and no token, land them on /landing
const handleInitialRoute = () => {
  const user = localStorage.getItem('user')
  if (!user && window.location.pathname === '/') {
    window.history.replaceState(null, '', '/landing')
  }
}
handleInitialRoute()

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  </GoogleOAuthProvider>
)
