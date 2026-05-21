import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart2, TrendingUp, Brain, Star, Flame,
  Trophy, Zap, RefreshCw, Loader, Target
} from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'
import axios from 'axios'
import { useApp } from '../App'
import API from '../config/api'

// ── Activity Heatmap (last 30 days) ─────────────────────────────────────────
function ActivityHeatmap({ history }) {
  const today = new Date()
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().split('T')[0]
  })

  const countByDay = {}
  history.forEach((h) => {
    const day = new Date(h.time).toISOString().split('T')[0]
    countByDay[day] = (countByDay[day] || 0) + 1
  })

  const max = Math.max(1, ...Object.values(countByDay))

  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Activity — Last 30 Days</p>
      <div className="flex flex-wrap gap-1">
        {days.map((day) => {
          const count = countByDay[day] || 0
          const opacity = count === 0 ? 0.08 : 0.2 + (count / max) * 0.8
          return (
            <div
              key={day}
              title={`${day}: ${count} action${count !== 1 ? 's' : ''}`}
              className="w-5 h-5 rounded-sm cursor-default transition-transform hover:scale-125"
              style={{ background: `rgba(124, 58, 237, ${opacity})` }}
            />
          )
        })}
      </div>
      <p className="text-slate-600 text-xs mt-2">Each square = one study action</p>
    </div>
  )
}

// ── XP Timeline ──────────────────────────────────────────────────────────────
function XPTimeline({ history }) {
  if (!history.length) return <p className="text-slate-600 text-xs">No XP history yet.</p>

  let cumulative = 0
  const data = history
    .slice()
    .reverse()
    .slice(-20)
    .map((h, i) => {
      cumulative += h.xp
      return {
        name: i + 1,
        xp: cumulative,
        gain: h.xp,
        event: h.event,
      }
    })

  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">XP Progress</p>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: '#0f0c1d', border: '1px solid #7c3aed44', borderRadius: 8, fontSize: 11 }}
            formatter={(v) => [`${v} XP`, 'Cumulative']}
          />
          <Area type="monotone" dataKey="xp" stroke="#7c3aed" fill="url(#xpGrad)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Topic Radar ──────────────────────────────────────────────────────────────
function TopicRadar({ performanceHistory }) {
  if (!performanceHistory || performanceHistory.length === 0) {
    return <p className="text-slate-600 text-xs text-center py-8">Take quizzes to see your topic mastery.</p>
  }

  const topicMap = {}
  performanceHistory.forEach((h) => {
    if (!topicMap[h.topic]) topicMap[h.topic] = []
    topicMap[h.topic].push(h.percentage || 0)
  })

  const data = Object.entries(topicMap).map(([topic, scores]) => ({
    topic: topic.length > 12 ? topic.slice(0, 12) + '…' : topic,
    score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  }))

  if (data.length < 3) {
    return (
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.topic}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">{d.topic}</span>
              <span className={d.score >= 70 ? 'text-green-400' : 'text-yellow-400'}>{d.score}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${d.score >= 70 ? 'bg-green-500' : 'bg-yellow-500'}`}
                style={{ width: `${d.score}%` }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="65%">
        <PolarGrid stroke="rgba(124,58,237,0.2)" />
        <PolarAngleAxis dataKey="topic" tick={{ fill: '#94a3b8', fontSize: 10 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar name="Mastery" dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

// ── AI Insights Card ─────────────────────────────────────────────────────────
function InsightsCard({ insights, loading, onRefresh }) {
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-40 gap-3">
      <div className="flex gap-2">
        <div className="thinking-dot w-3 h-3 rounded-full bg-purple-400" />
        <div className="thinking-dot w-3 h-3 rounded-full bg-cyan-400" />
        <div className="thinking-dot w-3 h-3 rounded-full bg-purple-400" />
      </div>
      <p className="text-slate-500 text-sm">AI analysing your study patterns…</p>
    </div>
  )

  if (!insights) return null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Summary */}
      <div className="p-4 rounded-xl bg-purple-600/10 border border-purple-600/25">
        <p className="text-slate-300 text-sm leading-relaxed">{insights.summary}</p>
      </div>

      {/* Exam readiness */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Exam Readiness</span>
            <span className="text-cyan-400 font-bold">{insights.predicted_score}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${insights.predicted_score}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-cyan-500"
            />
          </div>
        </div>
        <button onClick={onRefresh}
          className="p-2 rounded-xl glass-card hover:bg-white/8 transition-colors">
          <RefreshCw size={13} className="text-slate-400" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Strengths */}
        <div>
          <p className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-1">
            <TrendingUp size={10} /> Strengths
          </p>
          <ul className="space-y-1">
            {insights.strengths?.map((s, i) => (
              <li key={i} className="text-slate-400 text-xs flex items-start gap-1.5">
                <span className="text-green-500 mt-0.5">✓</span>{s}
              </li>
            ))}
          </ul>
        </div>
        {/* Improvements */}
        <div>
          <p className="text-xs font-semibold text-yellow-400 mb-2 flex items-center gap-1">
            <Target size={10} /> Improve
          </p>
          <ul className="space-y-1">
            {insights.improvements?.map((s, i) => (
              <li key={i} className="text-slate-400 text-xs flex items-start gap-1.5">
                <span className="text-yellow-500 mt-0.5">→</span>{s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tip of day */}
      <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
        <p className="text-xs font-semibold text-cyan-400 mb-1 flex items-center gap-1">
          <Zap size={10} /> Tip of the Day
        </p>
        <p className="text-slate-300 text-xs leading-relaxed">{insights.tip_of_day}</p>
      </div>

      {/* Motivation */}
      <div className="p-3 rounded-xl bg-white/3 border border-white/8 text-center">
        <p className="text-slate-400 text-xs italic">"{insights.motivation}"</p>
      </div>
    </motion.div>
  )
}

// ── Main Analytics ───────────────────────────────────────────────────────────
export default function Analytics() {
  const { xp, streak, levelInfo, history, uploadedTopics, performanceHistory } = useApp()
  const [insights, setInsights] = useState(null)
  const [insightsLoading, setInsightsLoading] = useState(false)

  const fetchInsights = async () => {
    setInsightsLoading(true)
    try {
      const res = await axios.post(`${API}/insights`, {
        topics: uploadedTopics,
        xp,
        streak,
        level: levelInfo.level,
        quiz_history: performanceHistory.slice(-10),
      })
      setInsights(res.data)
    } catch (err) {
      console.error('Insights error:', err)
    } finally {
      setInsightsLoading(false)
    }
  }

  useEffect(() => { fetchInsights() }, []) // eslint-disable-line

  // Build per-topic quiz stats
  const topicStats = {}
  performanceHistory.forEach((h) => {
    if (!topicStats[h.topic]) topicStats[h.topic] = { count: 0, total: 0 }
    topicStats[h.topic].count++
    topicStats[h.topic].total += h.percentage || 0
  })

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
            <BarChart2 size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Learning Analytics</h1>
            <p className="text-slate-400 text-sm">AI-powered insights into your study performance</p>
          </div>
        </div>
      </motion.div>

      {/* Top stat chips */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total XP',      value: xp,                   icon: Star,   color: 'from-yellow-500 to-amber-500'  },
          { label: 'Day Streak',    value: streak,                icon: Flame,  color: 'from-orange-500 to-red-500'   },
          { label: 'Level',         value: levelInfo.level,       icon: Trophy, color: 'from-purple-600 to-violet-600' },
          { label: 'Quizzes',       value: performanceHistory.length, icon: Brain, color: 'from-cyan-500 to-sky-600'  },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.06 }}
            className="glass-card shimmer p-5">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon size={14} className="text-white" />
            </div>
            <div className="text-2xl font-black text-white">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Activity Heatmap + XP Timeline */}
        <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1 }}
          className="glass-card p-6 space-y-6">
          <ActivityHeatmap history={history} />
          <div className="border-t border-white/5 pt-4">
            <XPTimeline history={history} />
          </div>
        </motion.div>

        {/* Topic Mastery Radar */}
        <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1 }}
          className="glass-card p-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Topic Mastery</p>
          <TopicRadar performanceHistory={performanceHistory} />

          {Object.keys(topicStats).length > 0 && (
            <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
              {Object.entries(topicStats).map(([topic, s]) => (
                <div key={topic} className="flex justify-between text-xs">
                  <span className="text-slate-400 truncate max-w-32">{topic}</span>
                  <span className="text-slate-500">{s.count} quiz{s.count !== 1 ? 'zes' : ''} · avg {Math.round(s.total/s.count)}%</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
        className="glass-card p-6">
        <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Zap size={11} /> AI Study Insights
          <span className="tag tag-purple ml-1">Powered by LLaMA 3.3 70B</span>
        </p>
        <InsightsCard insights={insights} loading={insightsLoading} onRefresh={fetchInsights} />
      </motion.div>
    </div>
  )
}
