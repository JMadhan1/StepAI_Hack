import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, CheckCircle, XCircle, Trophy, RotateCcw, Loader, Clock } from 'lucide-react'
import axios from 'axios'
import { useApp } from '../App'
import { useNavigate } from 'react-router-dom'

import API from '../config/api'

export default function QuizArena() {
  const navigate = useNavigate()
  const { uploadedTopics, setPerformanceHistory, setWeakAreas, setAgent, addXP } = useApp()
  const topics = uploadedTopics.length > 0 ? uploadedTopics : ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History']

  const [topic, setTopic] = useState(topics[0] || 'Mathematics')
  const [difficulty, setDifficulty] = useState('Medium')
  const [phase, setPhase] = useState('setup') // setup | loading | quiz | result
  const [questions, setQuestions] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selected, setSelected] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [score, setScore] = useState(0)
  const [error, setError] = useState('')
  const timerRef = useRef(null)

  useEffect(() => {
    if (phase === 'quiz' && !showExplanation) {
      setTimeLeft(60)
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current)
            handleSelect('timeout')
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [phase, currentIdx, showExplanation])

  const startQuiz = async () => {
    setPhase('loading')
    setError('')
    setAgent('quiz', 'active')
    try {
      const res = await axios.post(`${API}/quiz`, { topic, difficulty })
      setQuestions(res.data.questions)
      setCurrentIdx(0)
      setAnswers({})
      setScore(0)
      setSelected(null)
      setShowExplanation(false)
      setPhase('quiz')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate quiz.')
      setPhase('setup')
    } finally {
      setAgent('quiz', 'idle')
    }
  }

  const handleSelect = (opt) => {
    if (selected !== null) return
    clearInterval(timerRef.current)
    setSelected(opt)
    setShowExplanation(true)
    const q = questions[currentIdx]
    const newAnswers = { ...answers, [q.id]: opt }
    setAnswers(newAnswers)
    if (opt === q.correct) setScore((s) => s + 1)
  }

  const nextQuestion = () => {
    if (currentIdx + 1 >= questions.length) {
      submitQuiz()
    } else {
      setCurrentIdx((i) => i + 1)
      setSelected(null)
      setShowExplanation(false)
    }
  }

  const submitQuiz = async () => {
    setPhase('result')
    addXP('TAKE_QUIZ')
    const wrong = questions
      .filter((q) => answers[q.id] !== q.correct)
      .map((q) => q.question.slice(0, 60))

    setAgent('tracker', 'active')
    try {
      const res = await axios.post(`${API}/submit-quiz`, {
        topic,
        score,
        total: questions.length,
        wrong_questions: wrong,
        answers,
      })
      setWeakAreas(res.data.weak_areas || [])
      setPerformanceHistory((prev) => [
        ...prev,
        { topic, score, total: questions.length, percentage: res.data.percentage },
      ])
    } catch (err) {
      console.error('Submit quiz error:', err)
    } finally {
      setAgent('tracker', 'idle')
    }
  }

  if (phase === 'setup') {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-purple-600 flex items-center justify-center">
            <Brain size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Quiz Arena</h1>
            <p className="text-slate-400 text-sm">Adaptive quizzes with AI explanations</p>
          </div>
        </div>

        <div className="glass-card p-8 space-y-6">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Topic</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-white/5 border border-purple-600/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            >
              {topics.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-3 block">Difficulty</label>
            <div className="grid grid-cols-3 gap-3">
              {['Easy', 'Medium', 'Hard'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-3 rounded-xl border font-medium text-sm transition-all ${
                    difficulty === d
                      ? d === 'Easy' ? 'border-green-500 bg-green-500/10 text-green-300'
                        : d === 'Medium' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-300'
                        : 'border-red-500 bg-red-500/10 text-red-300'
                      : 'border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            onClick={startQuiz}
            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl text-white font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            Start Quiz
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'loading') {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader size={40} className="text-purple-400 animate-spin mx-auto" />
          <p className="text-white font-semibold">Quiz Agent is generating questions...</p>
          <p className="text-slate-500 text-sm">Analyzing your syllabus for {topic}</p>
        </div>
      </div>
    )
  }

  if (phase === 'quiz' && questions.length > 0) {
    const q = questions[currentIdx]
    const progress = ((currentIdx + (showExplanation ? 1 : 0)) / questions.length) * 100

    return (
      <div className="p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-purple-400 text-sm font-medium">{topic}</span>
            <span className="text-slate-600 mx-2">·</span>
            <span className="text-slate-500 text-sm">{difficulty}</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <Clock size={14} className={timeLeft <= 10 ? 'text-red-400' : 'text-cyan-400'} />
            <span className={`font-mono font-bold text-lg ${timeLeft <= 10 ? 'text-red-400' : 'text-cyan-400'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/5 rounded-full mb-8">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>

        <div className="text-sm text-slate-500 mb-2">Question {currentIdx + 1} of {questions.length}</div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="glass-card p-6 mb-5">
              <p className="text-white text-lg leading-relaxed">{q.question}</p>
            </div>

            <div className="space-y-3 mb-6">
              {Object.entries(q.options).map(([key, text]) => {
                let style = 'border-white/10 hover:border-purple-500/50 text-slate-300 hover:text-white'
                if (selected !== null) {
                  if (key === q.correct) style = 'border-green-500 bg-green-500/10 text-green-300'
                  else if (key === selected && key !== q.correct) style = 'border-red-500 bg-red-500/10 text-red-300'
                  else style = 'border-white/5 text-slate-500'
                }
                return (
                  <button
                    key={key}
                    onClick={() => handleSelect(key)}
                    disabled={selected !== null}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${style}`}
                  >
                    <span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {key}
                    </span>
                    <span className="text-left text-sm">{text}</span>
                    {selected !== null && key === q.correct && (
                      <CheckCircle size={16} className="text-green-400 ml-auto flex-shrink-0" />
                    )}
                    {key === selected && key !== q.correct && (
                      <XCircle size={16} className="text-red-400 ml-auto flex-shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>

            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 mb-5 border-l-2 border-cyan-500"
              >
                <p className="text-cyan-400 text-xs font-semibold mb-1">Explanation</p>
                <p className="text-slate-300 text-sm">{q.explanation}</p>
              </motion.div>
            )}

            {showExplanation && (
              <button
                onClick={nextQuestion}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
              >
                {currentIdx + 1 >= questions.length ? 'See Results' : 'Next Question →'}
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  if (phase === 'result') {
    const pct = Math.round((score / questions.length) * 100)
    const color = pct >= 80 ? 'text-green-400' : pct >= 60 ? 'text-yellow-400' : 'text-red-400'

    return (
      <div className="p-8 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="glass-card p-10 text-center mb-6">
            <Trophy size={48} className="mx-auto mb-4 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h2>
            <p className="text-slate-400 mb-6">{topic} · {difficulty}</p>
            <div className={`text-7xl font-black mb-2 ${color}`}>{pct}%</div>
            <p className="text-slate-400">{score} / {questions.length} correct</p>
            <p className="text-slate-500 text-sm mt-2">
              {pct >= 80 ? '🌟 Excellent! You mastered this topic.' : pct >= 60 ? '✅ Good job! A bit more practice will help.' : '📚 Keep studying — you\'ve got this!'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setPhase('setup'); setQuestions([]) }}
              className="flex items-center justify-center gap-2 py-3 glass-card border-purple-600/30 text-purple-300 hover:border-purple-500 transition-colors"
            >
              <RotateCcw size={16} />
              Try Again
            </button>
            <button
              onClick={() => navigate('/tracker')}
              className="py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
            >
              View Progress →
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return null
}
