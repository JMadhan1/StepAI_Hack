import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'eduagent_gamification'

const LEVELS = [
  { level: 1, title: 'Novice',       minXP: 0,    maxXP: 99,   color: 'text-slate-400',  bg: 'from-slate-600 to-slate-500'    },
  { level: 2, title: 'Learner',      minXP: 100,  maxXP: 299,  color: 'text-green-400',  bg: 'from-green-600 to-emerald-500'  },
  { level: 3, title: 'Scholar',      minXP: 300,  maxXP: 599,  color: 'text-cyan-400',   bg: 'from-cyan-600 to-sky-500'       },
  { level: 4, title: 'Expert',       minXP: 600,  maxXP: 999,  color: 'text-purple-400', bg: 'from-purple-600 to-violet-500'  },
  { level: 5, title: 'Master',       minXP: 1000, maxXP: 1999, color: 'text-yellow-400', bg: 'from-yellow-500 to-amber-400'   },
  { level: 6, title: 'Grandmaster',  minXP: 2000, maxXP: Infinity, color: 'text-pink-400', bg: 'from-pink-600 to-rose-500'   },
]

export const XP_EVENTS = {
  UPLOAD_PDF:       { xp: 50,  label: '+50 XP',  desc: 'Uploaded PDF'           },
  GENERATE_PLAN:    { xp: 30,  label: '+30 XP',  desc: 'Generated study plan'   },
  TAKE_QUIZ:        { xp: 20,  label: '+20 XP',  desc: 'Completed quiz'         },
  CORRECT_ANSWER:   { xp: 10,  label: '+10 XP',  desc: 'Correct answer'         },
  FLASHCARD_SESSION:{ xp: 25,  label: '+25 XP',  desc: 'Flashcard session done' },
  SOLVE_DOUBT:      { xp: 10,  label: '+10 XP',  desc: 'Solved a doubt'         },
  EXAM_COMPLETE:    { xp: 75,  label: '+75 XP',  desc: 'Completed exam mode'    },
  DAILY_STREAK:     { xp: 15,  label: '+15 XP',  desc: 'Daily streak bonus'     },
}

function getLevelInfo(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i]
  }
  return LEVELS[0]
}

function getProgressPercent(xp) {
  const lvl = getLevelInfo(xp)
  if (lvl.maxXP === Infinity) return 100
  const range = lvl.maxXP - lvl.minXP + 1
  const progress = xp - lvl.minXP
  return Math.min(100, Math.round((progress / range) * 100))
}

function todayKey() {
  return new Date().toISOString().split('T')[0]
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return { xp: 0, streak: 0, lastActiveDate: null, badges: [], history: [] }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export default function useGamification() {
  const [state, setState] = useState(loadState)
  const [toast, setToast] = useState(null) // { xp, desc, levelUp }

  // Persist whenever state changes
  useEffect(() => { saveState(state) }, [state])

  const addXP = useCallback((eventKey) => {
    const event = XP_EVENTS[eventKey]
    if (!event) return

    setState((prev) => {
      const prevLevel = getLevelInfo(prev.xp)
      const newXP = prev.xp + event.xp
      const newLevel = getLevelInfo(newXP)
      const levelUp = newLevel.level > prevLevel.level

      // Update streak
      const today = todayKey()
      let streak = prev.streak
      if (prev.lastActiveDate !== today) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yKey = yesterday.toISOString().split('T')[0]
        streak = prev.lastActiveDate === yKey ? streak + 1 : 1
      }

      const next = {
        ...prev,
        xp: newXP,
        streak,
        lastActiveDate: today,
        history: [
          { event: eventKey, xp: event.xp, time: Date.now() },
          ...prev.history.slice(0, 49),
        ],
      }

      // Show toast
      setTimeout(() => {
        setToast({ xp: event.xp, desc: event.desc, levelUp, newTitle: newLevel.title })
        setTimeout(() => setToast(null), 3000)
      }, 0)

      return next
    })
  }, [])

  const levelInfo = getLevelInfo(state.xp)
  const progressPercent = getProgressPercent(state.xp)
  const nextLevel = LEVELS.find((l) => l.level === levelInfo.level + 1)

  return {
    xp: state.xp,
    streak: state.streak,
    levelInfo,
    progressPercent,
    nextLevel,
    toast,
    addXP,
    history: state.history,
  }
}
