import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuthStore } from './store/authStore'
import { socket } from './socket'

import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import RoomDetails from './pages/RoomDetails'

function App() {
  const setUser = useAuthStore((state) => state.setUser)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  axios.get('/api/auth/me')
    .then(res => {
      setUser(res.data)
      socket.connect()
    })
    .catch(() => setUser(null))
    .finally(() => setLoading(false))
}, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#12141C', color: '#7D8199' }}>
        Loading...
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/rooms/:id" element={<RoomDetails />} /> 
      </Routes>
    </BrowserRouter>
  )
}

export default App