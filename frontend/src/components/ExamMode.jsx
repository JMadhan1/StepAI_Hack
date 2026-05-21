import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardList, Play, Clock, CheckCircle, XCircle,
  Trophy, BarChart2, ChevronRight, RotateCcw, AlertTriangle,
  Star
} from 'lucide-react'
import axios from 'axios'
import { useApp } from '../App'
import API from '../config/api'

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
const TIME_OPTIONS  = [10, 15, 20, 30, 45, 60] // minutes

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, '0') }

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${pad(m)}:${pad(s)}`
}

function calcReport(questions, answers) {
  const byTopic = {}
  let correct = 0

  questions.forEach((q, i) => {
    const ans = answers[i]
    const isCorrect = ans === q.correct
    if (isCorrect) correct++

    if (!byTopic[q.topic]) byTopic[q.topic] = { correct: 0, total: 0 }
    byTopic[q.topic].total++
    if (isCorrect) byTopic[q.topic].correct++
  })

  return {
    correct,
    total: questions.length,
    percent: Math.round((correct / questions.length) * 100),
    byTopic,
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Phase: Config
// ──────────────────────────────────────────────────────────────────────────────
function ConfigPhase({ topics, onStart }) {
  const [selectedTopics, setSelectedTopics] = useState(topics.slice(0, Math.min(topics.length, 3)))
  const [numQ, setNumQ]           = useState(10)
  const [difficulty, setDifficulty] = useState('Medium')
  const [timeLimit, setTimeLimit]   = useState(20)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const toggleTopic = (t) =>
    setSelectedTopics((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    )

  const handleStart = async () => {
    if (selectedTopics.length === 0) { setError('Select at least one topic.'); return }
    setLoading(true); setError('')
    try {
      const res = await axios.post(`${API}/exam`, {
        topics: selectedTopics,
        num_questions: numQ,
        difficulty,
      })
      onStart(res.data.questions, timeLimit * 60)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate exam. Check backend.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="space-y-6">
      {/* Topics */}
      <div className="glass-card p-6">
        <p className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Select Topics</p>
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => toggleTopic(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedTopics.includes(t)
                  ? 'bg-purple-600/25 border-purple-500 text-purple-300'
                  : 'bg-white/4 border-white/10 text-slate-400 hover:border-purple-500/50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {topics.length === 0 && (
          <p className="text-slate-600 text-xs mt-2">Upload a PDF on Dashboard to use your own topics. Using defaults.</p>
        )}
      </div>

      {/* Settings grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Questions */}
        <div className="glass-card p-5">
          <p className="text-xs text-slate-500 mb-2">Questions</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setNumQ(Math.max(5, numQ - 5))}
              className="w-7 h-7 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 flex items-center justify-center text-lg">-</button>
            <span className="text-white font-bold text-xl flex-1 text-center">{numQ}</span>
            <button onClick={() => setNumQ(Math.min(30, numQ + 5))}
              className="w-7 h-7 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 flex items-center justify-center text-lg">+</button>
          </div>
        </div>

        {/* Difficulty */}
        <div className="glass-card p-5">
          <p className="text-xs text-slate-500 mb-2">Difficulty</p>
          <div className="flex gap-1">
            {DIFFICULTIES.map((d) => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`flex-1 py-1 rounded-lg text-xs font-medium transition-all ${
                  difficulty === d ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}>{d}</button>
            ))}
          </div>
        </div>

        {/* Time */}
        <div className="glass-card p-5">
          <p className="text-xs text-slate-500 mb-2">Time (min)</p>
          <div className="flex flex-wrap gap-1">
            {TIME_OPTIONS.map((t) => (
              <button key={t} onClick={() => setTimeLimit(t)}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  timeLimit === t ? 'bg-cyan-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}>{t}m</button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      <button onClick={handleStart} disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-3 hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg">
        {loading ? (
          <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Generating Exam...</>
        ) : (
          <><Play size={18} />Start Exam — {numQ} Questions · {timeLimit}min</>
        )}
      </button>
    </motion.div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Phase: Exam in progress
// ──────────────────────────────────────────────────────────────────────────────
function ExamPhase({ questions, timeLimit, onFinish }) {
  const [current, setCurrent]   = useState(0)
  const [answers, setAnswers]   = useState({})
  const [selected, setSelected] = useState(null)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [confirmed, setConfirmed] = useState(false)
  const timerRef = useRef(null)

  // Tick
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          // Auto-finish with current answers
          setAnswers((prev) => {
            onFinish({ ...prev }, true)
            return prev
          })
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, []) // eslint-disable-line

  const q = questions[current]
  const progress = ((current) / questions.length) * 100
  const isLast = current === questions.length - 1
  const isLow = timeLeft < 60

  const handleSelect = (opt) => {
    if (confirmed) return
    setSelected(opt)
  }

  const handleNext = () => {
    if (!selected) return
    const newAnswers = { ...answers, [current]: selected }
    setAnswers(newAnswers)
    setSelected(null)
    setConfirmed(false)

    if (isLast) {
      clearInterval(timerRef.current)
      onFinish(newAnswers, false)
    } else {
      setCurrent((c) => c + 1)
    }
  }

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-5">
      {/* Header bar */}
      <div className="glass-card p-4 flex items-center gap-4">
        {/* Timer */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-lg ${
          isLow
            ? 'bg-red-500/15 border-red-500/40 text-red-400 animate-pulse'
            : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
        }`}>
          <Clock size={16} />
          {formatTime(timeLeft)}
        </div>

        {/* Progress bar */}
        <div className="flex-1">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Question {current + 1} / {questions.length}</span>
            <span className="tag tag-purple">{q.topic}</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div key={current}
          initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }}
          className="glass-card p-7"
        >
          <p className="text-white font-semibold text-base leading-relaxed mb-6">{q.question}</p>

          <div className="space-y-3">
            {Object.entries(q.options).map(([key, val]) => (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-150 ${
                  selected === key
                    ? 'bg-purple-600/25 border-purple-500 text-white'
                    : 'bg-white/3 border-white/8 text-slate-300 hover:border-purple-500/50 hover:bg-white/6'
                }`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  selected === key ? 'bg-purple-600 text-white' : 'bg-white/8 text-slate-400'
                }`}>{key}</span>
                <span className="text-sm leading-snug">{val}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleNext}
              disabled={!selected}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {isLast ? 'Finish Exam' : 'Next'}
              <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Time warning */}
      {isLow && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
          <AlertTriangle size={14} className="text-red-400" />
          <p className="text-red-400 text-xs font-medium">Less than 1 minute remaining!</p>
        </motion.div>
      )}
    </motion.div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Phase: Report
// ──────────────────────────────────────────────────────────────────────────────
function ReportPhase({ questions, answers, timeUsed, timeLimitSeconds, onRetry, addXP }) {
  const report = calcReport(questions, answers)
  const timeTaken = timeLimitSeconds - (timeUsed || 0)

  useEffect(() => {
    addXP('EXAM_COMPLETE')
  }, []) // eslint-disable-line

  const grade = report.percent >= 90 ? 'A+' : report.percent >= 80 ? 'A' : report.percent >= 70 ? 'B' : report.percent >= 60 ? 'C' : 'F'
  const gradeColor = report.percent >= 80 ? 'text-green-400' : report.percent >= 60 ? 'text-yellow-400' : 'text-red-400'

  return (
    <motion.div initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }} className="space-y-6">
      {/* Score hero */}
      <div className="glass-card p-8 text-center">
        <div className={`text-7xl font-black mb-2 ${gradeColor}`}>{grade}</div>
        <div className="text-4xl font-black text-white mb-1">{report.percent}%</div>
        <p className="text-slate-400 text-sm">{report.correct} / {report.total} correct</p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className="tag tag-cyan">{formatTime(timeTaken)} used</span>
          <span className="tag tag-purple flex items-center gap-1"><Star size={10} /> +75 XP earned</span>
        </div>
      </div>

      {/* Per-topic breakdown */}
      <div className="glass-card p-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Topic Breakdown</p>
        <div className="space-y-3">
          {Object.entries(report.byTopic).map(([topic, data]) => {
            const pct = Math.round((data.correct / data.total) * 100)
            return (
              <div key={topic}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{topic}</span>
                  <span className={pct >= 70 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                    {data.correct}/{data.total} · {pct}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Per-question review */}
      <div className="glass-card p-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Question Review</p>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {questions.map((q, i) => {
            const ans = answers[i]
            const isCorrect = ans === q.correct
            return (
              <div key={i} className={`p-4 rounded-xl border ${isCorrect ? 'border-green-500/25 bg-green-500/5' : 'border-red-500/25 bg-red-500/5'}`}>
                <div className="flex items-start gap-3">
                  {isCorrect
                    ? <CheckCircle size={15} className="text-green-400 mt-0.5 flex-shrink-0" />
                    : <XCircle    size={15} className="text-red-400   mt-0.5 flex-shrink-0" />
                  }
                  <div className="flex-1">
                    <p className="text-slate-300 text-sm leading-snug">{q.question}</p>
                    {!isCorrect && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                          Your answer: {ans || 'Skipped'} — {q.options[ans] || '—'}
                        </span>
                        <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                          Correct: {q.correct} — {q.options[q.correct]}
                        </span>
                      </div>
                    )}
                    <p className="text-slate-500 text-xs mt-1 italic">{q.explanation}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <button onClick={onRetry}
        className="w-full py-3.5 glass-card border border-purple-600/30 text-purple-300 font-semibold flex items-center justify-center gap-2 hover:bg-purple-600/10 transition-colors rounded-2xl">
        <RotateCcw size={16} /> Try Again
      </button>
    </motion.div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Main ExamMode
// ──────────────────────────────────────────────────────────────────────────────
export default function ExamMode() {
  const { uploadedTopics, addXP } = useApp()
  const topics = uploadedTopics.length > 0 ? uploadedTopics : ['Mathematics', 'Physics', 'Chemistry', 'Biology']

  const [phase, setPhase]       = useState('config') // config | exam | report
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers]   = useState({})
  const [timeLimitSec, setTimeLimitSec] = useState(0)
  const [timeLeftAtEnd, setTimeLeftAtEnd] = useState(0)

  const handleStart = (qs, seconds) => {
    setQuestions(qs)
    setTimeLimitSec(seconds)
    setPhase('exam')
  }

  const handleFinish = (ans, timedOut) => {
    setAnswers(ans)
    setTimeLeftAtEnd(timedOut ? 0 : null)
    setPhase('report')
  }

  const handleRetry = () => {
    setQuestions([])
    setAnswers({})
    setPhase('config')
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center">
            <ClipboardList size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Exam Mode</h1>
            <p className="text-slate-400 text-sm">Timed multi-topic exam — no going back</p>
          </div>
          {phase === 'config' && (
            <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30">
              <Trophy size={10} className="text-red-400" />
              <span className="text-red-400 text-xs font-medium">+75 XP on completion</span>
            </div>
          )}
          {phase === 'exam' && (
            <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/40">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 text-xs font-bold">EXAM IN PROGRESS</span>
            </div>
          )}
        </div>
      </motion.div>

      {phase === 'config' && <ConfigPhase topics={topics} onStart={handleStart} />}
      {phase === 'exam'   && <ExamPhase questions={questions} timeLimit={timeLimitSec} onFinish={handleFinish} />}
      {phase === 'report' && (
        <ReportPhase
          questions={questions}
          answers={answers}
          timeUsed={timeLeftAtEnd}
          timeLimitSeconds={timeLimitSec}
          onRetry={handleRetry}
          addXP={addXP}
        />
      )}
    </div>
  )
}
