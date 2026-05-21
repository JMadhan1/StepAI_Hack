import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, TrendingUp, AlertTriangle, CheckCircle, Loader, RefreshCw, Brain } from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import axios from 'axios'
import { useApp } from '../App'

import API from '../config/api'

export default function WeakAreaTracker() {
  const { weakAreas, setWeakAreas, performanceHistory, setPerformanceHistory } = useApp()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get(`${API}/weak-areas`)
      setData(res.data)
      setWeakAreas(res.data.weak_areas || [])
      if (res.data.history) {
        setPerformanceHistory(res.data.history)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load performance data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Build radar data from history
  const topicMap = {}
  ;(data?.history || performanceHistory).forEach((entry) => {
    if (!topicMap[entry.topic]) topicMap[entry.topic] = []
    topicMap[entry.topic].push(entry.percentage)
  })
  const radarData = Object.entries(topicMap).map(([topic, scores]) => ({
    topic: topic.slice(0, 12),
    score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  }))

  const historyEntries = data?.history || performanceHistory

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
            <BarChart2 size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Progress Tracker</h1>
            <p className="text-slate-400 text-sm">AI-powered weak area detection</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 glass-card border-white/10 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader size={32} className="text-purple-400 animate-spin" />
        </div>
      )}

      {error && (
        <div className="glass-card p-6 text-center border-red-500/20">
          <p className="text-red-400">{error}</p>
          <button onClick={fetchData} className="mt-3 text-purple-400 text-sm underline">Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-5">
              <AlertTriangle size={18} className="text-red-400 mb-3" />
              <div className="text-2xl font-bold text-red-400">{(data?.weak_areas || weakAreas).length}</div>
              <div className="text-xs text-slate-500 mt-1">Weak Areas</div>
            </div>
            <div className="glass-card p-5">
              <CheckCircle size={18} className="text-green-400 mb-3" />
              <div className="text-2xl font-bold text-green-400">{(data?.strong_areas || []).length}</div>
              <div className="text-xs text-slate-500 mt-1">Strong Areas</div>
            </div>
            <div className="glass-card p-5">
              <TrendingUp size={18} className="text-cyan-400 mb-3" />
              <div className="text-2xl font-bold text-cyan-400">{historyEntries.length}</div>
              <div className="text-xs text-slate-500 mt-1">Quizzes Taken</div>
            </div>
          </div>

          {historyEntries.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Brain size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">No quiz data yet</p>
              <p className="text-slate-600 text-sm mt-2">Take some quizzes to see your performance analytics here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Radar Chart */}
              {radarData.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="text-sm font-semibold text-white mb-4">Performance by Topic</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#ffffff10" />
                      <PolarAngleAxis dataKey="topic" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Radar dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Bar Chart */}
              <div className="glass-card p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Quiz History</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={historyEntries.slice(-8)}>
                    <XAxis dataKey="topic" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#12121a', border: '1px solid #7c3aed40', borderRadius: '8px' }}
                      labelStyle={{ color: '#e2e8f0' }}
                    />
                    <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                      {historyEntries.slice(-8).map((entry, i) => (
                        <Cell key={i} fill={entry.percentage >= 80 ? '#22c55e' : entry.percentage >= 60 ? '#eab308' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recommendation */}
          {data?.overall_recommendation && (
            <div className="glass-card p-6 border-l-2 border-cyan-500 mb-6">
              <p className="text-xs text-cyan-400 font-semibold mb-2">AI RECOMMENDATION</p>
              <p className="text-slate-300 text-sm">{data.overall_recommendation}</p>
            </div>
          )}

          {/* Weak / Strong areas */}
          <div className="grid grid-cols-2 gap-4">
            {(data?.weak_areas || weakAreas).length > 0 && (
              <div className="glass-card p-5">
                <p className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <AlertTriangle size={14} /> Needs Improvement
                </p>
                <div className="flex flex-wrap gap-2">
                  {(data?.weak_areas || weakAreas).map((area) => (
                    <span key={area} className="px-2.5 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-red-300 text-xs">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(data?.strong_areas || []).length > 0 && (
              <div className="glass-card p-5">
                <p className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <CheckCircle size={14} /> Strong Areas
                </p>
                <div className="flex flex-wrap gap-2">
                  {(data?.strong_areas || []).map((area) => (
                    <span key={area} className="px-2.5 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-300 text-xs">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

