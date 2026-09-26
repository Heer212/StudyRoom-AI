import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState('email') // 'email' | 'otp' | 'reset'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/forgot-password', { email })
      setMessage(res.data.message)
      setStep('otp')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await axios.post('/api/auth/verify-otp', { email, otp })
      setStep('reset')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await axios.post('/api/auth/reset-password', { email, otp, newPassword })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password')
    } finally {
      setLoading(false)
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
            {step === 'email' && 'Reset your password'}
            {step === 'otp' && 'Enter the code'}
            {step === 'reset' && 'Set a new password'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {step === 'email' && "We'll send a code to your email."}
            {step === 'otp' && `Check ${email} for a 6-digit code.`}
            {step === 'reset' && 'Choose a new password for your account.'}
          </p>
        </div>

        {message && step === 'otp' && (
          <p className="text-emerald-600 text-xs font-medium bg-emerald-50 px-3 py-2 rounded-xl w-full text-center">{message}</p>
        )}

        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-3 w-full">
            <input
              type="email" placeholder="Email Address" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="p-3 rounded-2xl text-sm border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
            />
            {error && <p className="text-rose-600 text-xs font-medium">{error}</p>}
            <button type="submit" disabled={loading}
              className="mt-1 bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-md shadow-amber-500/20 transition-all disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Code'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3 w-full">
            <input
              type="text" placeholder="6-digit code" required maxLength={6}
              value={otp} onChange={(e) => setOtp(e.target.value)}
              className="p-3 rounded-2xl text-sm text-center tracking-[0.5em] font-bold border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
            />
            {error && <p className="text-rose-600 text-xs font-medium">{error}</p>}
            <button type="submit" disabled={loading}
              className="mt-1 bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-md shadow-amber-500/20 transition-all disabled:opacity-50">
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-3 w-full">
            <input
              type="password" placeholder="New password" required
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="p-3 rounded-2xl text-sm border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
            />
            {error && <p className="text-rose-600 text-xs font-medium">{error}</p>}
            <button type="submit" disabled={loading}
              className="mt-1 bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-md shadow-amber-500/20 transition-all disabled:opacity-50">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <button onClick={() => navigate('/')} className="text-slate-500 text-sm hover:text-slate-700">
          Back to login
        </button>
      </div>
    </div>
  )
}

export default ForgotPassword