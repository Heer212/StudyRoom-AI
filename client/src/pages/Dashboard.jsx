import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Flame, LayoutGrid, ListChecks, Bot, User, LogOut, Users, Plus, BookOpen, 
  Search, Play, Pause, RotateCcw, Clock, Sparkles, Trophy, Bell, ChevronRight, 
  CheckCircle2, Circle, Trash2, Filter, X, Send, Shield, Zap, ArrowUpRight, 
  Check, Lightbulb, Target, Calendar, Share2, MoreHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const LIGHT_COLORS = {
  bg: '#F8FAFC',
  rail: '#FFFFFF',
  surface: '#FFFFFF',
  accent: '#F59E0B',
  teal: '#0284C7',
  coral: '#F43F5E',
  violet: '#8B5CF6',
  text: '#0F172A',
  muted: '#64748B',
};

const CURRENT_USER = {
  name: 'Alex Rivera',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
  streakDays: 4,
  hoursThisWeek: 24,
  xpPoints: 4120
};

const NAV_ITEMS = [
  { id: 'rooms', label: 'Study Rooms', icon: BookOpen },
  { id: 'tasks', label: 'Tasks', icon: ListChecks },
  { id: 'assistant', label: 'AI Tutor', icon: Bot },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy }
];

const INITIAL_ROOMS = [
  {
    id: '1',
    name: 'Advanced React 19 & Fiber Architecture',
    description: 'Deep dive into concurrent mode, custom hooks optimization, state management, and Server Components.',
    topics: ['React', 'JavaScript', 'Frontend'],
    members: [
      { name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces' },
      { name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces' },
      { name: 'David Kim', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=faces' }
    ],
    maxMembers: 6,
    activeCount: 3,
    isPrivate: false,
    color: '#0284C7'
  },
  {
    id: '2',
    name: 'DSA & LeetCode Hard Sprint',
    description: 'Cracking dynamic programming, graph algorithms, space complexity, and high-frequency tech interview questions.',
    topics: ['Algorithms', 'Python', 'Interview Prep'],
    members: [
      { name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces' },
      { name: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&crop=faces' }
    ],
    maxMembers: 5,
    activeCount: 2,
    isPrivate: false,
    color: '#F59E0B'
  },
  {
    id: '3',
    name: 'MongoDB & Cloud Backend Systems',
    description: 'Distributed databases, sharding strategies, compound indexing, and API microservices with Node.js.',
    topics: ['Database', 'Node.js', 'System Design'],
    members: [
      { name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces' },
      { name: 'Lucas Meyer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces' },
      { name: 'Aisha Patel', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces' },
      { name: 'Tom Hardy', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces' }
    ],
    maxMembers: 8,
    activeCount: 4,
    isPrivate: true,
    color: '#8B5CF6'
  }
];

const INITIAL_TASKS = [
  { id: '1', label: 'Finish useEffect & Custom Hook notes', category: 'React', priority: 'High', done: true },
  { id: '2', label: 'Complete 10 Dynamic Programming problems', category: 'Algorithms', priority: 'High', done: false },
  { id: '3', label: 'Review MongoDB aggregation pipelines & indexing', category: 'Database', priority: 'Medium', done: false },
  { id: '4', label: 'Read System Design Chapter 4: Distributed Caching', category: 'System Design', priority: 'Low', done: true },
  { id: '5', label: 'Prepare mock interview behavioral responses', category: 'Career', priority: 'Medium', done: false }
];

const LEADERBOARD_USERS = [
  { rank: 1, name: 'Elena Rostova', xp: 4850, streak: 14, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces', badge: 'Master' },
  { rank: 2, name: 'Alex Rivera (You)', xp: 4120, streak: 4, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces', badge: 'Pro' },
  { rank: 3, name: 'Sarah Chen', xp: 3910, streak: 9, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces', badge: 'Pro' },
  { rank: 4, name: 'David Kim', xp: 3200, streak: 6, avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=faces', badge: 'Scholar' },
  { rank: 5, name: 'Priya Sharma', xp: 2840, streak: 3, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces', badge: 'Rising' }
];

function renderSafeText(val, fallback = '') {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return val.name || val.title || val.label || val.text || val.message || JSON.stringify(val);
  }
  return String(val);
}

function ProgressRing({ percent, size = 68, strokeWidth = 6, color = '#0284C7' }) {
  const safePercent = typeof percent === 'number' ? percent : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90 transition-all duration-500">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
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
          <span className="text-sm font-mono font-bold text-slate-800 leading-none">
            {formatTime(seconds)}
          </span>
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

export default function App() {
  const [activeTab, setActiveTab] = useState('rooms');
  const [rooms, setRooms] = useState();
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  
  const user = useAuthStore((state) => state.user)
  const setAuthUser = useAuthStore((state) => state.setUser)
  const navigate = useNavigate()

  // Decorative-only stats — not backed by a real API yet
  const mockStats = { streakDays: 4, hoursThisWeek: 24, xpPoints: 4120 }

  const [isApiConnected, setIsApiConnected] = useState(false);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  // Modals & Form States
  const [showCreateModal, setShowCreateModal] = useState(false);
  // const [selectedRoom, setSelectedRoom] = useState(null);
  const [taskFilter, setTaskFilter] = useState('all');
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('React');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');

  const [roomForm, setRoomForm] = useState({
    name: '',
    description: '',
    topicsInput: '',
    maxMembers: 6,
    isPrivate: false,
    color: '#0284C7'
  });

  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hello Alex! I am your AI Study Companion. How can I assist your study sprint today?' }
  ]);
  const [inputChat, setInputChat] = useState('');

useEffect(() => {
  const fetchApiRooms = async () => {
    setIsLoadingApi(true);
    try {
      const response = await axios.get('/api/rooms');
      setRooms(response.data);
    } catch (err) {
      console.error('Failed to fetch rooms:', err.message);
      setRooms([]);
    } finally {
      setIsLoadingApi(false);
    }
  };

  fetchApiRooms();
}, []);

  const triggerToast = (msg) => {
    setToastMessage(renderSafeText(msg, 'Action completed!'));
    setTimeout(() => setToastMessage(null), 3500);
  };

  const completedTasksCount = tasks.filter(t => t.done).length;
  const taskProgressPercent = tasks.length ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  const handleToggleTask = (id) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const nextState = !t.done;
        if (nextState) triggerToast('Task marked complete! +50 XP');
        return { ...t, done: nextState };
      }
      return t;
    }));
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    triggerToast('Task removed from agenda.');
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      label: newTaskText.trim(),
      category: newTaskCategory,
      priority: newTaskPriority,
      done: false
    };
    setTasks([newTask, ...tasks]);
    setNewTaskText('');
    triggerToast('New task added to schedule!');
  };

  const handleCreateRoomSubmit = async (e) => {
    e.preventDefault();
    if (!roomForm.name.trim()) return;

    const topicsArr = roomForm.topicsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const newRoomPayload = {
      name: roomForm.name,
      description: roomForm.description || 'Collaborative study space for peer learning and focused sprint work.',
      topics: topicsArr.length > 0 ? topicsArr : ['General Study'],
      maxMembers: Number(roomForm.maxMembers) || 6,
      isPrivate: roomForm.isPrivate,
      color: roomForm.color
    };

    try {
      const res = await axios.post('/api/rooms', newRoomPayload, { timeout: 3000 });
      if (res.data) {
        setRooms(prev => [res.data, ...prev]);
        setIsApiConnected(true);
      }
    }  catch (err) {
  console.error('Failed to create room:', err.response?.data?.error || err.message);
  triggerToast('Failed to create room — please try again.');
}

    setRoomForm({
      name: '',
      description: '',
      topicsInput: '',
      maxMembers: 6,
      isPrivate: false,
      color: '#0284C7'
    });
    setShowCreateModal(false);
    triggerToast(`Study Room "${newRoomPayload.name}" created!`);
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!inputChat.trim()) return;

    const userMsg = inputChat;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputChat('');

    setTimeout(() => {
      let botReply = "That's a fantastic query! Let's break it down into core principles.";
      const queryLower = userMsg.toLowerCase();
      if (queryLower.includes('useeffect') || queryLower.includes('react')) {
        botReply = "In React 19, useEffect manages side-effects. Always declare all reactive values in the dependency array and provide a cleanup function to handle unsubscribes.";
      } else if (queryLower.includes('dsa') || queryLower.includes('algo')) {
        botReply = "For Dynamic Programming, state your subproblem relation first: DP[i] = DP[i-1] + DP[i-2]. Then decide whether memoization or bottom-up iteration fits better.";
      } else if (queryLower.includes('mongodb') || queryLower.includes('database')) {
        botReply = "MongoDB indexing relies on B-Trees. Create compound indexes based on your Equality, Sort, and Range query filter order for optimal speed.";
      }
      setChatMessages(prev => [...prev, { sender: 'ai', text: botReply }]);
    }, 700);
  };

  const filteredRooms = rooms.filter(room => {
    const nameStr = renderSafeText(room.name).toLowerCase();
    const queryLower = searchQuery.toLowerCase();
    const topicsArr = Array.isArray(room.topics) ? room.topics : [];
    const topicMatch = topicsArr.some(t => renderSafeText(t).toLowerCase().includes(queryLower));
    return nameStr.includes(queryLower) || topicMatch;
  });

  const filteredTasks = tasks.filter(task => {
    if (taskFilter === 'pending') return !task.done;
    if (taskFilter === 'completed') return task.done;
    return true;
  });

  return (
    <div className="min-h-screen flex text-slate-800 antialiased selection:bg-amber-100 selection:text-amber-900" 
         style={{ background: LIGHT_COLORS.bg, fontFamily: 'Inter, sans-serif' }}>
      
      {/* Toast Notification Floating Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/20 border border-slate-700 animate-bounce">
          <Sparkles size={18} className="text-amber-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {}
      <aside className="w-20 bg-white border-r border-slate-200/80 flex flex-col items-center py-6 gap-8 shadow-sm z-20">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white font-black text-xl shadow-md shadow-amber-500/30">
          S
        </div>

        <nav className="flex flex-col gap-4 w-full px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative p-3 rounded-2xl transition-all duration-200 flex items-center justify-center group ${
                  isActive 
                    ? 'bg-amber-500/10 text-amber-600 shadow-sm font-bold' 
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
                title={renderSafeText(item.label)}
              >
                <Icon size={20} className={isActive ? 'text-amber-600' : ''} />
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-amber-500 rounded-r-full shadow-sm" />
                )}
                <span className="absolute left-full ml-3 px-3 py-1 text-xs font-semibold bg-slate-900 text-white rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                  {renderSafeText(item.label)}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-4 items-center">
          <button 
            onClick={() => triggerToast("You're up to date! No unread notifications.")}
            className="relative p-3 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-sky-500 rounded-full ring-2 ring-white" />
          </button>
          
          <button 
            onClick={() => {
              setAuthUser(null)
              navigate('/')
            }}
            className="p-3 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Log Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-10 px-8 py-5 bg-white/90 border-b border-slate-200/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200/60 uppercase tracking-wider">
                Light Workspace
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isApiConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {isApiConnected ? '● API Live' : '○ Standalone / Offline'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Welcome back, {renderSafeText(user?.name?.split(' ')[0], 'Student')} <span className="animate-bounce inline-block">☀️</span>
            </h1>
          </div>

          <div className="hidden sm:block">
            <PomodoroWidget onSessionComplete={triggerToast} />

            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-amber-400/80 transition-all cursor-pointer group">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <Flame size={18} fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-semibold leading-none">Streak</span>
                <span className="text-xs font-bold text-slate-800">{mockStats.streakDays} Days</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="relative">
                <img src={user?.picture} alt={renderSafeText(user?.name)} className="w-10 h-10 rounded-2xl object-cover ring-2 ring-slate-200 shadow-sm" />                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
            </div>
          </div>
        </header>

        {}
        <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
          
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Study Rooms</span>
                <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <BookOpen size={18} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {rooms.length}
                </span>
                <span className="text-xs text-emerald-600 font-bold flex items-center bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ArrowUpRight size={14} /> +2 active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">9 peers online in active groups</p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hours Focus</span>
                <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Clock size={18} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {mockStats.hoursThisWeek}h
                </span>
                <span className="text-xs text-emerald-600 font-bold flex items-center bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ArrowUpRight size={14} /> +12%
                </span>
              </div>
              <div className="flex items-end gap-1.5 h-3 mt-3">
                {[45, 70, 35, 90, 80, 60, 85].map((h, i) => (
                  <div key={i} className="flex-1 bg-amber-100 hover:bg-amber-500 rounded-t transition-colors" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Goal Progress</span>
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ListChecks size={18} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {completedTasksCount}/{tasks.length}
                  </span>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {tasks.length - completedTasksCount} goals left today
                  </p>
                </div>
                <ProgressRing percent={taskProgressPercent} size={52} strokeWidth={5} color="#10B981" />
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">XP Leaderboard</span>
                <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Trophy size={18} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  #{LEADERBOARD_USERS.find(u => u.name.includes('You'))?.rank || 2}
                </span>
                <span className="text-xs font-bold text-purple-600 px-2 py-0.5 rounded-full bg-purple-100 border border-purple-200">
                 {mockStats.xpPoints} XP
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">Top 5% among study groups</p>
            </div>
          </section>

          {}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'rooms', label: 'Study Rooms', count: rooms.length },
                { id: 'tasks', label: 'Today\'s Tasks', count: tasks.length },
                { id: 'assistant', label: 'AI Study Tutor', badge: 'Tutor' },
                { id: 'leaderboard', label: 'Peer Ranking', badge: 'Live' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2.5 rounded-2xl font-semibold text-xs transition-all flex items-center gap-2.5 whitespace-nowrap ${
                    activeTab === t.id
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span>{renderSafeText(t.label)}</span>
                  {t.count !== undefined && (
                    <span className={`px-2 py-0.5 text-[11px] rounded-full font-bold ${
                      activeTab === t.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {t.count}
                    </span>
                  )}
                  {t.badge && (
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-extrabold rounded-full ${
                      activeTab === t.id ? 'bg-amber-400 text-slate-900' : 'bg-sky-100 text-sky-700'
                    }`}>
                      {renderSafeText(t.badge)}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'rooms' && (
              <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search rooms or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-2xl text-xs bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-sm"
                  />
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all transform active:scale-95"
                >
                  <Plus size={16} />
                  <span>Create Room</span>
                </button>
              </div>
            )}
          </div>

          {}
          {activeTab === 'rooms' && (
            <div className="space-y-6">
              {filteredRooms.length === 0 ? (
                <div className="p-12 rounded-3xl bg-white border border-dashed border-slate-300 text-center flex flex-col items-center justify-center gap-3 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                    <BookOpen size={24} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">No study rooms found</h3>
                  <p className="text-xs text-slate-500 max-w-sm">Try broadening your search criteria or create your custom study room.</p>
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
                    const roomName = renderSafeText(room.name, 'Untitled Room');
                    const roomDesc = renderSafeText(room.description, 'No description provided.');
                    const topicsList = Array.isArray(room.topics) ? room.topics : [];
                    const membersList = Array.isArray(room.members) ? room.members : [];

                    return (
                      <div
                        key={room.id || room._id}
                        className="bg-white rounded-3xl border border-slate-200/90 p-6 flex flex-col justify-between gap-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 group relative"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[11px] font-bold text-emerald-700">
                                {room.activeCount || 1} live now
                              </span>
                            </div>
                            {room.isPrivate && (
                              <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1 font-semibold">
                                <Shield size={10} /> Private
                              </span>
                            )}
                          </div>

                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors"
                              style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                            {roomName}
                          </h3>

                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                            {roomDesc}
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
                          <div className="flex items-center -space-x-2 overflow-hidden">
                            {membersList.map((m, idx) => {
                              const memberName = renderSafeText(m, `Member ${idx + 1}`);
                              const avatarUrl = typeof m === 'object' && m !== null && m.avatar
                                ? m.avatar 
                                : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(memberName)}`;

                              return (
                                <img
                                  key={idx}
                                  src={avatarUrl}
                                  alt={memberName}
                                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-sm"
                                  title={memberName}
                                />
                              );
                            })}
                            {membersList.length < (room.maxMembers || 6) && (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 ring-2 ring-white">
                                +{(room.maxMembers || 6) - membersList.length}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => navigate(`/rooms/${room._id || room.id}`)}
                            className="px-4 py-2 rounded-2xl text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all flex items-center gap-1 active:scale-95"
                            style={{ background: room.color || LIGHT_COLORS.accent }}
                          >
                            <span>Enter Hub</span>
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

          {}
          {activeTab === 'tasks' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    <Plus size={18} className="text-amber-500" />
                    <span>Create Daily Task</span>
                  </h3>

                  <form onSubmit={handleAddTask} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1.5">Task Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Read Redis caching notes..."
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl text-xs border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1.5">Category</label>
                        <select
                          value={newTaskCategory}
                          onChange={(e) => setNewTaskCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-2xl text-xs border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none"
                        >
                          <option value="React">React</option>
                          <option value="Algorithms">Algorithms</option>
                          <option value="Database">Database</option>
                          <option value="System Design">System Design</option>
                          <option value="Career">Career</option>
                        </select>
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
                      Save to Agenda
                    </button>
                  </form>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Filter size={14} /> Filter Tasks:
                  </span>
                  <div className="flex gap-1">
                    {['all', 'pending', 'completed'].map(f => (
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
                    <p className="text-xs font-semibold text-slate-400">No tasks in this view. Enjoy your productive day!</p>
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 group ${
                        task.done 
                          ? 'bg-slate-50 border-slate-200/80 opacity-60' 
                          : 'bg-white border-slate-200/90 hover:shadow-md hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <button
                          onClick={() => handleToggleTask(task.id)}
                          className="text-slate-400 hover:text-amber-500 transition-colors shrink-0"
                        >
                          {task.done ? (
                            <CheckCircle2 size={22} className="text-emerald-500 fill-emerald-100" />
                          ) : (
                            <Circle size={22} />
                          )}
                        </button>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${task.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {renderSafeText(task.label)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                              {renderSafeText(task.category)}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                              task.priority === 'High' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                              task.priority === 'Medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {renderSafeText(task.priority)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
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

          {}
          {activeTab === 'assistant' && (
            <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col h-[580px] overflow-hidden">
              <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                    <Bot size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      AI Study Companion
                    </h3>
                    <p className="text-[11px] text-slate-500">Interactive Concept Summarizer & Quiz Assistant</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200">
                  Ready
                </span>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md p-4 rounded-3xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-amber-500 text-white font-semibold rounded-br-none shadow-md shadow-amber-500/20'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                    }`}>
                      {renderSafeText(msg.text)}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChatMessage} className="p-4 border-t border-slate-200 bg-white flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question or request flashcards..."
                  value={inputChat}
                  onChange={(e) => setInputChat(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-2xl text-xs border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all flex items-center gap-2 shadow-md shadow-amber-500/20"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}

          {}
          {activeTab === 'leaderboard' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Weekly Peer Standings
                </h2>
                <p className="text-xs text-slate-500 font-medium">Earn XP by completing focus timers and resolving task checklist items.</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {LEADERBOARD_USERS.map((person) => {
                    const personName = renderSafeText(person.name);
                    const isYou = personName.includes('You');
                    return (
                      <div
                        key={person.rank}
                        className={`p-5 flex items-center justify-between gap-4 transition-colors ${
                          isYou ? 'bg-amber-50/70' : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`w-8 text-center font-black ${
                            person.rank === 1 ? 'text-amber-500 text-lg' :
                            person.rank === 2 ? 'text-slate-400 text-base' :
                            person.rank === 3 ? 'text-amber-700 text-base' : 'text-slate-400 text-xs'
                          }`}>
                            #{person.rank}
                          </span>

                          <img src={person.avatar} alt={personName} className="w-11 h-11 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm" />

                          <div>
                            <p className={`text-xs font-bold ${isYou ? 'text-amber-700' : 'text-slate-800'}`}>
                              {personName}
                            </p>
                            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <Flame size={12} className="text-amber-500" /> {person.streak} days active
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {renderSafeText(person.badge)}
                          </span>
                          <span className="text-xs font-bold text-slate-900 font-mono bg-amber-100/60 text-amber-800 px-3 py-1 rounded-xl">
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

      {}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Create New Study Room
            </h3>

            <form onSubmit={handleCreateRoomSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Room Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems & Kafka"
                  value={roomForm.name}
                  onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl text-xs border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Focus topics and study guidelines..."
                  value={roomForm.description}
                  onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl text-xs border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Topics (comma separated)</label>
                <input
                  type="text"
                  placeholder="Node.js, Kafka, Backend"
                  value={roomForm.topicsInput}
                  onChange={(e) => setRoomForm({ ...roomForm, topicsInput: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl text-xs border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Capacity</label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={roomForm.maxMembers}
                    onChange={(e) => setRoomForm({ ...roomForm, maxMembers: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl text-xs border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Theme Accent</label>
                  <select
                    value={roomForm.color}
                    onChange={(e) => setRoomForm({ ...roomForm, color: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl text-xs border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none"
                  >
                    <option value="#0284C7">Sky Teal</option>
                    <option value="#F59E0B">Amber Gold</option>
                    <option value="#8B5CF6">Purple Violet</option>
                    <option value="#F43F5E">Coral Pink</option>
                  </select>
                </div>
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
                  Launch Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {/* {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-4xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[620px]">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {renderSafeText(selectedRoom.name, 'Active Study Hub')}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">Live Peer Session • {selectedRoom.activeCount || 1} members studying now</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedRoom(null)}
                className="px-4 py-2 rounded-2xl text-xs font-bold bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors"
              >
                Leave Room
              </button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
              <div className="md:col-span-2 p-6 border-r border-slate-200 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Active Peers</span>
                  <div className="grid grid-cols-2 gap-4">
                    {(Array.isArray(selectedRoom.members) ? selectedRoom.members : []).map((member, i) => {
                      const memberName = renderSafeText(member, `Member ${i + 1}`);
                      const avatarUrl = typeof member === 'object' && member !== null && member.avatar 
                        ? member.avatar 
                        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(memberName)}`;

                      return (
                        <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                          <img src={avatarUrl} alt={memberName} className="w-10 h-10 rounded-2xl object-cover ring-2 ring-emerald-400" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">{memberName}</p>
                            <span className="text-[10px] text-emerald-600 font-bold">Focusing</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-amber-50/50 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-amber-800">Shared Workspace Agenda</span>
                    <span className="text-[10px] bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded-md font-bold">Auto-syncing</span>
                  </div>
                  <p className="text-xs text-slate-700 font-mono bg-white p-3 rounded-xl border border-amber-200/60">
                    // Group Sprint: Review custom hook logic, work through dynamic programming problems together.
                  </p>
                </div>
              </div>

              <div className="p-5 flex flex-col justify-between bg-slate-50">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Room Feed</span>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                  <div className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-700">
                    <span className="font-bold text-amber-600 block mb-0.5">Elena Rostova</span>
                    Started 25 min timer for Problem #3
                  </div>
                  <div className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-700">
                    <span className="font-bold text-sky-600 block mb-0.5">Sarah Chen</span>
                    Pushed updated notes to shared folder
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 mt-3">
                  <input
                    type="text"
                    placeholder="Send room message..."
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )} */}

    </div>
  );
}