import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, RotateCcw, CheckCircle, RefreshCw, Loader, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react'
import axios from 'axios'
import katex from 'katex'
import { useApp } from '../App'

import API from '../config/api'

const STATUS_COLORS = {
  unseen:   'border-white/10 text-slate-400',
  known:    'border-green-500/40 text-green-400',
  learning: 'border-yellow-500/40 text-yellow-400',
}

export default function Flashcards() {
  const { uploadedTopics, setAgent } = useApp()
  const topics = uploadedTopics.length > 0 ? uploadedTopics : ['Mathematics', 'Physics', 'Chemistry', 'Biology']

  const [topic, setTopic]       = useState(topics[0] || 'Mathematics')
  const [cards, setCards]       = useState([])
  const [idx, setIdx]           = useState(0)
  const [flipped, setFlipped]   = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [phase, setPhase]       = useState('setup') // setup | study | done

  const generate = async () => {
    setLoading(true)
    setError('')
    setAgent('quiz', 'active')
    try {
      const res = await axios.post(`${API}/flashcards`, { topic })
      const loaded = res.data.cards.map((c) => ({ ...c, status: 'unseen' }))
      setCards(loaded)
      setIdx(0)
      setFlipped(false)
      setShowHint(false)
      setPhase('study')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate flashcards.')
    } finally {
      setLoading(false)
      setAgent('quiz', 'idle')
    }
  }

  const markCard = (status) => {
    const updated = cards.map((c, i) => i === idx ? { ...c, status } : c)
    setCards(updated)
    setFlipped(false)
    setShowHint(false)
    if (idx + 1 >= cards.length) {
      setPhase('done')
    } else {
      setIdx((i) => i + 1)
    }
  }

  const restart = () => {
    setCards(cards.map((c) => ({ ...c, status: 'unseen' })))
    // Spaced repetition: put "learning" cards first, then "known"
    const learning = cards.filter((c) => c.status === 'learning')
    const known    = cards.filter((c) => c.status === 'known')
    setCards([...learning, ...known].map((c) => ({ ...c, status: 'unseen' })))
    setIdx(0)
    setFlipped(false)
    setShowHint(false)
    setPhase('study')
  }

  const renderLatex = (formula) => {
    try {
      return katex.renderToString(formula.replace(/^\$\$?/, '').replace(/\$\$?$/, ''), {
        displayMode: true, throwOnError: false
      })
    } catch { return formula }
  }

  // ── Setup screen ──────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Layers size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Flashcards</h1>
            <p className="text-slate-400 text-sm">AI-generated cards with spaced repetition</p>
          </div>
        </div>

        <div className="glass-card p-8 space-y-6">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Choose Topic</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-white/5 border border-purple-600/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            >
              {topics.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {[['8', 'Flash Cards'], ['∞', 'Spaced Rep'], ['AI', 'Hints']].map(([val, lbl]) => (
              <div key={lbl} className="p-3 bg-purple-600/10 border border-purple-600/20 rounded-xl">
                <div className="text-purple-400 font-bold text-lg">{val}</div>
                <div className="text-slate-500 text-xs">{lbl}</div>
              </div>
            ))}
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <><Loader size={16} className="animate-spin" />Generating...</> : <><Layers size={16} />Generate Flashcards</>}
          </button>
        </div>
      </div>
    )
  }

  // ── Done screen ────────────────────────────────────────────────────────────
  if (phase === 'done') {
    const known    = cards.filter((c) => c.status === 'known').length
    const learning = cards.filter((c) => c.status === 'learning').length
    return (
      <div className="p-8 max-w-xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="glass-card p-10 text-center mb-6">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-4">Round Complete!</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="text-3xl font-bold text-green-400">{known}</div>
                <div className="text-xs text-slate-400 mt-1">Got It ✓</div>
              </div>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <div className="text-3xl font-bold text-yellow-400">{learning}</div>
                <div className="text-xs text-slate-400 mt-1">Still Learning</div>
              </div>
            </div>
            {learning > 0 && (
              <p className="text-slate-400 text-sm mb-4">
                {learning} card{learning > 1 ? 's' : ''} will be prioritized in the next round.
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={restart} className="flex items-center justify-center gap-2 py-3 glass-card border-purple-600/30 text-purple-300 hover:border-purple-500">
              <RefreshCw size={15} /> Review Again
            </button>
            <button onClick={() => { setPhase('setup'); setCards([]) }} className="py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:opacity-90">
              New Topic
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Study screen ───────────────────────────────────────────────────────────
  const card = cards[idx]
  const progress = (idx / cards.length) * 100

  return (
    <div className="p-8 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-purple-400 text-sm font-medium">{topic}</span>
          <span className="text-slate-600 mx-2">·</span>
          <span className="text-slate-500 text-sm">{idx + 1} / {cards.length}</span>
        </div>
        <div className="flex gap-2">
          {cards.map((c, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${
              i === idx ? 'bg-purple-400 scale-125' :
              c.status === 'known' ? 'bg-green-500' :
              c.status === 'learning' ? 'bg-yellow-500' : 'bg-white/10'
            }`} />
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-white/5 rounded-full mb-8">
        <motion.div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" animate={{ width: `${progress}%` }} />
      </div>

      {/* Card */}
      <div className="perspective-1000 mb-6" style={{ perspective: '1000px' }}>
        <motion.div
          className="relative cursor-pointer"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
          onClick={() => { setFlipped((f) => !f); setShowHint(false) }}
        >
          {/* Front */}
          <div className="glass-card p-8 min-h-[220px] flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: 'hidden' }}>
            <span className={`text-xs font-semibold uppercase tracking-wider mb-4 px-3 py-1 rounded-full border ${STATUS_COLORS[card.difficulty] || STATUS_COLORS.unseen}`}>
              {card.difficulty}
            </span>
            <p className="text-white text-lg leading-relaxed font-medium">{card.front}</p>
            <p className="text-slate-600 text-xs mt-6">Click to reveal answer</p>
          </div>

          {/* Back */}
          <div className="glass-card p-8 min-h-[220px] flex flex-col items-center justify-center text-center absolute inset-0 border-purple-600/30"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <p className="text-slate-300 text-base leading-relaxed mb-4">{card.back}</p>
            {card.has_formula && card.formula && (
              <div
                className="my-2 p-3 bg-purple-900/30 border border-purple-600/20 rounded-xl overflow-x-auto w-full"
                dangerouslySetInnerHTML={{ __html: renderLatex(card.formula) }}
              />
            )}
          </div>
        </motion.div>
      </div>

      {/* Hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-card p-3 mb-4 border-yellow-500/20 flex items-center gap-2">
            <Lightbulb size={14} className="text-yellow-400 flex-shrink-0" />
            <p className="text-yellow-300 text-sm">{card.hint}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      {!flipped ? (
        <div className="flex gap-3">
          <button onClick={() => setShowHint(true)} disabled={showHint}
            className="flex-1 py-3 glass-card border-yellow-500/20 text-yellow-400 hover:border-yellow-500/40 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40">
            <Lightbulb size={14} /> Hint
          </button>
          <button onClick={() => setFlipped(true)}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium text-sm hover:opacity-90">
            Reveal Answer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => markCard('learning')}
            className="py-3 glass-card border-yellow-500/30 text-yellow-300 hover:border-yellow-500/50 font-medium text-sm flex items-center justify-center gap-2">
            <RotateCcw size={14} /> Still Learning
          </button>
          <button onClick={() => markCard('known')}
            className="py-3 bg-green-600/80 border border-green-500/40 rounded-xl text-white font-medium text-sm hover:bg-green-600 flex items-center justify-center gap-2">
            <CheckCircle size={14} /> Got It!
          </button>
        </div>
      )}

      {/* Skip */}
      <div className="flex justify-between mt-4">
        <button onClick={() => { setIdx((i) => Math.max(0, i - 1)); setFlipped(false); setShowHint(false) }}
          disabled={idx === 0}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-400 text-xs disabled:opacity-0 transition-colors">
          <ChevronLeft size={13} /> Previous
        </button>
        <button onClick={() => markCard('unseen')}
          className="text-slate-600 hover:text-slate-400 text-xs transition-colors">
          Skip →
        </button>
      </div>
    </div>
  )
}
