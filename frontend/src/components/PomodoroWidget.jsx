import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, Play, Pause, RotateCcw, X, Coffee, Zap } from 'lucide-react'
import { useApp } from '../App'

const MODES = {
  focus:      { label: 'Focus',       minutes: 25, color: '#7c3aed', bg: 'from-purple-600 to-violet-600' },
  short:      { label: 'Short Break', minutes: 5,  color: '#06b6d4', bg: 'from-cyan-500 to-sky-600'      },
  long:       { label: 'Long Break',  minutes: 15, color: '#22c55e', bg: 'from-green-500 to-emerald-600' },
}

function pad(n) { return String(n).padStart(2, '0') }

export default function PomodoroWidget() {
  const { addXP } = useApp()
  const [open, setOpen]       = useState(false)
  const [mode, setMode]       = useState('focus')
  const [running, setRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(MODES.focus.minutes * 60)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef(null)

  const total = MODES[mode].minutes * 60
  const progress = ((total - timeLeft) / total) * 100
  const circumference = 2 * Math.PI * 52 // r=52
  const dash = (progress / 100) * circumference

  useEffect(() => {
    setTimeLeft(MODES[mode].minutes * 60)
    setRunning(false)
  }, [mode])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            handleComplete()
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running]) // eslint-disable-line

  const handleComplete = () => {
    if (mode === 'focus') {
      setSessions((s) => s + 1)
      addXP('FLASHCARD_SESSION') // reuse 25 XP event
      // Auto-switch to break
      setMode(sessions > 0 && (sessions + 1) % 4 === 0 ? 'long' : 'short')
    } else {
      setMode('focus')
    }
  }

  const reset = () => {
    clearInterval(intervalRef.current)
    setRunning(false)
    setTimeLeft(MODES[mode].minutes * 60)
  }

  const m = Math.floor(timeLeft / 60)
  const s = timeLeft % 60
  const cfg = MODES[mode]

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-8 right-8 z-[9998] w-12 h-12 rounded-full shadow-2xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {running ? (
          <span className="text-white font-bold text-xs">{pad(m)}:{pad(s)}</span>
        ) : (
          <Timer size={18} className="text-white" />
        )}
        {running && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-pulse" />
        )}
      </motion.button>

      {/* Expanded widget */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.85, y: 20  }}
            className="fixed bottom-24 right-8 z-[9997] w-72 glass-card p-6 shadow-2xl"
            style={{ border: '1px solid rgba(124,58,237,0.3)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Timer size={14} className="text-purple-400" />
                <span className="text-white font-semibold text-sm">Focus Timer</span>
                {sessions > 0 && (
                  <span className="tag tag-purple">{sessions} done</span>
                )}
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-600 hover:text-slate-400">
                <X size={14} />
              </button>
            </div>

            {/* Mode tabs */}
            <div className="flex gap-1 mb-5">
              {Object.entries(MODES).map(([key, m]) => (
                <button key={key} onClick={() => setMode(key)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    mode === key ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}>{m.label}</button>
              ))}
            </div>

            {/* SVG circular timer */}
            <div className="flex flex-col items-center mb-5">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  {/* Track */}
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  {/* Progress */}
                  <circle
                    cx="60" cy="60" r="52"
                    fill="none"
                    stroke={cfg.color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - dash}
                    style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 6px ${cfg.color})` }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white font-black text-2xl tabular-nums">{pad(m)}:{pad(s)}</span>
                  <span className="text-slate-500 text-xs">{cfg.label}</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => setRunning((r) => !r)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-r ${cfg.bg} hover:opacity-90 transition-opacity`}
              >
                {running ? <Pause size={14} /> : <Play size={14} />}
                {running ? 'Pause' : 'Start'}
              </button>
              <button onClick={reset}
                className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <RotateCcw size={14} />
              </button>
            </div>

            {/* XP hint */}
            <div className="mt-3 flex items-center gap-1.5 justify-center">
              <Zap size={10} className="text-yellow-400" />
              <p className="text-slate-600 text-xs">+25 XP on each focus session</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
