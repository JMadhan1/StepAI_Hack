import React from 'react'
import { motion } from 'framer-motion'
import { Search, Brain, BookOpen, BarChart2, MessageSquare } from 'lucide-react'
import { useApp } from '../App'

const agents = [
  { key: 'research', icon: Search, label: 'Research Agent', color: 'cyan' },
  { key: 'quiz', icon: Brain, label: 'Quiz Agent', color: 'purple' },
  { key: 'planner', icon: BookOpen, label: 'Planner Agent', color: 'green' },
  { key: 'tracker', icon: BarChart2, label: 'Tracker Agent', color: 'yellow' },
  { key: 'doubt', icon: MessageSquare, label: 'Doubt Agent', color: 'pink' },
]

const colorMap = {
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', dot: 'bg-cyan-400' },
  purple: { bg: 'bg-purple-600/10', border: 'border-purple-600/30', text: 'text-purple-400', dot: 'bg-purple-400' },
  green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', dot: 'bg-green-400' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', dot: 'bg-pink-400' },
}

export default function AgentStatus() {
  const { agentStatus } = useApp()

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {agents.map(({ key, icon: Icon, label, color }) => {
        const status = agentStatus[key] || 'idle'
        const c = colorMap[color]
        const isActive = status === 'active'

        return (
          <motion.div
            key={key}
            className={`glass-card p-4 ${isActive ? c.border : 'border-white/5'} transition-all duration-300`}
            animate={isActive ? { scale: [1, 1.02, 1] } : { scale: 1 }}
            transition={{ repeat: isActive ? Infinity : 0, duration: 1.5 }}
          >
            <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center mb-3`}>
              <Icon size={16} className={c.text} />
            </div>
            <p className="text-xs text-slate-400 font-medium leading-tight">{label}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className={`w-2 h-2 rounded-full ${c.dot} ${isActive ? 'pulse-dot' : 'opacity-30'}`} />
              <span className={`text-xs capitalize ${isActive ? c.text : 'text-slate-600'}`}>
                {status}
              </span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
