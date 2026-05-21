import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, Brain, BarChart2,
  MessageSquare, Search, Layers, FileText, ChevronLeft, ChevronRight,
  ClipboardList, Bot, TrendingUp
} from 'lucide-react'

const PAGES = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/chat',       icon: Bot,             label: 'AI Tutor'   },
  { to: '/study-plan', icon: BookOpen,        label: 'Study Plan' },
  { to: '/quiz',       icon: Brain,           label: 'Quiz'       },
  { to: '/exam',       icon: ClipboardList,   label: 'Exam'       },
  { to: '/flashcards', icon: Layers,          label: 'Flashcards' },
  { to: '/notes',      icon: FileText,        label: 'Notes'      },
  { to: '/analytics',  icon: TrendingUp,      label: 'Analytics'  },
  { to: '/doubt',      icon: MessageSquare,   label: 'Doubts'     },
  { to: '/resources',  icon: Search,          label: 'Resources'  },
]

export default function TopNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const currentIdx = PAGES.findIndex((p) => pathname === p.to || pathname.startsWith(p.to + '/'))
  const effectiveIdx = currentIdx === -1 ? 0 : currentIdx
  const prev    = effectiveIdx > 0 ? PAGES[effectiveIdx - 1] : null
  const next    = effectiveIdx < PAGES.length - 1 ? PAGES[effectiveIdx + 1] : null
  const current = PAGES[effectiveIdx]

  return (
    <div className="sticky top-0 z-40 bg-bg/80 backdrop-blur-md border-b border-white/5">
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 px-4 pt-3 overflow-x-auto scrollbar-none">
        {PAGES.map(({ to, icon: Icon, label }) => {
          const isActive = pathname === to || pathname.startsWith(to + '/')
          return (
            <button
              key={to}
              onClick={() => navigate(to)}
              className={`relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-lg text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'text-white bg-card border border-b-0 border-purple-600/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <Icon size={13} />
              {label}
              {isActive && (
                <motion.div
                  layoutId="topNavBar"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Breadcrumb + prev/next */}
      <div className="flex items-center justify-between px-5 py-1.5">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="text-purple-400 font-medium">EduAgent Pro</span>
          <span>/</span>
          <span className="text-slate-300">{current?.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => prev && navigate(prev.to)}
            disabled={!prev}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-500 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={12} /> {prev?.label}
          </button>
          <button
            onClick={() => next && navigate(next.to)}
            disabled={!next}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-500 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            {next?.label} <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}
