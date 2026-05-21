import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, ChevronDown, ChevronUp, Loader, Download, Lightbulb, BookMarked, Zap, GraduationCap } from 'lucide-react'
import axios from 'axios'
import katex from 'katex'
import { useApp } from '../App'

import API from '../config/api'

function renderLatex(formula) {
  try {
    return katex.renderToString(formula.replace(/^\$\$?/, '').replace(/\$\$?$/, ''), {
      displayMode: true, throwOnError: false,
    })
  } catch { return formula }
}

function Section({ section, index }) {
  const [open, setOpen] = useState(index === 0)
  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-400 text-xs font-bold">
            {index + 1}
          </div>
          <span className="text-white font-semibold">{section.heading}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/5">
              <p className="text-slate-300 text-sm leading-relaxed mt-4 mb-4">{section.content}</p>

              {section.has_formula && section.formula && (
                <div
                  className="my-3 p-4 bg-purple-900/20 border border-purple-600/20 rounded-xl overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: renderLatex(section.formula) }}
                />
              )}

              <ul className="space-y-2">
                {section.key_points?.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-400 text-sm">
                    <span className="text-purple-400 mt-0.5 flex-shrink-0">▸</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function StudyNotes() {
  const { uploadedTopics, setAgent } = useApp()
  const topics = uploadedTopics.length > 0 ? uploadedTopics : ['Mathematics', 'Physics', 'Chemistry', 'Biology']

  const [topic, setTopic]   = useState(topics[0] || 'Mathematics')
  const [notes, setNotes]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const generate = async () => {
    setLoading(true)
    setError('')
    setNotes(null)
    setAgent('research', 'active')
    try {
      const res = await axios.post(`${API}/notes`, { topic })
      setNotes(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate notes.')
    } finally {
      setLoading(false)
      setAgent('research', 'idle')
    }
  }

  const handlePrint = () => window.print()

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-600 to-cyan-600 flex items-center justify-center">
            <FileText size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Study Notes</h1>
            <p className="text-slate-400 text-sm">AI-generated structured notes from your syllabus</p>
          </div>
        </div>
        {notes && (
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 glass-card border-white/10 text-slate-400 hover:text-white text-sm transition-colors">
            <Download size={14} /> Export / Print
          </button>
        )}
      </div>

      {/* Topic selector */}
      <div className="glass-card p-5 mb-6 flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm text-slate-400 mb-2 block">Topic</label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-white/5 border border-purple-600/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
          >
            {topics.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-cyan-600 rounded-xl text-white font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? <><Loader size={15} className="animate-spin" />Generating...</> : <><FileText size={15} />Generate Notes</>}
        </button>
      </div>

      {error && <div className="glass-card p-4 border-red-500/20 mb-4"><p className="text-red-400 text-sm">{error}</p></div>}

      {loading && (
        <div className="flex flex-col items-center py-16 gap-4">
          <div className="flex gap-2">
            <div className="thinking-dot w-3 h-3 rounded-full bg-green-400" />
            <div className="thinking-dot w-3 h-3 rounded-full bg-cyan-400" />
            <div className="thinking-dot w-3 h-3 rounded-full bg-green-400" />
          </div>
          <p className="text-slate-400">Generating comprehensive notes...</p>
        </div>
      )}

      {notes && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 print:text-black">
          {/* Title + Summary */}
          <div className="glass-card p-6 border-l-2 border-green-500">
            <h2 className="text-xl font-bold text-white mb-3">{notes.title}</h2>
            <p className="text-slate-300 text-sm leading-relaxed">{notes.summary}</p>
          </div>

          {/* Quick Facts */}
          {notes.quick_facts?.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2 mb-3">
                <Zap size={14} /> Quick Facts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {notes.quick_facts.map((fact, i) => (
                  <div key={i} className="flex items-start gap-2 text-slate-300 text-xs p-2 bg-white/3 rounded-lg">
                    <span className="text-cyan-400">⚡</span> {fact}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sections */}
          {notes.sections?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <BookMarked size={14} className="text-purple-400" /> Detailed Notes
              </h3>
              {notes.sections.map((s, i) => <Section key={i} section={s} index={i} />)}
            </div>
          )}

          {/* Key Terms */}
          {notes.key_terms?.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-yellow-400 flex items-center gap-2 mb-4">
                <Lightbulb size={14} /> Key Terms
              </h3>
              <div className="space-y-3">
                {notes.key_terms.map((kt, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-yellow-400 font-semibold text-sm min-w-[120px] flex-shrink-0">{kt.term}</span>
                    <span className="text-slate-400 text-sm">{kt.definition}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exam Tips */}
          {notes.exam_tips?.length > 0 && (
            <div className="glass-card p-5 border-l-2 border-yellow-500">
              <h3 className="text-sm font-semibold text-yellow-400 flex items-center gap-2 mb-3">
                <GraduationCap size={14} /> Exam Tips
              </h3>
              <ul className="space-y-2">
                {notes.exam_tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                    <span className="text-yellow-400 mt-0.5">★</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
