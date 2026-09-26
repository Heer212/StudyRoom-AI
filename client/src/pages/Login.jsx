import { GoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useState } from 'react'
import { Sparkles } from 'lucide-react'

function Login() {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await axios.post('/api/auth/login', formData)
      setUser(res.data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('/api/auth/google', {
        token: credentialResponse.credential,
      })
      setUser(res.data)
      navigate('/dashboard')
    } catch (err) {
      console.error('Backend verification failed:', err)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 flex flex-col items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-amber-500/30">
          <Sparkles size={28} />
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Welcome back
          </h1>
          <p className="text-sm text-slate-500 mt-1">Log in to continue studying.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
          <input
            name="email" type="email" placeholder="Email Address" required
            value={formData.email} onChange={handleChange}
            className="p-3 rounded-2xl text-sm border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
          />
          <input
            name="password" type="password" placeholder="Password" required
            value={formData.password} onChange={handleChange}
            className="p-3 rounded-2xl text-sm border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
          />
          {error && <p className="text-rose-600 text-xs font-medium">{error}</p>}

          <button
            type="submit"
            className="mt-1 bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-md shadow-amber-500/20 transition-all"
          >
            Log In
          </button>
        </form>

        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">or</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log('Login Failed')} />

        <p className="text-slate-500 text-sm">
          Don't have an account?{' '}
          <button onClick={() => navigate('/register')} className="text-amber-600 font-semibold hover:text-amber-700">
            Register here
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login