import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, User, Zap, Trash2, Loader } from 'lucide-react'
import katex from 'katex'
import { useApp } from '../App'
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

const SUGGESTIONS = [
  'Explain this topic in simple terms',
  'Give me 3 key points to remember',
  'What are common exam questions?',
  'Create a simple analogy for this',
  'What should I study next?',
]

export default function TutorChat() {
  const { uploadedTopics, addXP } = useApp()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm your AI Study Buddy 👋 I know about your topics: **${uploadedTopics.length > 0 ? uploadedTopics.join(', ') : 'general subjects'}**. Ask me anything — I'll explain, quiz you, or just chat about what you're studying!`,
      id: 0,
    },
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingId, setStreamingId] = useState(null)
  const bottomRef = useRef(null)
  const abortRef  = useRef(null)
  const idRef     = useRef(1)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    if (!text.trim() || streaming) return

    const userMsg = { role: 'user', content: text.trim(), id: idRef.current++ }
    const assistantId = idRef.current++

    setMessages((prev) => [
      ...prev,
      userMsg,
      { role: 'assistant', content: '', id: assistantId },
    ])
    setInput('')
    setStreaming(true)
    setStreamingId(assistantId)

    // Build history for API (exclude the empty assistant placeholder)
    const history = messages
      .filter((m) => m.content)
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }))

    try {
      abortRef.current = new AbortController()
      const response = await fetch(`${API}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history, topics: uploadedTopics }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) throw new Error('Stream failed')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.token) {
              fullText += parsed.token
              setMessages((prev) =>
                prev.map((m) => m.id === assistantId ? { ...m, content: fullText } : m)
              )
            }
          } catch (_) {}
        }
      }
      addXP('SOLVE_DOUBT')
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: 'Sorry, I had trouble responding. Please try again.' }
              : m
          )
        )
      }
    } finally {
      setStreaming(false)
      setStreamingId(null)
    }
  }

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: `Chat cleared! I'm still here. Topics: **${uploadedTopics.length > 0 ? uploadedTopics.join(', ') : 'general subjects'}**. What would you like to learn?`,
      id: idRef.current++,
    }])
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-3xl mx-auto p-8">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="mb-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
          <Bot size={16} className="text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold gradient-text">AI Study Buddy</h1>
          <p className="text-slate-400 text-sm">Your personal AI tutor — ask anything, anytime</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-medium">Online</span>
          </div>
          <button onClick={clearChat}
            className="p-2 rounded-xl glass-card text-slate-500 hover:text-slate-300 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-600'
                  : 'bg-gradient-to-br from-cyan-600 to-blue-600'
              }`}>
                {msg.role === 'assistant'
                  ? <Bot size={13} className="text-white" />
                  : <User size={13} className="text-white" />
                }
              </div>

              {/* Bubble */}
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-purple-600/25 border border-purple-500/30 text-slate-200 rounded-tr-sm'
                  : 'glass-card border border-white/8 text-slate-300 rounded-tl-sm'
              }`}>
                {msg.role === 'assistant' ? (
                  <>
                    <div dangerouslySetInnerHTML={{ __html: renderMath(msg.content) }} />
                    {streamingId === msg.id && streaming && (
                      <span className="inline-block w-0.5 h-4 bg-cyan-400 animate-pulse ml-0.5 align-middle" />
                    )}
                    {streamingId === msg.id && !msg.content && (
                      <div className="flex gap-1 mt-1">
                        <div className="thinking-dot w-2 h-2 rounded-full bg-purple-400" />
                        <div className="thinking-dot w-2 h-2 rounded-full bg-cyan-400" />
                        <div className="thinking-dot w-2 h-2 rounded-full bg-purple-400" />
                      </div>
                    )}
                  </>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => sendMessage(s)}
              className="px-3 py-1.5 rounded-full text-xs border border-purple-600/30 text-slate-400 hover:border-purple-500 hover:text-white transition-all bg-white/3">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="glass-card p-3 flex gap-3 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage(input)
            }
          }}
          placeholder="Ask your AI tutor anything... (Enter to send, Shift+Enter for newline)"
          rows={2}
          className="flex-1 bg-transparent text-white placeholder-slate-500 resize-none focus:outline-none text-sm leading-relaxed"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={streaming || !input.trim()}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 flex-shrink-0"
        >
          {streaming ? <Loader size={14} className="text-white animate-spin" /> : <Send size={14} className="text-white" />}
        </button>
      </div>
      <p className="text-slate-700 text-xs text-center mt-2 flex items-center justify-center gap-1">
        <Zap size={9} /> +10 XP per question · Powered by Groq LLaMA 3.3 70B
      </p>
    </div>
  )
}
