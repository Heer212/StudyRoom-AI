import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Users, Plus, Trash2, CheckCircle2, Upload, FileText, Image as ImageIcon, File, Download, Shield } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { socket } from '../socket'
import { Send } from 'lucide-react'

const COLORS = {
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  accent: '#F59E0B',
  teal: '#0284C7',
  text: '#0F172A',
  muted: '#64748B',
}

function getFileIcon(fileType) {
  if (!fileType) return File
  if (fileType.startsWith('image/')) return ImageIcon
  if (fileType === 'application/pdf') return FileText
  return File
}

function RoomDetails() {
  const user = useAuthStore((state) => state.user)
  const { id } = useParams()
  const navigate = useNavigate()

  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  const [plan, setPlan] = useState(null)
  const [planLoading, setPlanLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [weeks, setWeeks] = useState([{ title: '', tasksText: '' }])

  const [resources, setResources] = useState([])
  const [resourcesLoading, setResourcesLoading] = useState(true)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadFile, setUploadFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const chatEndRef = useState(null)

  const fetchRoom = () => {
    axios.get(`/api/rooms/${id}`)
      .then((res) => setRoom(res.data))
      .catch(() => setRoom(null))
      .finally(() => setLoading(false))
  }

  const fetchPlan = () => {
    axios.get(`/api/plans/${id}`)
      .then((res) => setPlan(res.data))
      .catch(() => setPlan(null))
      .finally(() => setPlanLoading(false))
  }

  const fetchResources = () => {
    axios.get(`/api/resources/${id}`)
      .then((res) => setResources(res.data))
      .catch(() => setResources([]))
      .finally(() => setResourcesLoading(false))
  }

  useEffect(() => {
    fetchRoom()
    fetchPlan()
    fetchResources()
  }, [id])

  useEffect(() => {
  axios.get(`/api/messages/${id}`).then((res) => setMessages(res.data))

  socket.emit('joinRoom', id)

  const handleReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message])
    }

    socket.on('receiveMessage', handleReceiveMessage)

    return () => {
      socket.emit('leaveRoom', id)
      socket.off('receiveMessage', handleReceiveMessage)
    }
  }, [id])

  const handleJoin = async () => {
    setJoining(true)
    try {
      const res = await axios.post(`/api/rooms/${id}/join`)
      setRoom(res.data)
    } catch (err) {
      console.error('Failed to join room:', err.response?.data?.error || err.message)
    } finally {
      setJoining(false)
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!messageInput.trim()) return

    socket.emit('sendMessage', {
      roomId: id,
      content: messageInput,
      sender: user,
    })
    setMessageInput('')
  }

  const addWeek = () => setWeeks([...weeks, { title: '', tasksText: '' }])
  const removeWeek = (i) => setWeeks(weeks.filter((_, idx) => idx !== i))
  const updateWeek = (i, field, value) => {
    const copy = [...weeks]
    copy[i][field] = value
    setWeeks(copy)
  }

  const handleCreatePlan = async (e) => {
    e.preventDefault()
    const payload = weeks
      .filter((w) => w.title.trim())
      .map((w) => ({
        title: w.title,
        tasks: w.tasksText.split(',').map((t) => t.trim()).filter(Boolean).map((title) => ({ title })),
      }))

    try {
      const res = await axios.post(`/api/plans/${id}`, { weeks: payload })
      setPlan(res.data)
      setShowPlanForm(false)
    } catch (err) {
      console.error('Failed to create plan:', err.response?.data?.error || err.message)
    }
  }

  const toggleTask = async (weekId, taskId) => {
    try {
      const res = await axios.patch(`/api/plans/${plan._id}/weeks/${weekId}/tasks/${taskId}/toggle`)
      setPlan(res.data)
    } catch (err) {
      console.error('Failed to toggle task:', err)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    setUploadError('')
    if (!uploadFile) {
      setUploadError('Please choose a file first')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', uploadFile)
    formData.append('title', uploadTitle || uploadFile.name)

    try {
      await axios.post(`/api/resources/${id}`, formData)
      setUploadTitle('')
      setUploadFile(null)
      fetchResources()
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.bg, color: COLORS.muted }}>Loading...</div>
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: COLORS.bg, color: COLORS.text }}>
        <p className="font-medium">Room not found.</p>
        <button onClick={() => navigate('/dashboard')} className="text-sm font-semibold" style={{ color: COLORS.accent }}>
          Back to Dashboard
        </button>
      </div>
    )
  }

  const isMember = room.members.some((member) => member._id === user?._id)
  const isOwner = room.owner?._id === user?._id

  let totalTasks = 0
  let completedTasks = 0
  if (plan) {
    plan.weeks.forEach((week) => {
      week.tasks.forEach((task) => {
        totalTasks++
        if (task.completedBy.some((uid) => uid === user?._id || uid?._id === user?._id)) {
          completedTasks++
        }
      })
    })
  }
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="min-h-screen px-6 sm:px-10 py-10" style={{ background: COLORS.bg, fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm font-semibold mb-6 hover:text-slate-700 transition-colors" style={{ color: COLORS.muted }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="rounded-3xl p-6 mb-6 bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-700">{room.members.length} active</span>
            </div>
            {isOwner && (
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1 font-semibold">
                <Shield size={10} /> Owner
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: COLORS.text, fontFamily: 'Space Grotesk, sans-serif' }}>
            {room.name}
          </h1>
          {room.description && <p className="mb-4 text-sm" style={{ color: COLORS.muted }}>{room.description}</p>}

          <div className="flex flex-wrap gap-2 mb-4">
            {room.topics.map((topic) => (
              <span key={topic} className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 border border-slate-200/60">
                #{topic}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-sm" style={{ color: COLORS.muted }}>
            <Users size={14} />
            {room.members.length} member{room.members.length !== 1 ? 's' : ''} · owned by {room.owner?.name}
          </div>

          {!isMember && (
            <button onClick={handleJoin} disabled={joining}
              className="mt-4 px-4 py-2 rounded-2xl text-xs font-bold text-white shadow-md shadow-amber-500/20 transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: COLORS.accent }}>
              {joining ? 'Joining...' : 'Join Room'}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar">
          {['overview', 'plan', 'resources','chat'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 rounded-2xl font-semibold text-xs transition-all whitespace-nowrap ${
                tab === t
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {t === 'overview' ? 'Members' : t === 'plan' ? 'Study Plan' : t === 'resources' ? 'Resources' : 'Chat'}
            </button>
          ))}
        </div>

        {/* Overview / Members tab */}
        {tab === 'overview' && (
          <div className="rounded-3xl p-6 bg-white border border-slate-200/90 shadow-sm">
            <h2 className="text-base font-bold mb-4" style={{ color: COLORS.text, fontFamily: 'Space Grotesk, sans-serif' }}>Members</h2>
            <div className="flex flex-col gap-3">
              {room.members.map((member) => (
                <div key={member._id} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                  {member.picture && <img src={member.picture} alt={member.name} className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-100" />}
                  <span className="text-sm font-medium" style={{ color: COLORS.text }}>{member.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Study Plan tab */}
        {tab === 'plan' && (
          <div>
            {planLoading && <p className="text-sm" style={{ color: COLORS.muted }}>Loading plan...</p>}

            {!planLoading && !plan && !isOwner && (
              <div className="rounded-3xl p-10 text-center bg-white border border-dashed border-slate-300">
                <p className="font-semibold text-sm" style={{ color: COLORS.text }}>No study plan yet.</p>
                <p className="text-xs mt-1" style={{ color: COLORS.muted }}>The room owner hasn't created one.</p>
              </div>
            )}

            {!planLoading && !plan && isOwner && !showPlanForm && (
              <button onClick={() => setShowPlanForm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold text-white shadow-md shadow-amber-500/20"
                style={{ background: COLORS.accent }}>
                <Plus size={16} /> Create Study Plan
              </button>
            )}

            {showPlanForm && (
              <form onSubmit={handleCreatePlan} className="rounded-3xl p-5 flex flex-col gap-4 bg-white border border-slate-200/90 shadow-sm">
                {weeks.map((week, i) => (
                  <div key={i} className="flex flex-col gap-2 rounded-2xl p-3 bg-slate-50 border border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <input type="text" placeholder={`Week ${i + 1} title`} value={week.title} onChange={(e) => updateWeek(i, 'title', e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl text-sm outline-none bg-white border border-slate-200 focus:border-amber-500 transition-colors" style={{ color: COLORS.text }} />
                      {weeks.length > 1 && (
                        <button type="button" onClick={() => removeWeek(i)}><Trash2 size={16} style={{ color: COLORS.muted }} /></button>
                      )}
                    </div>
                    <input type="text" placeholder="Tasks, comma separated" value={week.tasksText} onChange={(e) => updateWeek(i, 'tasksText', e.target.value)}
                      className="px-3 py-2 rounded-xl text-sm outline-none bg-white border border-slate-200 focus:border-amber-500 transition-colors" style={{ color: COLORS.text }} />
                  </div>
                ))}
                <button type="button" onClick={addWeek} className="self-start text-xs font-bold flex items-center gap-1" style={{ color: COLORS.teal }}>
                  <Plus size={14} /> Add another week
                </button>
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 rounded-2xl text-xs font-bold text-white shadow-md" style={{ background: COLORS.teal }}>Save Plan</button>
                  <button type="button" onClick={() => setShowPlanForm(false)} className="px-4 py-2 rounded-2xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
                </div>
              </form>
            )}

            {!planLoading && plan && (
              <div className="flex flex-col gap-4">
                <div className="rounded-3xl p-5 flex items-center justify-between bg-white border border-slate-200/90 shadow-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} style={{ color: COLORS.teal }} />
                    <span className="text-sm font-semibold" style={{ color: COLORS.text }}>Your progress</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%`, background: COLORS.teal }} />
                    </div>
                    <span className="text-sm font-bold" style={{ color: COLORS.text }}>{progressPercent}%</span>
                  </div>
                </div>

                {plan.weeks.map((week) => (
                  <div key={week._id} className="rounded-3xl p-5 bg-white border border-slate-200/90 shadow-sm">
                    <h3 className="font-bold mb-3 text-sm" style={{ color: COLORS.text, fontFamily: 'Space Grotesk, sans-serif' }}>{week.title}</h3>
                    <div className="flex flex-col gap-2">
                      {week.tasks.map((task) => {
                        const done = task.completedBy.some((uid) => uid === user?._id || uid?._id === user?._id)
                        return (
                          <label key={task._id} className="flex items-center gap-3 rounded-2xl p-3 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                            <input type="checkbox" checked={done} onChange={() => toggleTask(week._id, task._id)} className="w-4 h-4 accent-amber-500" />
                            <span className="text-sm" style={{ color: done ? COLORS.muted : COLORS.text, textDecoration: done ? 'line-through' : 'none' }}>{task.title}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Resources tab */}
        {tab === 'resources' && (
          <div className="flex flex-col gap-4">
            <form onSubmit={handleUpload} className="rounded-3xl p-5 flex flex-col gap-3 bg-white border border-slate-200/90 shadow-sm">
              <input
                type="text" placeholder="Title (optional)" value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm outline-none bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white transition-all"
                style={{ color: COLORS.text }}
              />
              <input
                type="file"
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="text-sm file:mr-3 file:px-4 file:py-2 file:rounded-xl file:border-0 file:font-bold file:cursor-pointer file:bg-amber-500 file:text-white hover:file:bg-amber-600 file:transition-colors"
                style={{ color: COLORS.muted }}
              />
              {uploadError && <p className="text-xs font-medium text-rose-600">{uploadError}</p>}
              <button
                type="submit" disabled={uploading}
                className="self-start flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold text-white shadow-md shadow-amber-500/20 disabled:opacity-50"
                style={{ background: COLORS.accent }}
              >
                <Upload size={16} />
                {uploading ? 'Uploading...' : 'Upload File'}
              </button>
            </form>

            {resourcesLoading && <p className="text-sm" style={{ color: COLORS.muted }}>Loading resources...</p>}

            {!resourcesLoading && resources.length === 0 && (
              <div className="rounded-3xl p-10 text-center bg-white border border-dashed border-slate-300">
                <p className="font-semibold text-sm" style={{ color: COLORS.text }}>No resources yet.</p>
                <p className="text-xs mt-1" style={{ color: COLORS.muted }}>Upload notes, PDFs, or images for this room.</p>
              </div>
            )}

            {resources.map((resource) => {
              const Icon = getFileIcon(resource.fileType)
              return (
                <div key={resource._id} className="rounded-3xl p-4 flex items-center justify-between gap-4 bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-sky-50">
                      <Icon size={18} style={{ color: COLORS.teal }} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: COLORS.text }}>{resource.title}</p>
                      <p className="text-xs" style={{ color: COLORS.muted }}>
                        uploaded by {resource.uploadedBy?.name}
                      </p>
                    </div>
                  </div>
                  <a
                    href={resource.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="p-2.5 rounded-xl shrink-0 bg-amber-50 hover:bg-amber-100 transition-colors"
                    style={{ color: COLORS.accent }}
                  >
                    <Download size={16} />
                  </a>
                </div>
              )
            })}
          </div>
        )}

        {/* Chat tab */}
        {tab === 'chat' && (
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col h-[500px] overflow-hidden">
          <div className="flex-1 p-5 overflow-y-auto space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-center mt-10" style={{ color: COLORS.muted }}>No messages yet. Say hello!</p>
            )}
            {messages.map((msg) => {
              const isMe = msg.sender?._id === user?._id
              return (
                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs p-3 rounded-2xl text-sm ${isMe ? 'text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}
                    style={isMe ? { background: COLORS.accent } : {}}>
                    {!isMe && <p className="text-xs font-bold mb-0.5" style={{ color: COLORS.teal }}>{msg.sender?.name}</p>}
                    {msg.content}
                  </div>
                </div>
              )
            })}
          </div>
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 flex gap-2">
            <input
              type="text" placeholder="Type a message..."
              value={messageInput} onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-2xl text-sm outline-none bg-slate-50 border border-slate-200 focus:border-amber-500 transition-colors"
              style={{ color: COLORS.text }}
            />
            <button type="submit" className="px-4 py-2.5 rounded-2xl text-white shadow-md" style={{ background: COLORS.accent }}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
      
      </div>
    </div>
  )
}

export default RoomDetails