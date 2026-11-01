import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Flame, ListChecks, Bot, LogOut, Plus, BookOpen, Search, Play, Pause, RotateCcw,
  Clock, Sparkles, Trophy, Bell, ChevronRight, CheckCircle2, Circle, Trash2,
  Filter, X, Send, Shield,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const LIGHT_COLORS = {
  bg: '#F8FAFC',
  accent: '#F59E0B',
};

const NAV_ITEMS = [
  { id: 'rooms', label: 'Study Rooms', icon: BookOpen },
  { id: 'tasks', label: 'My Tasks', icon: ListChecks },
  { id: 'assistant', label: 'AI Tutor', icon: Bot },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
];

// Sample data: these two features are not connected to the backend yet
const SAMPLE_STATS = { hoursThisWeek: 24, xpPoints: 4120 };

const LEADERBOARD_USERS = [
  { rank: 1, name: 'Elena Rostova', xp: 4850, streak: 14, badge: 'Master' },
  { rank: 2, name: 'You', xp: 4120, streak: 4, badge: 'Pro' },
  { rank: 3, name: 'Sarah Chen', xp: 3910, streak: 9, badge: 'Pro' },
  { rank: 4, name: 'David Kim', xp: 3200, streak: 6, badge: 'Scholar' },
  { rank: 5, name: 'Priya Sharma', xp: 2840, streak: 3, badge: 'Rising' },
];

function renderSafeText(val, fallback = '') {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return val.name || val.title || val.label || val.text || val.message || fallback;
  }
  return String(val);
}

const initialOf = (name) => (name || '?').trim().charAt(0).toUpperCase();

const memberName = (m) => (m && typeof m === 'object' ? m.name || '?' : '?');

function ProgressRing({ percent, size = 68, strokeWidth = 6, color = '#0284C7' }) {
  const safePercent = typeof percent === 'number' ? percent : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90 transition-all duration-500">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-xs font-bold tracking-tight text-slate-800" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        {safePercent}%
      </span>
    </div>
  );
}

function PomodoroWidget({ onSessionComplete }) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus');

  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds((s) => s - 1), 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      if (mode === 'focus') {
        setMode('break');
        setSeconds(5 * 60);
        if (onSessionComplete) onSessionComplete('Focus session finished! Great job!');
      } else {
        setMode('focus');
        setSeconds(25 * 60);
        if (onSessionComplete) onSessionComplete('Break complete! Ready to lock in again?');
      }
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, mode, onSessionComplete]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setSeconds(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center gap-2.5">
        <div className={`p-1.5 rounded-xl ${mode === 'focus' ? 'bg-amber-100 text-amber-600' : 'bg-sky-100 text-sky-600'}`}>
          <Clock size={16} className={isActive ? 'animate-spin' : ''} />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            {mode === 'focus' ? 'Focus Sprint' : 'Rest Break'}
          </span>
          <span className="text-sm font-mono font-bold text-slate-800 leading-none">{formatTime(seconds)}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 border-l border-slate-200 pl-2.5">
        <button
          onClick={toggleTimer}
          className={`p-1.5 rounded-xl transition-colors ${
            isActive ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm'
          }`}
          title={isActive ? 'Pause Timer' : 'Start Focus'}
        >
          {isActive ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
        </button>
        <button
          onClick={resetTimer}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Reset Timer"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const setAuthUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('rooms');
  const [toastMessage, setToastMessage] = useState(null);

  // Rooms
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomScope, setRoomScope] = useState('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomForm, setRoomForm] = useState({ name: '', description: '', topicsInput: '' });

  // Personal tasks
  const [tasks, setTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState('all');
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');

  // AI tutor (demo only)
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: "Hello! I'm your AI Study Companion preview. Real AI answers are coming soon." },
  ]);
  const [inputChat, setInputChat] = useState('');

  const sub = user?.subscription;
  const isPremium = sub?.plan === 'premium' && sub?.endDate && new Date(sub.endDate) > new Date();

  const triggerToast = (msg) => {
    setToastMessage(renderSafeText(msg, 'Done!'));
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isMember = (room) =>
    (room.members || []).some((m) => (m?._id || m) === user?._id);

  // Load rooms
  useEffect(() => {
    const fetchRooms = async () => {
      setRoomsLoading(true);
      try {
        const response = await axios.get('/api/rooms');
        setRooms(response.data);
        const joined = response.data.some((r) =>
          (r.members || []).some((m) => (m?._id || m) === user?._id)
        );
        setRoomScope(joined ? 'mine' : 'explore');
      } catch (err) {
        console.error('Failed to fetch rooms:', err.message);
        setRooms([]);
      } finally {
        setRoomsLoading(false);
      }
    };
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load this user's tasks
  useEffect(() => {
    axios
      .get('/api/tasks')
      .then((res) => setTasks(res.data))
      .catch((err) => console.error('Failed to fetch tasks:', err.message));
  }, []);

  // ---- Task handlers ----
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    try {
      const res = await axios.post('/api/tasks', {
        title: newTaskText.trim(),
        label: newTaskLabel.trim(),
        priority: newTaskPriority,
      });
      setTasks((prev) => [res.data, ...prev]);
      setNewTaskText('');
      setNewTaskLabel('');
    } catch (err) {
      triggerToast(err.response?.data?.error || 'Could not add task.');
    }
  };

  const handleToggleTask = async (id) => {
    try {
      const res = await axios.patch(`/api/tasks/${id}/toggle`);
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
      if (res.data.done) triggerToast('Task completed!');
    } catch (err) {
      triggerToast('Could not update task.');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`/api/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      triggerToast('Could not delete task.');
    }
  };

  // ---- Room handlers ----
  const handleCreateRoomSubmit = async (e) => {
    e.preventDefault();
    if (!roomForm.name.trim()) return;

    const topics = roomForm.topicsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      name: roomForm.name.trim(),
      description: roomForm.description.trim() || 'A shared space to study together.',
      topics: topics.length > 0 ? topics : ['General Study'],
    };

    try {
      const res = await axios.post('/api/rooms', payload);
      setRooms((prev) => [res.data, ...prev]);
      setRoomScope('mine');
    } catch (err) {
      const data = err.response?.data;
      if (data?.code === 'PLAN_LIMIT') {
        setShowCreateModal(false);
        navigate('/pricing');
        return;
      }
      console.error('Failed to create room:', data?.error || err.message);
      triggerToast(data?.error || 'Failed to create room, please try again.');
      return;
    }

    setRoomForm({ name: '', description: '', topicsInput: '' });
    setShowCreateModal(false);
    triggerToast(`Study Room "${payload.name}" created!`);
  };

  // ---- AI tutor demo ----
  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!inputChat.trim()) return;
    const userMsg = inputChat;
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInputChat('');
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'This is a preview. Connected AI answers, quizzes and summaries are coming soon.' },
      ]);
    }, 600);
  };

  // ---- Derived data ----
  const myRoomsCount = rooms.filter(isMember).length;

  const filteredRooms = rooms
    .filter((room) => (roomScope === 'mine' ? isMember(room) : !isMember(room)))
    .filter((room) => {
      const nameStr = renderSafeText(room.name).toLowerCase();
      const q = searchQuery.toLowerCase();
      const topicsArr = Array.isArray(room.topics) ? room.topics : [];
      const topicMatch = topicsArr.some((t) => renderSafeText(t).toLowerCase().includes(q));
      return nameStr.includes(q) || topicMatch;
    });

  const completedTasksCount = tasks.filter((t) => t.done).length;
  const taskProgressPercent = tasks.length ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter((task) => {
    if (taskFilter === 'pending') return !task.done;
    if (taskFilter === 'completed') return task.done;
    return true;
  });

  const sampleRank = LEADERBOARD_USERS.find((u) => u.name === 'You')?.rank || 2;

  return (
    <div
      className="min-h-screen flex text-slate-800 antialiased selection:bg-amber-100 selection:text-amber-900"
      style={{ background: LIGHT_COLORS.bg, fontFamily: 'Inter, sans-serif' }}
    >
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/20 border border-slate-700">
          <Sparkles size={18} className="text-amber-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Icon rail */}
      <aside className="w-20 bg-white border-r border-slate-200/80 flex flex-col items-center py-6 gap-8 shadow-sm z-20 shrink-0">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white font-black text-xl shadow-md shadow-amber-500/30">
          S
        </div>

        <nav className="flex flex-col gap-4 w-full px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative p-3 rounded-2xl transition-all duration-200 flex items-center justify-center group ${
                  active
                    ? 'bg-amber-500/10 text-amber-600 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
                title={item.label}
              >
                <Icon size={20} className={active ? 'text-amber-600' : ''} />
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-amber-500 rounded-r-full shadow-sm" />
                )}
                <span className="absolute left-full ml-3 px-3 py-1 text-xs font-semibold bg-slate-900 text-white rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-4 items-center">
          <button
            onClick={() => triggerToast("You're up to date! No unread notifications.")}
            className="relative p-3 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell size={20} />
          </button>

          <button
            onClick={() => {
              setAuthUser(null);
              navigate('/');
            }}
            className="p-3 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Log Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 px-4 sm:px-8 py-5 bg-white/90 border-b border-slate-200/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                isPremium
                  ? 'bg-amber-100 text-amber-700 border-amber-200/60'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {isPremium ? `Premium until ${new Date(sub.endDate).toLocaleDateString()}` : 'Free plan'}
            </span>
            <h1
              className="text-2xl font-bold tracking-tight text-slate-900 mt-1"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Welcome back, {renderSafeText(user?.name?.split(' ')[0], 'Student')}
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-end">
            <div className="hidden sm:block">
              <PomodoroWidget onSessionComplete={triggerToast} />
            </div>

            <button
              onClick={() => navigate('/pricing')}
              className="px-3.5 py-2 rounded-2xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 transition-all"
            >
              {isPremium ? 'Manage plan' : 'Upgrade'}
            </button>

            <div
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center font-bold text-sm ring-2 ring-slate-200 shadow-sm"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              title={user?.name}
            >
              {initialOf(user?.name || 'S')}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Stat cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">Your rooms</span>
                <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <BookOpen size={18} />
                </div>
              </div>
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {myRoomsCount}
              </span>
              <p className="text-xs text-slate-500 mt-2 font-medium">Rooms you've joined or created</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">Focus hours</span>
                <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock size={18} />
                </div>
              </div>
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {SAMPLE_STATS.hoursThisWeek}h
              </span>
              <p className="text-xs text-slate-400 mt-2 font-medium">Sample data. Tracking coming soon.</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">Task progress</span>
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ListChecks size={18} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {completedTasksCount}/{tasks.length}
                  </span>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{tasks.length - completedTasksCount} tasks left</p>
                </div>
                <ProgressRing percent={taskProgressPercent} size={52} strokeWidth={5} color="#10B981" />
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">Ranking</span>
                <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Trophy size={18} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  #{sampleRank}
                </span>
                <span className="text-xs font-bold text-purple-600 px-2 py-0.5 rounded-full bg-purple-100 border border-purple-200">
                  {SAMPLE_STATS.xpPoints} XP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">Sample data. Rankings coming soon.</p>
            </div>
          </section>

          {/* Tabs + room controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              {[
                { id: 'rooms', label: 'Study Rooms', count: rooms.length },
                { id: 'tasks', label: 'My Tasks', count: tasks.length },
                { id: 'assistant', label: 'AI Study Tutor', badge: 'Preview' },
                { id: 'leaderboard', label: 'Peer Ranking', badge: 'Sample' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2.5 rounded-2xl font-semibold text-xs transition-all flex items-center gap-2.5 whitespace-nowrap ${
                    activeTab === t.id
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span>{t.label}</span>
                  {t.count !== undefined && (
                    <span
                      className={`px-2 py-0.5 text-[11px] rounded-full font-bold ${
                        activeTab === t.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {t.count}
                    </span>
                  )}
                  {t.badge && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        activeTab === t.id ? 'bg-amber-400 text-slate-900' : 'bg-sky-100 text-sky-700'
                      }`}
                    >
                      {t.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'rooms' && (
              <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto">
                <div className="relative flex-1 min-w-0 lg:flex-none">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search rooms or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full lg:w-64 pl-9 pr-4 py-2 rounded-2xl text-xs bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-sm"
                  />
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all active:scale-95"
                >
                  <Plus size={16} />
                  <span>Create Room</span>
                </button>
              </div>
            )}
          </div>

          {/* ROOMS TAB */}
          {activeTab === 'rooms' && (
            <div className="space-y-6">
              <div className="flex gap-2">
                {[
                  ['explore', 'Explore'],
                  ['mine', `My Rooms (${myRoomsCount})`],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setRoomScope(id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                      roomScope === id
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                        : 'text-slate-500 hover:bg-slate-200/60'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {roomsLoading ? (
                <p className="text-sm text-slate-400">Loading rooms...</p>
              ) : filteredRooms.length === 0 ? (
                <div className="p-12 rounded-3xl bg-white border border-dashed border-slate-300 text-center flex flex-col items-center justify-center gap-3 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                    <BookOpen size={24} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    {roomScope === 'mine' ? "You haven't joined any rooms yet" : 'No rooms to explore'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    {roomScope === 'mine'
                      ? 'Open Explore to join a room, or create your own.'
                      : 'Try a different search, or create your own room.'}
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-2 flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500 text-white text-xs font-bold"
                  >
                    <Plus size={16} /> Create Room
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRooms.map((room) => {
                    const topicsList = Array.isArray(room.topics) ? room.topics : [];
                    const membersList = Array.isArray(room.members) ? room.members : [];
                    const owned = (room.owner?._id || room.owner) === user?._id;
                    const joined = isMember(room);

                    return (
                      <div
                        key={room._id}
                        className="bg-white rounded-3xl border border-slate-200/90 p-6 flex flex-col justify-between gap-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                                owned
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : joined
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {owned && <Shield size={10} />}
                              {owned ? 'Owner' : joined ? 'Joined' : 'Open to join'}
                            </span>
                          </div>

                          <h3
                            className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors"
                            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                          >
                            {renderSafeText(room.name, 'Untitled Room')}
                          </h3>

                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                            {renderSafeText(room.description, 'No description provided.')}
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {topicsList.map((topic, i) => (
                              <span
                                key={i}
                                className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 border border-slate-200/60"
                              >
                                #{renderSafeText(topic)}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center -space-x-2">
                              {membersList.slice(0, 4).map((m, idx) => (
                                <div
                                  key={idx}
                                  title={memberName(m)}
                                  className="h-8 w-8 rounded-full ring-2 ring-white bg-gradient-to-tr from-amber-500 to-orange-400 text-white text-xs font-bold flex items-center justify-center"
                                >
                                  {initialOf(memberName(m))}
                                </div>
                              ))}
                            </div>
                            <span className="text-xs font-medium text-slate-500">
                              {membersList.length} member{membersList.length !== 1 ? 's' : ''}
                            </span>
                          </div>

                          <button
                            onClick={() => navigate(`/rooms/${room._id}`)}
                            className="px-4 py-2 rounded-2xl text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all flex items-center gap-1 active:scale-95"
                            style={{ background: LIGHT_COLORS.accent }}
                          >
                            <span>{joined ? 'Enter Hub' : 'View Room'}</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TASKS TAB */}
          {activeTab === 'tasks' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    <Plus size={18} className="text-amber-500" />
                    <span>Add a Task</span>
                  </h3>

                  <form onSubmit={handleAddTask} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1.5">What do you need to do?</label>
                      <input
                        type="text"
                        maxLength={200}
                        placeholder="e.g. Finish chapter 3 notes"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl text-xs border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1.5">Subject (optional)</label>
                        <input
                          type="text"
                          maxLength={40}
                          placeholder="e.g. Anatomy"
                          value={newTaskLabel}
                          onChange={(e) => setNewTaskLabel(e.target.value)}
                          className="w-full px-3 py-2 rounded-2xl text-xs border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1.5">Priority</label>
                        <select
                          value={newTaskPriority}
                          onChange={(e) => setNewTaskPriority(e.target.value)}
                          className="w-full px-3 py-2 rounded-2xl text-xs border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none"
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-2xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 transition-all"
                    >
                      Add Task
                    </button>
                  </form>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Filter size={14} /> Filter:
                  </span>
                  <div className="flex gap-1">
                    {['all', 'pending', 'completed'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setTaskFilter(f)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-colors ${
                          taskFilter === f
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-3">
                {filteredTasks.length === 0 ? (
                  <div className="p-12 rounded-3xl bg-white border border-dashed border-slate-300 text-center shadow-sm">
                    <p className="text-xs font-semibold text-slate-400">
                      {tasks.length === 0 ? 'No tasks yet. Add your first one.' : 'No tasks in this view.'}
                    </p>
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div
                      key={task._id}
                      className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 group ${
                        task.done
                          ? 'bg-slate-50 border-slate-200/80 opacity-60'
                          : 'bg-white border-slate-200/90 hover:shadow-md hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <button
                          onClick={() => handleToggleTask(task._id)}
                          className="text-slate-400 hover:text-amber-500 transition-colors shrink-0"
                          title={task.done ? 'Mark as not done' : 'Mark as done'}
                        >
                          {task.done ? (
                            <CheckCircle2 size={22} className="text-emerald-500 fill-emerald-100" />
                          ) : (
                            <Circle size={22} />
                          )}
                        </button>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${task.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {task.label && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                                {task.label}
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                                task.priority === 'High'
                                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                  : task.priority === 'Medium'
                                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="p-2 text-slate-300 hover:text-rose-500 sm:opacity-0 group-hover:opacity-100 transition-all shrink-0"
                        title="Delete Task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* AI TUTOR TAB (demo) */}
          {activeTab === 'assistant' && (
            <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col h-[580px] overflow-hidden">
              <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
                    <Bot size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      AI Study Companion
                    </h3>
                    <p className="text-[11px] text-slate-500">Explain topics, summarize notes and generate quizzes</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-sky-100 text-sky-700 font-semibold border border-sky-200">
                  Preview
                </span>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-md p-4 rounded-3xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-amber-500 text-white font-semibold rounded-br-none shadow-md shadow-amber-500/20'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChatMessage} className="p-4 border-t border-slate-200 bg-white flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={inputChat}
                  onChange={(e) => setInputChat(e.target.value)}
                  className="flex-1 min-w-0 px-4 py-3 rounded-2xl text-xs border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all flex items-center gap-2 shadow-md shadow-amber-500/20"
                  title="Send"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}

          {/* LEADERBOARD TAB (sample) */}
          {activeTab === 'leaderboard' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Weekly Peer Standings
                </h2>
                <p className="text-xs text-slate-500 font-medium">Sample standings. Real rankings will come from study plan progress.</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {LEADERBOARD_USERS.map((person) => {
                    const isYou = person.name === 'You';
                    const label = isYou ? `${user?.name || 'You'} (You)` : person.name;
                    return (
                      <div
                        key={person.rank}
                        className={`p-5 flex items-center justify-between gap-4 transition-colors ${
                          isYou ? 'bg-amber-50/70' : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <span
                            className={`w-8 text-center font-black ${
                              person.rank === 1
                                ? 'text-amber-500 text-lg'
                                : person.rank === 2
                                ? 'text-slate-400 text-base'
                                : person.rank === 3
                                ? 'text-amber-700 text-base'
                                : 'text-slate-400 text-xs'
                            }`}
                          >
                            #{person.rank}
                          </span>

                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center font-bold shrink-0">
                            {initialOf(label)}
                          </div>

                          <div className="min-w-0">
                            <p className={`text-xs font-bold truncate ${isYou ? 'text-amber-700' : 'text-slate-800'}`}>{label}</p>
                            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <Flame size={12} className="text-amber-500" /> {person.streak} days active
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="hidden sm:inline text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {person.badge}
                          </span>
                          <span className="text-xs font-bold font-mono bg-amber-100/60 text-amber-800 px-3 py-1 rounded-xl">
                            {person.xp} XP
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create room modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              title="Close"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Create a Study Room
            </h3>

            <form onSubmit={handleCreateRoomSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Room name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Chemistry Revision"
                  value={roomForm.name}
                  onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl text-xs border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="What will this room study together?"
                  value={roomForm.description}
                  onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl text-xs border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Topics (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Alkenes, Reactions, Past papers"
                  value={roomForm.topicsInput}
                  onChange={(e) => setRoomForm({ ...roomForm, topicsInput: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl text-xs border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-amber-500 text-white shadow-md shadow-amber-500/20 hover:bg-amber-600"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}