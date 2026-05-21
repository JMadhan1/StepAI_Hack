import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Mic, MicOff, Send, Loader, Zap } from 'lucide-react'
import axios from 'axios'
import katex from 'katex'
import { useApp } from '../App'
import Whiteboard from './Whiteboard'
import API from '../config/api'

function renderMath(text) {
  if (!text) return ''
  return text
    .replace(/\$\$(.+?)\$\$/gs, (_, e) => {
      try { return katex.renderToString(e.trim(), { displayMode: true, throwOnError: false }) }
      catch { return e }
    })
    .replace(/\$(.+?)\$/g, (_, e) => {
      try { return katex.renderToString(e.trim(), { displayMode: false, throwOnError: false }) }
      catch { return e }
    })
}

export default function DoubtSolver() {
  const { setAgent, addXP } = useApp()
  const [tab, setTab] = useState('text') // text | voice
  const [doubt, setDoubt] = useState('')
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [streamedText, setStreamedText] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // Voice state
  const [recording, setRecording] = useState(false)
  const [transcription, setTranscription] = useState('')
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const abortRef = useRef(null)

  const solveDoubtStreaming = async (text) => {
    setLoading(true)
    setStreaming(false)
    setStreamedText('')
    setResult(null)
    setError('')
    setAgent('doubt', 'active')

    try {
      abortRef.current = new AbortController()
      const response = await fetch(`${API}/doubt/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doubt: text, whiteboard_needed: true }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || 'Stream request failed')
      }

      setLoading(false)
      setStreaming(true)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') {
            setStreaming(false)
            setResult({ explanation: fullText, whiteboard_steps: [] })
            break
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.token) {
              fullText += parsed.token
              setStreamedText(fullText)
            }
            if (parsed.whiteboard_steps) {
              setResult({ explanation: fullText, whiteboard_steps: parsed.whiteboard_steps })
            }
          } catch (_) {}
        }
      }

      // Ensure final result is set
      if (fullText && !result) {
        setResult({ explanation: fullText, whiteboard_steps: [] })
      }
      if (fullText) addXP('SOLVE_DOUBT')
    } catch (err) {
      if (err.name !== 'AbortError') {
        // Fallback to non-streaming endpoint
        try {
          const res = await axios.post(`${API}/doubt`, { doubt: text, whiteboard_needed: true })
          setResult(res.data)
        } catch (fallbackErr) {
          setError(fallbackErr.response?.data?.detail || 'Failed to solve doubt. Check backend connection.')
        }
      }
    } finally {
      setLoading(false)
      setStreaming(false)
      setAgent('doubt', 'idle')
    }
  }

  const handleTextSubmit = (e) => {
    e.preventDefault()
    if (!doubt.trim()) return
    solveDoubtStreaming(doubt.trim())
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mr.ondataavailable = (e) => chunksRef.current.push(e.data)
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await sendVoice(blob)
      }
      mr.start()
      mediaRecorderRef.current = mr
      setRecording(true)
    } catch (err) {
      setError('Microphone access denied. Please allow microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  const sendVoice = async (blob) => {
    setLoading(true)
    setError('')
    setResult(null)
    setStreamedText('')
    setTranscription('')
    setAgent('doubt', 'active')
    try {
      const formData = new FormData()
      formData.append('audio', blob, 'recording.webm')
      const res = await axios.post(`${API}/voice-doubt`, formData)
      setTranscription(res.data.transcription)
      setResult({
        explanation: res.data.explanation,
        has_math: res.data.has_math,
        whiteboard_steps: res.data.whiteboard_steps,
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Voice transcription failed. Try text mode.')
    } finally {
      setLoading(false)
      setAgent('doubt', 'idle')
    }
  }

  const displayExplanation = result?.explanation || streamedText

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center">
          <MessageSquare size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold gradient-text">Doubt Solver</h1>
          <p className="text-slate-400 text-sm">Voice or text — with interactive whiteboard</p>
        </div>
        {/* Streaming badge */}
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
          <Zap size={10} className="text-cyan-400" />
          <span className="text-cyan-400 text-xs font-medium">Live Streaming</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 glass-card p-1 w-fit rounded-xl">
        {['text', 'voice'].map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setResult(null); setStreamedText(''); setError('') }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t === 'text' ? <MessageSquare size={14} /> : <Mic size={14} />}
            {t === 'text' ? 'Text' : 'Voice'}
          </button>
        ))}
      </div>

      {/* Text input */}
      {tab === 'text' && (
        <form onSubmit={handleTextSubmit} className="mb-6">
          <div className="glass-card p-4">
            <textarea
              value={doubt}
              onChange={(e) => setDoubt(e.target.value)}
              placeholder="Type your doubt here... e.g. 'Explain Newton's second law' or 'What is integration by parts?'"
              rows={4}
              className="w-full bg-transparent text-white placeholder-slate-500 resize-none focus:outline-none text-sm leading-relaxed"
            />
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={loading || streaming || !doubt.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
                {loading ? 'Connecting...' : streaming ? 'Streaming...' : 'Ask'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Voice input */}
      {tab === 'voice' && (
        <div className="glass-card p-8 text-center mb-6">
          <div className="flex flex-col items-center gap-4">
            {recording ? (
              <>
                <div className="flex items-end gap-1 h-8 mb-2">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <button
                  onClick={stopRecording}
                  className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center hover:bg-red-500/30 transition-all"
                >
                  <MicOff size={28} className="text-red-400" />
                </button>
                <p className="text-red-400 text-sm font-medium">Recording... tap to stop</p>
              </>
            ) : (
              <>
                <button
                  onClick={startRecording}
                  disabled={loading}
                  className="w-20 h-20 rounded-full bg-purple-600/20 border-2 border-purple-500 flex items-center justify-center hover:bg-purple-600/30 hover:scale-105 transition-all disabled:opacity-50"
                >
                  <Mic size={28} className="text-purple-400" />
                </button>
                <p className="text-slate-400 text-sm">Tap the mic and ask your question</p>
                <p className="text-slate-600 text-xs">Powered by Groq Whisper</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 text-center mb-6"
        >
          <div className="flex justify-center gap-2 mb-3">
            <div className="thinking-dot w-3 h-3 rounded-full bg-purple-400" />
            <div className="thinking-dot w-3 h-3 rounded-full bg-cyan-400" />
            <div className="thinking-dot w-3 h-3 rounded-full bg-purple-400" />
          </div>
          <p className="text-purple-300 font-medium">Doubt Agent is thinking...</p>
          <p className="text-slate-500 text-xs mt-1">Connecting to stream...</p>
        </motion.div>
      )}

      {/* Transcription */}
      {transcription && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 mb-4 border-l-2 border-cyan-500"
        >
          <p className="text-xs text-cyan-400 font-semibold mb-1">YOU ASKED</p>
          <p className="text-slate-300 text-sm italic">"{transcription}"</p>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-card p-4 border-red-500/20 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Streaming / Result */}
      <AnimatePresence>
        {(streaming || displayExplanation) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Explanation — streams in live */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Explanation</p>
                {streaming && (
                  <span className="flex items-center gap-1 text-xs text-cyan-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    Live
                  </span>
                )}
              </div>
              <div
                className="text-slate-300 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMath(displayExplanation) }}
              />
              {/* Blinking cursor while streaming */}
              {streaming && (
                <span className="inline-block w-0.5 h-4 bg-cyan-400 animate-pulse ml-0.5 align-middle" />
              )}
            </div>

            {/* Whiteboard — appears after stream completes */}
            {result?.whiteboard_steps && result.whiteboard_steps.length > 0 && (
              <Whiteboard steps={result.whiteboard_steps} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
