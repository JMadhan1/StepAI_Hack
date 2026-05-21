import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, Brain, BarChart2,
  MessageSquare, Search, Zap, Layers, FileText, Home,
  Flame, Trophy, ClipboardList, Bot, TrendingUp
} from 'lucide-react'
import { useApp } from '../App'

const NAV = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',   color: 'text-purple-400' },
  { to: '/chat',       icon: Bot,             label: 'AI Tutor',    color: 'text-indigo-400' },
  { to: '/study-plan', icon: BookOpen,        label: 'Study Plan',  color: 'text-cyan-400'   },
  { to: '/quiz',       icon: Brain,           label: 'Quiz Arena',  color: 'text-blue-400'   },
  { to: '/exam',       icon: ClipboardList,   label: 'Exam Mode',   color: 'text-red-400'    },
  { to: '/flashcards', icon: Layers,          label: 'Flashcards',  color: 'text-violet-400' },
  { to: '/notes',      icon: FileText,        label: 'Study Notes', color: 'text-green-400'  },
  { to: '/analytics',  icon: TrendingUp,      label: 'Analytics',   color: 'text-yellow-400' },
  { to: '/doubt',      icon: MessageSquare,   label: 'Doubt Solver',color: 'text-pink-400'   },
  { to: '/resources',  icon: Search,          label: 'Resources',   color: 'text-sky-400'    },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { xp, streak, levelInfo, progressPercent, nextLevel } = useApp()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-50 flex flex-col"
      style={{ background: 'linear-gradient(180deg, rgba(10,8,20,0.98) 0%, rgba(8,6,18,0.98) 100%)', borderRight: '1px solid rgba(124,58,237,0.15)' }}>

      {/* Gradient line top */}
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, transparent, #7c3aed, #06b6d4, transparent)' }} />

      {/* Logo */}
      <div className="px-6 py-5 border-b border-purple-600/10">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 group w-full">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center glow-purple group-hover:scale-105 transition-transform">
            <Zap size={17} className="text-white" />
          </div>
          <div className="text-left">
            <div className="text-white font-bold text-base leading-none">EduAgent</div>
            <div className="hero-text font-bold text-xs mt-0.5">Pro</div>
          </div>
        </button>
      </div>

      {/* XP / Level bar */}
      <div className="px-4 pt-3 pb-3 border-b border-purple-600/10">
        <div className="glass-card p-3">
          {/* Level badge + streak */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${levelInfo.bg} text-white`}>
                Lv.{levelInfo.level}
              </div>
              <span className={`text-xs font-semibold ${levelInfo.color}`}>{levelInfo.title}</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame size={12} className="text-orange-400" />
              <span className="text-orange-400 text-xs font-bold">{streak}</span>
            </div>
          </div>

          {/* XP bar */}
          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden mb-1">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${levelInfo.bg}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 text-xs">{xp} XP</span>
            {nextLevel && <span className="text-slate-600 text-xs">{nextLevel.minXP} XP</span>}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label, color }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-purple-600/15 border border-purple-600/25'
                  : 'hover:bg-white/4 border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebarAccent"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: 'linear-gradient(180deg, #7c3aed, #06b6d4)' }}
                  />
                )}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                  isActive ? 'bg-purple-600/25' : 'group-hover:bg-white/6'
                }`}>
                  <Icon size={15} className={isActive ? color : 'text-slate-500 group-hover:text-slate-400'} />
                </div>
                <span className={`font-medium text-sm ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  {label}
                </span>
                {isActive && (
                  <div className={`ml-auto w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')} pulse-dot`} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-5 pt-3 border-t border-purple-600/10 space-y-3">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-300 text-xs transition-colors hover:bg-white/4"
        >
          <Home size={12} /> Back to Home
        </button>
        <div className="glass-card p-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Trophy size={10} className="text-yellow-400" />
            <p className="text-slate-500 text-xs">{xp} total XP earned</p>
          </div>
          <p className="hero-text font-bold text-xs">Groq × LlaMA 3.3 70B</p>
        </div>
      </div>

      {/* Gradient line bottom */}
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, transparent, #06b6d4, #7c3aed, transparent)' }} />
    </aside>
  )
}
