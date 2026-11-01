import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Sparkles } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const FREE_FEATURES = ['2 study rooms', '5 members per room', '10 AI questions per day', 'Limited file storage']
const PREMIUM_FEATURES = ['Unlimited study rooms', 'More members per room', 'Unlimited AI questions', 'More storage', 'Advanced progress analytics']

function Pricing() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const [billing, setBilling] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const sub = user?.subscription
  const isPremium = sub?.plan === 'premium' && new Date(sub.endDate) > new Date()

  const handleUpgrade = async () => {
    setError('')
    setLoading(true)
    try {
      const { data } = await axios.post('/api/payments/create-order', { billing })

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'StudyRoom AI',
        description: `Premium (${billing})`,
        order_id: data.orderId,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#F59E0B' },
        handler: async (response) => {
          try {
            const res = await axios.post('/api/payments/verify', response)
            setUser(res.data)
            setSuccess(true)
          } catch {
            setError('Payment went through but verification failed. Please contact support.')
          } finally {
            setLoading(false)
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      })

      rzp.on('payment.failed', (r) => {
        setError(r.error?.description || 'Payment failed')
        setLoading(false)
      })

      rzp.open()
    } catch (err) {
      setError(err.response?.data?.error || 'Could not start payment')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-6 py-10" style={{ background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm font-semibold mb-6 text-slate-500 hover:text-slate-700">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Choose your plan</h1>
          <p className="text-sm text-slate-500 mt-1">Learn together. Stay consistent. Achieve more.</p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {['monthly', 'yearly'].map((b) => (
            <button key={b} onClick={() => setBilling(b)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold capitalize transition-all ${
                billing === b ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'text-slate-500 hover:bg-slate-200/60'
              }`}>
              {b}
            </button>
          ))}
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium text-center">
            You're now on Premium. Enjoy unlimited rooms!
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium text-center">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl p-6 bg-white border border-slate-200/90 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Free</h2>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">₹0</p>
            <ul className="mt-5 space-y-2.5">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-slate-400" /> {f}</li>
              ))}
            </ul>
            <div className="mt-6 text-center text-xs font-semibold text-slate-400">{isPremium ? '' : 'Your current plan'}</div>
          </div>

          <div className="rounded-3xl p-6 bg-white border-2 border-amber-400 shadow-md shadow-amber-500/10">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Premium</h2>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">
              {billing === 'monthly' ? '₹149' : '₹1499'}
              <span className="text-sm font-medium text-slate-400"> / {billing === 'monthly' ? 'month' : 'year'}</span>
            </p>
            <ul className="mt-5 space-y-2.5">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-amber-500" /> {f}</li>
              ))}
            </ul>
            <button onClick={handleUpgrade} disabled={loading}
              className="mt-6 w-full py-3 rounded-2xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50">
              {loading ? 'Processing...' : isPremium ? 'Extend Premium' : 'Upgrade to Premium'}
            </button>
            {isPremium && (
              <p className="text-xs text-slate-400 text-center mt-2">Active until {new Date(sub.endDate).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing