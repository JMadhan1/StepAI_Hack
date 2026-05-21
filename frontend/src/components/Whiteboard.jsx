import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Trash2, PenLine } from 'lucide-react'
import katex from 'katex'

function renderContent(content, latex) {
  // Replace inline $...$ and block $$...$$ with rendered KaTeX
  let html = content
    .replace(/\$\$(.+?)\$\$/gs, (_, expr) => {
      try { return katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false }) }
      catch { return expr }
    })
    .replace(/\$(.+?)\$/g, (_, expr) => {
      try { return katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false }) }
      catch { return expr }
    })
  return html
}

export default function Whiteboard({ steps = [] }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [displayedChars, setDisplayedChars] = useState(0)
  const [cleared, setCleared] = useState(false)
  const step = steps[currentStep]
  const intervalRef = useRef(null)

  useEffect(() => {
    setDisplayedChars(0)
    if (step) {
      const total = step.content.length
      intervalRef.current = setInterval(() => {
        setDisplayedChars((c) => {
          if (c >= total) { clearInterval(intervalRef.current); return total }
          return c + 3
        })
      }, 20)
    }
    return () => clearInterval(intervalRef.current)
  }, [currentStep, step])

  if (!steps || steps.length === 0) return null

  if (cleared) {
    return (
      <div className="glass-card p-6 text-center">
        <Trash2 size={24} className="text-slate-600 mx-auto mb-2" />
        <p className="text-slate-500 text-sm">Board cleared</p>
        <button onClick={() => { setCleared(false); setCurrentStep(0) }} className="mt-3 text-purple-400 text-xs underline">Restore</button>
      </div>
    )
  }

  const contentToShow = step.content.slice(0, displayedChars)
  const isFullyShown = displayedChars >= step.content.length

  return (
    <div className="glass-card overflow-hidden">
      {/* Board header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/3">
        <div className="flex items-center gap-2">
          <PenLine size={14} className="text-purple-400" />
          <span className="text-sm font-semibold text-white">Whiteboard</span>
          <span className="text-slate-500 text-xs ml-1">Step {currentStep + 1} of {steps.length}</span>
        </div>
        <button onClick={() => setCleared(true)} className="text-slate-600 hover:text-slate-400 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Step progress */}
      <div className="flex gap-1 px-5 pt-3">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentStep(i)}
            className={`h-1 rounded-full flex-1 transition-all ${i === currentStep ? 'bg-purple-500' : i < currentStep ? 'bg-purple-800' : 'bg-white/10'}`}
          />
        ))}
      </div>

      {/* Step title */}
      <div className="px-5 pt-4 pb-2">
        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Step {currentStep + 1}</span>
        <h3 className="text-white font-semibold mt-0.5">{step.title}</h3>
      </div>

      {/* Main board area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="px-5 pb-5"
        >
          {/* LaTeX equation block */}
          {step.latex && isFullyShown && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="my-4 p-4 bg-gradient-to-br from-purple-900/30 to-cyan-900/20 border border-purple-600/30 rounded-xl overflow-x-auto"
              dangerouslySetInnerHTML={{
                __html: (() => {
                  try {
                    return katex.renderToString(step.latex.replace(/^\$\$?/, '').replace(/\$\$?$/, ''), {
                      displayMode: true, throwOnError: false
                    })
                  } catch { return step.latex }
                })()
              }}
            />
          )}

          {/* Text content with inline math */}
          <div
            className="text-slate-300 text-sm leading-relaxed whiteboard-content"
            dangerouslySetInnerHTML={{ __html: renderContent(contentToShow, step.latex) }}
          />

          {/* Blinking cursor while typing */}
          {!isFullyShown && (
            <span className="inline-block w-0.5 h-4 bg-purple-400 ml-0.5 animate-pulse" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
        <button
          onClick={() => setCurrentStep((i) => Math.max(0, i - 1))}
          disabled={currentStep === 0}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
          Previous
        </button>
        <span className="text-xs text-slate-600">{currentStep + 1} / {steps.length}</span>
        <button
          onClick={() => setCurrentStep((i) => Math.min(steps.length - 1, i + 1))}
          disabled={currentStep === steps.length - 1}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next Step
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
