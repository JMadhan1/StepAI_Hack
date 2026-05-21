import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ExternalLink, Loader, Video, FileText, BookOpen } from 'lucide-react'
import axios from 'axios'
import { useApp } from '../App'

import API from '../config/api'

const typeConfig = {
  video: { icon: Video, label: 'Video', color: 'bg-red-500/10 border-red-500/30 text-red-400' },
  article: { icon: FileText, label: 'Article', color: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
  paper: { icon: BookOpen, label: 'Paper', color: 'bg-green-500/10 border-green-500/30 text-green-400' },
}

const FILTER_OPTIONS = ['All', 'video', 'article', 'paper']

export default function ResourceFeed() {
  const { uploadedTopics, setAgent } = useApp()
  const [query, setQuery] = useState('')
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')
  const [searched, setSearched] = useState(false)

  const search = async (topic) => {
    if (!topic.trim()) return
    setLoading(true)
    setError('')
    setSearched(true)
    setAgent('research', 'active')
    try {
      const res = await axios.post(`${API}/research`, { topic: topic.trim() })
      setResources(res.data.resources || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Search failed. Check backend and Tavily API key.')
    } finally {
      setLoading(false)
      setAgent('research', 'idle')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    search(query)
  }

  const filtered = filter === 'All' ? resources : resources.filter((r) => r.type === filter)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center">
          <Search size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold gradient-text">Resources</h1>
          <p className="text-slate-400 text-sm">AI-curated learning resources from the web</p>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 glass-card flex items-center gap-3 px-4">
            <Search size={16} className="text-slate-500 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for any topic (e.g. 'Photosynthesis', 'Calculus', 'World War II')..."
              className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none py-4 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader size={14} className="animate-spin" /> : <Search size={14} />}
            Search
          </button>
        </div>
      </form>

      {/* Quick topic pills */}
      {uploadedTopics.length > 0 && !searched && (
        <div className="mb-6">
          <p className="text-xs text-slate-500 mb-3">Quick search from your syllabus:</p>
          <div className="flex flex-wrap gap-2">
            {uploadedTopics.slice(0, 8).map((t) => (
              <button
                key={t}
                onClick={() => { setQuery(t); search(t) }}
                className="px-3 py-1.5 bg-purple-600/10 border border-purple-600/30 rounded-full text-purple-300 text-xs hover:bg-purple-600/20 transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-16 gap-3">
          <Loader size={32} className="text-cyan-400 animate-spin" />
          <p className="text-slate-400 text-sm">Research Agent is searching the web...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="glass-card p-6 text-center border-red-500/20">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {!loading && resources.length > 0 && (
        <>
          {/* Filter */}
          <div className="flex gap-2 mb-5">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  filter === f ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white glass-card border-white/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filtered.map((resource, i) => {
              const tc = typeConfig[resource.type] || typeConfig.article
              const TypeIcon = tc.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="glass-card p-5 hover:border-purple-600/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${tc.color}`}>
                          <TypeIcon size={10} />
                          {tc.label}
                        </span>
                        {resource.relevance_score >= 0.8 && (
                          <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs">
                            Highly Relevant
                          </span>
                        )}
                      </div>
                      <h3 className="text-white font-semibold text-sm mb-1.5 line-clamp-2">{resource.title}</h3>
                      <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">{resource.summary}</p>
                    </div>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-purple-600/10 border border-purple-600/30 rounded-lg text-purple-300 text-xs hover:bg-purple-600/20 transition-colors whitespace-nowrap"
                    >
                      Open <ExternalLink size={11} />
                    </a>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </>
      )}

      {searched && !loading && resources.length === 0 && !error && (
        <div className="glass-card p-12 text-center">
          <Search size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No resources found. Try a different search term.</p>
        </div>
      )}
    </div>
  )
}
