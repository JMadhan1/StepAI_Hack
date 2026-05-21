import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen, Calendar, Clock, ChevronRight,
  Loader, ExternalLink, Video, FileText, BookMarked
} from 'lucide-react'
import axios from 'axios'
import { useApp } from '../App'
import API from '../config/api'

const TOPIC_COLORS = [
  'bg-purple-600/20 border-purple-600/40 text-purple-300',
  'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
  'bg-green-500/20 border-green-500/40 text-green-300',
  'bg-pink-500/20 border-pink-500/40 text-pink-300',
  'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
  'bg-orange-500/20 border-orange-500/40 text-orange-300',
]

const RESOURCE_ICON = {
  video:   { icon: Video,      color: 'text-red-400',  bg: 'bg-red-500/10  border-red-500/30'  },
  article: { icon: FileText,   color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  paper:   { icon: BookMarked, color: 'text-green-400',bg: 'bg-green-500/10 border-green-500/30'},
}

export default function StudyPlan() {
  const { uploadedTopics, currentStudyPlan, setCurrentStudyPlan, setAgent, addXP } = useApp()
  const [days, setDays]             = useState(7)
  const [hoursPerDay, setHoursPerDay] = useState(2)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [expandedDay, setExpandedDay] = useState(null)

  const topics = uploadedTopics.length > 0 ? uploadedTopics : ['Mathematics', 'Physics', 'Chemistry']
  const topicColorMap = {}
  topics.forEach((t, i) => { topicColorMap[t] = TOPIC_COLORS[i % TOPIC_COLORS.length] })

  const generate = async () => {
    setLoading(true); setError('')
    setAgent('planner', 'active')
    try {
      const res = await axios.post(`${API}/study-plan`, {
        topics, available_days: days, hours_per_day: hoursPerDay,
      })
      setCurrentStudyPlan(res.data.plan)
      setExpandedDay(1)
      addXP('GENERATE_PLAN')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate study plan. Check backend connection.')
    } finally {
      setLoading(false); setAgent('planner', 'idle')
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
            <BookOpen size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Study Plan</h1>
            <p className="text-slate-400 text-sm">AI-generated personalised schedule with curated resources</p>
          </div>
        </div>
      </motion.div>

      {/* Config */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        className="glass-card p-6 mb-8">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Available Days</label>
            <input type="number" min={1} max={30} value={days} onChange={(e) => setDays(Number(e.target.value))}
              className="w-full bg-white/5 border border-purple-600/20 rounded-xl px-4 py-3 text-white focus:outline-none" />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Hours Per Day</label>
            <input type="number" min={0.5} max={12} step={0.5} value={hoursPerDay} onChange={(e) => setHoursPerDay(Number(e.target.value))}
              className="w-full bg-white/5 border border-purple-600/20 rounded-xl px-4 py-3 text-white focus:outline-none" />
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm text-slate-400 mb-2 block">Topics</label>
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <span key={t} className={`px-3 py-1 rounded-full text-xs font-medium border ${topicColorMap[t]}`}>{t}</span>
            ))}
          </div>
          {uploadedTopics.length === 0 && (
            <p className="text-slate-600 text-xs mt-2">Upload a PDF on Dashboard to use your own topics.</p>
          )}
        </div>

        <button onClick={generate} disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity">
          {loading ? (
            <><Loader size={16} className="animate-spin" />Generating plan + fetching resources...</>
          ) : (
            <><BookOpen size={16} />Generate Study Plan with Resources</>
          )}
        </button>

        {error && <p className="mt-3 text-red-400 text-sm text-center">{error}</p>}
      </motion.div>

      {/* Timeline */}
      {currentStudyPlan && currentStudyPlan.length > 0 && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">{currentStudyPlan.length}-Day Study Plan</h2>
            <span className="tag tag-purple">{topics.length} topics · {days * hoursPerDay}h total</span>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5"
              style={{ background: 'linear-gradient(180deg, #7c3aed44, #06b6d444, #7c3aed44)' }} />

            <div className="space-y-4">
              {currentStudyPlan.map((day, i) => {
                const isOpen = expandedDay === day.day
                return (
                  <motion.div key={day.day}
                    initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay: i * 0.04 }}
                    className="flex gap-6"
                  >
                    {/* Day circle */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all ${
                      isOpen
                        ? 'bg-gradient-to-br from-purple-600 to-cyan-500 glow-purple'
                        : 'bg-purple-600/20 border border-purple-600/30'
                    }`}>
                      <span className="text-white font-bold text-sm">{day.day}</span>
                    </div>

                    {/* Day card */}
                    <div className="glass-card flex-1 overflow-hidden">
                      {/* Card header — always visible */}
                      <button
                        onClick={() => setExpandedDay(isOpen ? null : day.day)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/3 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs flex-shrink-0">
                            <Calendar size={11} />
                            <span>{day.date}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 min-w-0">
                            {day.topics.map((t) => (
                              <span key={t} className={`px-2 py-0.5 rounded-full text-xs font-medium border ${topicColorMap[t] || TOPIC_COLORS[0]}`}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                          <div className="flex items-center gap-1 text-cyan-400 text-xs">
                            <Clock size={11} />{day.duration_hours}h
                          </div>
                          {day.resources?.length > 0 && (
                            <span className="tag tag-cyan">{day.resources.length} links</span>
                          )}
                          <ChevronRight size={14} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                        </div>
                      </button>

                      {/* Expanded content */}
                      {isOpen && (
                        <motion.div
                          initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                          className="border-t border-white/5"
                        >
                          <div className="p-4 grid md:grid-cols-2 gap-5">
                            {/* Tasks */}
                            <div>
                              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">Tasks</p>
                              <ul className="space-y-2">
                                {day.tasks.map((task, ti) => (
                                  <li key={ti} className="flex items-start gap-2 text-slate-300 text-sm">
                                    <div className="w-5 h-5 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <span className="text-purple-400 text-xs font-bold">{ti+1}</span>
                                    </div>
                                    {task}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Resources */}
                            <div>
                              <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3">
                                Study Resources
                              </p>
                              {day.resources && day.resources.length > 0 ? (
                                <ul className="space-y-2">
                                  {day.resources.map((res, ri) => {
                                    const cfg = RESOURCE_ICON[res.type] || RESOURCE_ICON.article
                                    const Icon = cfg.icon
                                    return (
                                      <li key={ri}>
                                        <a
                                          href={res.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${cfg.bg} hover:opacity-80 transition-opacity group`}
                                        >
                                          <Icon size={13} className={`${cfg.color} flex-shrink-0`} />
                                          <span className="text-slate-300 text-xs leading-snug flex-1 line-clamp-2 group-hover:text-white">
                                            {res.title}
                                          </span>
                                          <ExternalLink size={11} className="text-slate-600 flex-shrink-0" />
                                        </a>
                                      </li>
                                    )
                                  })}
                                </ul>
                              ) : (
                                <p className="text-slate-600 text-xs">No resources fetched for this day.</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
