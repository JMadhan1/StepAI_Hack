import React, { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  Upload, FileText, Zap, BookOpen, Brain,
  BarChart2, ChevronRight, CheckCircle, Layers, ClipboardList,
  Trophy, Flame, Star, Target, GitBranch, X, ArrowRight,
  BookMarked, TrendingUp,
} from 'lucide-react'
import axios from 'axios'
import { useApp } from '../App'
import AgentStatus from './AgentStatus'
import ConceptMap from './ConceptMap'
import API from '../config/api'

// ── Constants ─────────────────────────────────────────────────────────────────

const STAT_CONFIG = [
  { label: 'Topics Detected', icon: FileText,   grad: 'from-violet-600 to-purple-700', glow: 'shadow-purple-500/20' },
  { label: 'Study Days',      icon: BookOpen,   grad: 'from-cyan-500 to-sky-700',      glow: 'shadow-cyan-500/20'   },
  { label: 'Quizzes Taken',   icon: Brain,      grad: 'from-green-500 to-emerald-700', glow: 'shadow-green-500/20'  },
  { label: 'Weak Areas',      icon: BarChart2,  grad: 'from-amber-500 to-orange-700',  glow: 'shadow-amber-500/20'  },
]

const QUICK_ACTIONS = [
  { label: 'Study Plan',  desc: 'Day-by-day AI schedule',       icon: BookOpen,      to: '/study-plan', grad: 'from-violet-500 to-purple-700',  glow: 'rgba(124,58,237,0.5)',  emoji: '📅', badge: 'Plan' },
  { label: 'Take Quiz',   desc: 'Test yourself right now',      icon: Brain,         to: '/quiz',       grad: 'from-cyan-400 to-blue-600',      glow: 'rgba(6,182,212,0.5)',   emoji: '🎯', badge: 'Quiz' },
  { label: 'Exam Mode',   desc: 'Timed exam simulation',        icon: ClipboardList, to: '/exam',       grad: 'from-red-500 to-rose-700',       glow: 'rgba(239,68,68,0.5)',   emoji: '⏱️', badge: 'Hot' },
  { label: 'Flashcards',  desc: 'Spaced repetition cards',      icon: Layers,        to: '/flashcards', grad: 'from-indigo-400 to-violet-700',  glow: 'rgba(99,102,241,0.5)',  emoji: '🃏', badge: 'New' },
  { label: 'Study Notes', desc: 'AI-written complete notes',    icon: BookMarked,    to: '/notes',      grad: 'from-green-500 to-emerald-700',  glow: 'rgba(34,197,94,0.5)',   emoji: '📝', badge: 'AI'  },
  { label: 'Doubt Solver',desc: 'Ask anything, voice or text',  icon: TrendingUp,    to: '/doubt',      grad: 'from-pink-500 to-rose-600',      glow: 'rgba(236,72,153,0.5)',  emoji: '🤔', badge: 'Voice'},
]

const ONBOARDING_STEPS = [
  { key: 'upload', icon: Upload,      label: 'Upload your notes',      desc: 'Drop a PDF, TXT, or DOCX to get started' },
  { key: 'quiz',   icon: Brain,       label: 'Take your first quiz',   desc: 'Test yourself on any topic'              },
  { key: 'plan',   icon: BookMarked,  label: 'Generate a study plan',  desc: 'Build a day-by-day exam schedule'        },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function readinessColor(score) {
  if (score >= 80) return { stroke: '#22c55e', label: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20'  }
  if (score >= 60) return { stroke: '#3b82f6', label: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20'   }
  if (score >= 40) return { stroke: '#f97316', label: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' }
  return              { stroke: '#ef4444', label: 'text-rose-400',   bg: 'bg-rose-500/10',   border: 'border-rose-500/20'   }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate()
  const {
    uploadedTopics, setUploadedTopics,
    currentStudyPlan, performanceHistory, weakAreas, setAgent,
    xp, streak, levelInfo, progressPercent, nextLevel, addXP,
  } = useApp()

  // Upload state
  const [uploading, setUploading]         = useState(false)
  const [uploadError, setUploadError]     = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [docSummary, setDocSummary]       = useState('')

  // Concept map state (Plan A)
  const [cmNodes, setCmNodes]       = useState([])
  const [cmEdges, setCmEdges]       = useState([])
  const [cmLoading, setCmLoading]   = useState(false)

  // Onboarding state (Plan B)
  const [onboardingDone, setOnboardingDone] = useState(
    () => localStorage.getItem('eduagent_onboarding') === '1'
  )
  const dismissOnboarding = () => {
    localStorage.setItem('eduagent_onboarding', '1')
    setOnboardingDone(true)
  }

  // ── Exam readiness (Plan C) ─────────────────────────────────────────────
  const examReadiness = useMemo(() => {
    if (!performanceHistory.length) return 0
    const quizAvg = performanceHistory.reduce((s, h) => s + (h.percentage || 0), 0) / performanceHistory.length
    const topicBonus = Math.min(15, uploadedTopics.length * 1.5)
    const volumeBonus = Math.min(10, performanceHistory.length * 2)
    return Math.min(95, Math.round(quizAvg * 0.75 + topicBonus + volumeBonus))
  }, [performanceHistory, uploadedTopics])

  const rColor = readinessColor(examReadiness)
  const ringR = 44
  const ringCirc = 2 * Math.PI * ringR
  const ringOffset = ringCirc - (examReadiness / 100) * ringCirc

  // ── Onboarding step states ──────────────────────────────────────────────
  const stepDone = {
    upload: uploadedTopics.length > 0,
    quiz:   performanceHistory.length > 0,
    plan:   currentStudyPlan !== null,
  }
  const allStepsDone = Object.values(stepDone).every(Boolean)

  // ── File upload handler ─────────────────────────────────────────────────
  const ALLOWED = ['.pdf', '.txt', '.docx', '.doc']
  const isAllowed = (name) => ALLOWED.some(e => name.toLowerCase().endsWith(e))

  const onDrop = useCallback(async (accepted) => {
    const file = accepted[0]
    if (!file) return
    if (!isAllowed(file.name)) {
      setUploadError('Only PDF, TXT, and DOCX files are supported.')
      return
    }
    setUploading(true); setUploadError(''); setUploadSuccess(false)
    setDocSummary(''); setCmNodes([]); setCmEdges([])
    setAgent('research', 'active'); setAgent('planner', 'active')

    try {
      console.log('[UPLOAD] API URL:', `${API}/upload`)
      const form = new FormData()
      form.append('file', file)
      const res = await axios.post(`${API}/upload`, form)
      console.log('[UPLOAD] Success:', res.data)
      const topics = res.data.topics || []
      setUploadedTopics(topics)
      if (res.data.summary) setDocSummary(res.data.summary)
      setUploadSuccess(true)
      addXP('UPLOAD_PDF')

      // Generate concept map in background (Plan A)
      if (topics.length >= 2) {
        setCmLoading(true)
        axios.post(`${API}/concept-map`, { topics, filename: res.data.file_name || file.name })
          .then(r => { setCmNodes(r.data.nodes || []); setCmEdges(r.data.edges || []) })
          .catch(() => {})
          .finally(() => setCmLoading(false))
      }
    } catch (err) {
      console.error('[UPLOAD] Full error:', err)
      console.error('[UPLOAD] Error response:', err.response)
      console.error('[UPLOAD] Error message:', err.message)
      console.error('[UPLOAD] Error code:', err.code)
      const detail = err.response?.data?.detail || err.message || 'Upload failed. Make sure the backend is running.'
      setUploadError(detail)
    } finally {
      setUploading(false); setAgent('research', 'idle'); setAgent('planner', 'idle')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUploadedTopics, setAgent, addXP])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxFiles: 1,
  })

  const statValues = [
    uploadedTopics.length,
    currentStudyPlan ? currentStudyPlan.length : 0,
    performanceHistory.length,
    weakAreas.length,
  ]

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center glow-purple">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black gradient-text leading-tight">EduAgent Pro</h1>
            <p className="text-slate-500 text-sm">Your AI Study Command Center</p>
          </div>
        </div>
      </motion.div>

      {/* ── Plan B: Onboarding guide ─────────────────────────────────────── */}
      <AnimatePresence>
        {!onboardingDone && !allStepsDone && (
          <motion.div
            initial={{ opacity: 0, y: 12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.35 }}
            className="glass-card p-5 mb-6 border border-purple-500/20 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-purple-400" />
                <p className="text-white font-semibold text-sm">Get started in 3 steps</p>
              </div>
              <button
                onClick={dismissOnboarding}
                className="text-slate-500 hover:text-slate-300 transition-colors"
                aria-label="Dismiss"
              >
                <X size={15} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {ONBOARDING_STEPS.map((step, i) => {
                const done = stepDone[step.key]
                const Icon = step.icon
                return (
                  <div
                    key={step.key}
                    className={`rounded-xl p-3 border transition-all ${
                      done
                        ? 'bg-green-500/8 border-green-500/25'
                        : 'bg-white/3 border-white/8'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        done ? 'bg-green-500 text-white' : 'bg-white/10 text-slate-400'
                      }`}>
                        {done ? <CheckCircle size={13} /> : i + 1}
                      </div>
                      <Icon size={13} className={done ? 'text-green-400' : 'text-slate-400'} />
                    </div>
                    <p className={`text-xs font-semibold leading-snug ${done ? 'text-green-300' : 'text-slate-300'}`}>
                      {step.label}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Plan C: Gamification + Exam Readiness ───────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="glass-card p-5 mb-6"
      >
        <div className="flex items-center gap-6 flex-wrap">

          {/* Level */}
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${levelInfo.bg} flex items-center justify-center shadow-lg`}>
              <Trophy size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-none">{levelInfo.title}</p>
              <p className="text-slate-500 text-xs mt-0.5">Level {levelInfo.level}</p>
            </div>
          </div>

          {/* XP bar */}
          <div className="flex-1 min-w-32">
            <div className="flex justify-between mb-1.5">
              <span className="text-slate-400 text-xs">{xp} XP</span>
              {nextLevel && <span className="text-slate-600 text-xs">Next: {nextLevel.minXP} XP</span>}
            </div>
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${levelInfo.bg}`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <Flame size={16} className="text-orange-400" />
            <div>
              <p className="text-orange-300 font-bold text-base leading-none">{streak}</p>
              <p className="text-slate-500 text-xs">day streak</p>
            </div>
          </div>

          {/* XP chip */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <Star size={14} className="text-yellow-400" />
            <span className="text-yellow-300 font-bold text-sm">{xp} XP</span>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-10 bg-white/10" />

          {/* Exam Readiness Ring */}
          <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${rColor.bg} ${rColor.border}`}>
            <svg width="56" height="56" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="rGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={rColor.stroke} stopOpacity="0.6" />
                  <stop offset="100%" stopColor={rColor.stroke} />
                </linearGradient>
              </defs>
              {/* Track */}
              <circle cx="50" cy="50" r={ringR} fill="none" stroke="#1e293b" strokeWidth="9" />
              {/* Progress */}
              <motion.circle
                cx="50" cy="50" r={ringR}
                fill="none"
                stroke="url(#rGrad)"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={ringCirc}
                initial={{ strokeDashoffset: ringCirc }}
                animate={{ strokeDashoffset: ringOffset }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                transform="rotate(-90 50 50)"
              />
              <text x="50" y="50" textAnchor="middle" dominantBaseline="middle"
                fontSize="20" fontWeight="800" fill="white">
                {examReadiness}
              </text>
            </svg>
            <div>
              <p className={`text-xs font-semibold ${rColor.label} uppercase tracking-wider`}>
                Exam Ready
              </p>
              <p className="text-slate-300 font-bold text-lg leading-none">{examReadiness}%</p>
              <p className="text-slate-500 text-xs mt-0.5">
                {examReadiness === 0 ? 'Take a quiz to score' : examReadiness >= 80 ? 'Great shape!' : 'Keep practising'}
              </p>
            </div>
          </div>

        </div>
      </motion.div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {STAT_CONFIG.map(({ label, icon: Icon, grad, glow }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 + 0.1 }}
            className={`glass-card shimmer p-5 hover:scale-[1.04] transition-all duration-200 shadow-lg ${glow}`}
          >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center mb-4 shadow-md`}>
              <Icon size={16} className="text-white" />
            </div>
            <div className="text-3xl font-black text-white tabular-nums">{statValues[i]}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Upload zone ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="glass-card p-6 mb-6"
      >
        <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
          <Upload size={16} className="text-purple-400" />
          Upload Syllabus / Notes
          <span className="ml-auto tag tag-purple">+50 XP</span>
        </h2>
        <p className="text-slate-500 text-xs mb-4">Supports PDF, TXT, and DOCX — upload your notes, syllabus, or study material</p>

        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 overflow-hidden ${
            isDragActive
              ? 'border-purple-500 bg-purple-600/10 scale-[1.01]'
              : 'border-purple-600/25 hover:border-purple-500/55 hover:bg-purple-600/5'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-cyan-600/5 opacity-0 hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
          <input {...getInputProps()} />

          {uploading ? (
            <div className="space-y-4">
              <div className="flex justify-center gap-2">
                <div className="thinking-dot w-3.5 h-3.5 rounded-full bg-purple-400" />
                <div className="thinking-dot w-3.5 h-3.5 rounded-full bg-cyan-400" />
                <div className="thinking-dot w-3.5 h-3.5 rounded-full bg-purple-400" />
              </div>
              <p className="text-purple-300 font-semibold">Agents analysing your file…</p>
              <p className="text-slate-500 text-sm">Extracting topics, building semantic index and document summary</p>
            </div>
          ) : uploadSuccess ? (
            <div className="space-y-2">
              <CheckCircle size={44} className="text-green-400 mx-auto" />
              <p className="text-green-300 font-semibold">Successfully processed!</p>
              <p className="text-slate-500 text-sm">Drop another file to replace</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-purple-600/15 border border-purple-600/25 flex items-center justify-center mx-auto">
                <Upload size={24} className="text-purple-400" />
              </div>
              <p className="text-slate-300 font-medium">
                {isDragActive ? 'Drop it here!' : 'Drag & drop your file here'}
              </p>
              <p className="text-slate-600 text-sm">or click to browse</p>
              <div className="flex gap-2 justify-center">
                <span className="tag tag-purple">PDF</span>
                <span className="tag tag-purple">TXT</span>
                <span className="tag tag-purple">DOCX</span>
              </div>
            </div>
          )}
        </div>

        {uploadError && <p className="mt-3 text-red-400 text-sm text-center">{uploadError}</p>}

        {/* Document summary */}
        <AnimatePresence>
          {docSummary && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-5 p-4 rounded-xl bg-cyan-500/8 border border-cyan-500/20"
            >
              <p className="text-xs font-semibold text-cyan-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={11} /> Document Summary
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">{docSummary}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Topics */}
        {uploadedTopics.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-slate-400 mb-3">
              <span className="text-purple-400 font-bold">{uploadedTopics.length}</span> topics detected:
            </p>
            <div className="flex flex-wrap gap-2">
              {uploadedTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => navigate('/quiz')}
                  className="tag tag-purple hover:bg-purple-500/25 transition-colors cursor-pointer flex items-center gap-1"
                >
                  {topic}
                  <ArrowRight size={10} className="opacity-60" />
                </button>
              ))}
            </div>
            <p className="text-slate-600 text-xs mt-2">Click a topic to start a quiz</p>
          </div>
        )}
      </motion.div>

      {/* ── Plan A: Concept Map ──────────────────────────────────────────── */}
      {(cmLoading || cmNodes.length >= 2) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ConceptMap nodes={cmNodes} edges={cmEdges} loading={cmLoading} />
        </motion.div>
      )}

      {/* ── Agent Status ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="mb-8"
      >
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400 pulse-dot" />
          Agent Status
        </h2>
        <AgentStatus />
      </motion.div>

      {/* ── Quick Actions ────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-base font-bold text-white">Jump In</h2>
          <motion.span
            className="text-lg"
            animate={{ rotate: [0, 20, -20, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >👇</motion.span>
          <span className="tag tag-purple text-xs">Pick any feature</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map(({ label, desc, icon: Icon, to, grad, glow, emoji, badge }, i) => (
            <motion.button
              key={to}
              onClick={() => navigate(to)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.96 }}
              className="relative rounded-2xl p-5 text-left overflow-hidden group"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = `0 8px 32px ${glow}, 0 0 0 1px ${glow}`
                e.currentTarget.style.borderColor = glow
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              }}
            >
              {/* Hover gradient bg */}
              <div className={`absolute inset-0 bg-gradient-to-br ${grad} opacity-0 group-hover:opacity-15 transition-opacity duration-300 rounded-2xl`} />

              {/* Badge */}
              <div className="absolute top-3 right-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${glow.replace('0.5', '0.2')}`, color: 'white', border: `1px solid ${glow}` }}>
                  {badge}
                </span>
              </div>

              <div className="relative z-10">
                {/* Icon + emoji */}
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-lg`}
                    style={{ boxShadow: `0 4px 20px ${glow}` }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                  >
                    <Icon size={20} className="text-white" />
                  </motion.div>
                  <span className="text-2xl">{emoji}</span>
                </div>

                <p className="text-white font-bold text-sm leading-snug mb-1">{label}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>

                {/* Arrow */}
                <div className="flex items-center gap-1 mt-3">
                  <span className="text-xs font-semibold" style={{ color: glow.replace('0.5', '1') }}>
                    Open →
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

    </div>
  )
}
