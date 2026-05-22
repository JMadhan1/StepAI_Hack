import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, ChevronDown, ChevronUp, Loader2, Download,
  Lightbulb, BookMarked, Zap, GraduationCap, Sparkles,
  Star, BookOpen, FlaskConical, Atom, Globe, Calculator,
  Brain, Code2, Music, Palette, Trophy, Flame,
} from 'lucide-react'
import axios from 'axios'
import katex from 'katex'
import { useApp } from '../App'
import API from '../config/api'

// ── Topic card palette ─────────────────────────────────────────────────────
const CARD_STYLES = [
  { bg: 'from-violet-600 to-purple-800',  border: 'rgba(167,139,250,0.6)', glow: '0 0 30px rgba(167,139,250,0.4)', icon: Brain,        emoji: '🧠' },
  { bg: 'from-cyan-500 to-blue-700',      border: 'rgba(103,232,249,0.6)', glow: '0 0 30px rgba(103,232,249,0.4)', icon: Atom,         emoji: '⚛️' },
  { bg: 'from-green-500 to-emerald-700',  border: 'rgba(134,239,172,0.6)', glow: '0 0 30px rgba(134,239,172,0.4)', icon: FlaskConical, emoji: '🧪' },
  { bg: 'from-orange-500 to-red-700',     border: 'rgba(253,186,116,0.6)', glow: '0 0 30px rgba(253,186,116,0.4)', icon: Flame,        emoji: '🔥' },
  { bg: 'from-pink-500 to-rose-700',      border: 'rgba(249,168,212,0.6)', glow: '0 0 30px rgba(249,168,212,0.4)', icon: Sparkles,     emoji: '✨' },
  { bg: 'from-yellow-500 to-amber-600',   border: 'rgba(253,230,138,0.6)', glow: '0 0 30px rgba(253,230,138,0.4)', icon: Star,         emoji: '⭐' },
  { bg: 'from-indigo-500 to-blue-800',    border: 'rgba(165,180,252,0.6)', glow: '0 0 30px rgba(165,180,252,0.4)', icon: Globe,        emoji: '🌍' },
  { bg: 'from-teal-500 to-cyan-700',      border: 'rgba(94,234,212,0.6)',  glow: '0 0 30px rgba(94,234,212,0.4)',  icon: Calculator,   emoji: '📐' },
  { bg: 'from-fuchsia-600 to-purple-900', border: 'rgba(240,171,252,0.6)', glow: '0 0 30px rgba(240,171,252,0.4)', icon: Music,        emoji: '🎵' },
  { bg: 'from-red-500 to-rose-800',       border: 'rgba(252,165,165,0.6)', glow: '0 0 30px rgba(252,165,165,0.4)', icon: Code2,        emoji: '💻' },
]

const SECTION_COLORS = [
  { num: 'bg-violet-600', bar: 'border-violet-500', accent: '#a78bfa' },
  { num: 'bg-cyan-600',   bar: 'border-cyan-500',   accent: '#67e8f9' },
  { num: 'bg-green-600',  bar: 'border-green-500',  accent: '#86efac' },
  { num: 'bg-orange-600', bar: 'border-orange-500', accent: '#fdba74' },
  { num: 'bg-pink-600',   bar: 'border-pink-500',   accent: '#f9a8d4' },
  { num: 'bg-yellow-600', bar: 'border-yellow-500', accent: '#fde68a' },
]

function renderLatex(formula) {
  try {
    return katex.renderToString(formula.replace(/^\$\$?/, '').replace(/\$\$?$/, ''), {
      displayMode: true, throwOnError: false,
    })
  } catch { return formula }
}

function Section({ section, index }) {
  const [open, setOpen] = useState(index === 0)
  const c = SECTION_COLORS[index % SECTION_COLORS.length]
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className={`glass-card overflow-hidden border-l-4 ${c.bar}`}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/3 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-full ${c.num} flex items-center justify-center text-white text-xs font-black shadow-lg`}>
            {index + 1}
          </div>
          <span className="text-white font-semibold group-hover:text-white/90 transition-colors">
            {section.heading}
          </span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={16} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/5">
              <p className="text-slate-300 text-sm leading-relaxed mt-4 mb-4">{section.content}</p>
              {section.has_formula && section.formula && (
                <div
                  className="my-3 p-4 rounded-xl overflow-x-auto"
                  style={{ background: `${c.accent}18`, border: `1px solid ${c.accent}40` }}
                  dangerouslySetInnerHTML={{ __html: renderLatex(section.formula) }}
                />
              )}
              <ul className="space-y-2">
                {section.key_points?.map((pt, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-2 text-slate-400 text-sm"
                  >
                    <span style={{ color: c.accent }} className="mt-0.5 flex-shrink-0 font-bold">▸</span>
                    {pt}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Floating decorative sparks ─────────────────────────────────────────────
const SPARKS = ['✦','✧','⋆','✺','◈','❋']
function FloatingSpark({ char, delay, x, duration }) {
  return (
    <motion.span
      className="absolute text-purple-400/30 select-none pointer-events-none font-bold"
      style={{ left: `${x}%`, top: '10%', fontSize: '1.1rem' }}
      animate={{ y: [0, -40, 0], opacity: [0.3, 0.8, 0.3], rotate: [0, 180, 360] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {char}
    </motion.span>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function StudyNotes() {
  const { uploadedTopics, setAgent } = useApp()
  const topics = uploadedTopics.length > 0
    ? uploadedTopics
    : ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Computer Science']

  const [topic, setTopic]     = useState(topics[0] || 'Mathematics')
  const [notes, setNotes]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [generated, setGenerated] = useState(false)

  const generate = async () => {
    setLoading(true); setError(''); setNotes(null); setGenerated(false)
    setAgent('research', 'active')
    try {
      const res = await axios.post(`${API}/notes`, { topic })
      setNotes(res.data)
      setGenerated(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate notes.')
    } finally {
      setLoading(false)
      setAgent('research', 'idle')
    }
  }

  const sparks = SPARKS.map((c, i) => ({
    char: c, delay: i * 0.8, x: 5 + i * 15, duration: 3 + i * 0.5,
  }))

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-10 text-center overflow-hidden"
      >
        {sparks.map((s, i) => <FloatingSpark key={i} {...s} />)}

        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-bold uppercase tracking-widest"
          style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#a78bfa' }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles size={11} /> AI-Powered Study Notes
        </motion.div>

        <h1 className="text-4xl font-black mb-2 hero-text">Study Notes</h1>
        <p className="text-slate-400 text-sm">Pick a topic → AI writes your complete exam notes in seconds</p>
      </motion.div>

      {/* ── Topic grid ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <BookOpen size={12} /> Choose your topic
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {topics.map((t, i) => {
            const s = CARD_STYLES[i % CARD_STYLES.length]
            const Icon = s.icon
            const isSelected = topic === t
            return (
              <motion.button
                key={t}
                onClick={() => setTopic(t)}
                whileHover={{ scale: 1.04, y: -3 }}
                whileTap={{ scale: 0.96 }}
                className="relative rounded-2xl p-4 text-left transition-all duration-200 overflow-hidden"
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`
                    : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${isSelected ? s.border : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: isSelected ? s.glow : 'none',
                }}
              >
                {/* Gradient bg when selected */}
                {isSelected && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.bg} opacity-25 rounded-2xl`} />
                )}

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{s.emoji}</span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-4 h-4 rounded-full bg-white flex items-center justify-center"
                      >
                        <div className="w-2 h-2 rounded-full bg-purple-600" />
                      </motion.div>
                    )}
                  </div>
                  <p className={`text-sm font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {t}
                  </p>
                </div>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* ── Generate button ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <motion.button
          onClick={generate}
          disabled={loading}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full relative py-5 rounded-2xl text-white font-black text-lg flex items-center justify-center gap-3 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed sparkle-btn"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 50%, #ec4899 100%)',
            backgroundSize: '200% 200%',
          }}
        >
          {/* Animated background sweep */}
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />

          {loading ? (
            <>
              <Loader2 size={22} className="animate-spin relative z-10" />
              <span className="relative z-10">Generating your notes...</span>
            </>
          ) : (
            <>
              <Sparkles size={22} className="relative z-10" />
              <span className="relative z-10">
                Generate Notes for "{topic}"
              </span>
              <motion.span
                className="relative z-10 text-2xl"
                animate={{ rotate: [0, 20, -20, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ✨
              </motion.span>
            </>
          )}
        </motion.button>
      </motion.div>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-4 border border-red-500/30 mb-6 flex items-center gap-3"
        >
          <span className="text-2xl">😕</span>
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-16 gap-6"
        >
          <div className="relative">
            <motion.div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.3))', border: '2px solid rgba(124,58,237,0.4)' }}
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🧠
            </motion.div>
            <motion.div
              className="absolute -inset-2 rounded-full"
              style={{ border: '2px solid rgba(124,58,237,0.3)' }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <div>
            <p className="text-white font-bold text-center mb-1">AI is crafting your notes...</p>
            <p className="text-slate-500 text-sm text-center">Building summaries, key terms & exam tips</p>
          </div>
          <div className="flex gap-2">
            {['📚','✏️','💡','🎯'].map((em, i) => (
              <motion.span
                key={i}
                className="text-xl"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
              >
                {em}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Notes output ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {notes && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5 print:text-black"
          >
            {/* Success banner */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-between p-4 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.15))', border: '1px solid rgba(124,58,237,0.3)' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎉</span>
                <div>
                  <p className="text-white font-bold">Notes ready!</p>
                  <p className="text-slate-400 text-xs">Complete study guide for "{topic}"</p>
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <Download size={12} /> Export
              </button>
            </motion.div>

            {/* Title + Summary */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
              style={{ borderLeft: '4px solid #7c3aed' }}
            >
              <h2 className="text-2xl font-black gradient-text mb-3">{notes.title}</h2>
              <p className="text-slate-300 text-sm leading-relaxed">{notes.summary}</p>
            </motion.div>

            {/* Quick Facts */}
            {notes.quick_facts?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass-card p-5"
              >
                <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2 mb-4">
                  <Zap size={15} /> Quick Facts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {notes.quick_facts.map((fact, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * i }}
                      className="flex items-start gap-2 text-slate-300 text-xs p-3 rounded-xl"
                      style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}
                    >
                      <span className="text-cyan-400 flex-shrink-0">⚡</span> {fact}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Detailed Sections */}
            {notes.sections?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookMarked size={14} className="text-purple-400" /> Detailed Notes
                </h3>
                {notes.sections.map((s, i) => <Section key={i} section={s} index={i} />)}
              </div>
            )}

            {/* Key Terms */}
            {notes.key_terms?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-5"
              >
                <h3 className="text-sm font-bold text-yellow-400 flex items-center gap-2 mb-4">
                  <Lightbulb size={14} /> Key Terms Glossary
                </h3>
                <div className="space-y-3">
                  {notes.key_terms.map((kt, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * i }}
                      className="flex gap-3 p-3 rounded-xl"
                      style={{ background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.18)' }}
                    >
                      <span className="text-yellow-400 font-black text-sm min-w-[120px] flex-shrink-0">{kt.term}</span>
                      <span className="text-slate-300 text-sm">{kt.definition}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Exam Tips */}
            {notes.exam_tips?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="glass-card p-5"
                style={{ borderLeft: '4px solid #eab308' }}
              >
                <h3 className="text-sm font-bold text-yellow-400 flex items-center gap-2 mb-4">
                  <GraduationCap size={14} /> Exam Tips
                  <span className="text-lg ml-1">🎯</span>
                </h3>
                <ul className="space-y-3">
                  {notes.exam_tips.map((tip, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.15)' }}
                    >
                      <Trophy size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">{tip}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Bottom celebration */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center py-4"
            >
              <p className="text-slate-600 text-xs">
                🚀 Notes generated by EduAgent Pro ·
                <span className="text-purple-400"> Powered by Groq LLaMA 3.3 70B</span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
