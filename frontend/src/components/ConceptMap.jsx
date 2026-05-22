import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { GitBranch, Loader2 } from 'lucide-react'

const NODE_STYLES = {
  core:        { bg: '#4c1d95', border: '#8b5cf6', text: '#ede9fe' },
  concept:     { bg: '#0c4a6e', border: '#0891b2', text: '#e0f2fe' },
  application: { bg: '#064e3b', border: '#10b981', text: '#d1fae5' },
  theory:      { bg: '#78350f', border: '#f59e0b', text: '#fef3c7' },
}

function nodeStyle(type) {
  return NODE_STYLES[type] || NODE_STYLES.concept
}

function wrapLabel(text, maxLen = 13) {
  if (text.length <= maxLen) return [text]
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const w of words) {
    if ((line + ' ' + w).trim().length <= maxLen) {
      line = (line + ' ' + w).trim()
    } else {
      if (line) lines.push(line)
      line = w.length > maxLen ? w.slice(0, maxLen - 1) + '…' : w
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, 2)
}

function radialLayout(nodes, W, H) {
  if (!nodes.length) return []
  const cx = W / 2
  const cy = H / 2
  const r = Math.min(W, H) * 0.37
  return nodes.map((node, i) => {
    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2
    return { ...node, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  })
}

// Shorten edge endpoints so arrow doesn't overlap node circle
function shortenLine(x1, y1, x2, y2, pad = 38) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < pad * 2) return { x1, y1, x2, y2 }
  const ux = dx / len
  const uy = dy / len
  return {
    x1: x1 + ux * pad,
    y1: y1 + uy * pad,
    x2: x2 - ux * pad,
    y2: y2 - uy * pad,
  }
}

export default function ConceptMap({ nodes = [], edges = [], loading = false }) {
  const [hovered, setHovered] = useState(null)

  const W = 580
  const H = 400

  const laid = useMemo(() => radialLayout(nodes, W, H), [nodes])
  const nodeMap = useMemo(() => {
    const m = {}
    laid.forEach((n) => { m[n.id] = n })
    return m
  }, [laid])

  if (!loading && nodes.length < 2) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-5 mb-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <GitBranch size={16} className="text-purple-400" />
        <h2 className="text-base font-semibold text-white">Concept Map</h2>
        <span className="ml-auto text-xs text-slate-500">AI-generated topic relationships</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 h-28 text-slate-400">
          <Loader2 size={18} className="animate-spin text-purple-400" />
          <span className="text-sm">Mapping topic relationships…</span>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl">
            <svg
              width={W}
              height={H}
              viewBox={`0 0 ${W} ${H}`}
              className="mx-auto block"
              style={{ maxWidth: '100%' }}
            >
              <defs>
                <marker
                  id="cmArrow"
                  markerWidth="7" markerHeight="7"
                  refX="6" refY="3.5"
                  orient="auto"
                >
                  <path d="M0,0 L0,7 L7,3.5 z" fill="#475569" />
                </marker>
              </defs>

              {/* Edges */}
              {edges.map((edge, i) => {
                const from = nodeMap[edge.from]
                const to   = nodeMap[edge.to]
                if (!from || !to) return null
                const { x1, y1, x2, y2 } = shortenLine(from.x, from.y, to.x, to.y, 40)
                const mx = (x1 + x2) / 2
                const my = (y1 + y2) / 2
                const isHov = hovered === edge.from || hovered === edge.to
                return (
                  <g key={i}>
                    <line
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={isHov ? '#7c3aed' : '#334155'}
                      strokeWidth={isHov ? 1.8 : 1.1}
                      strokeDasharray="5 3"
                      markerEnd="url(#cmArrow)"
                      style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                    />
                    {edge.relation && (
                      <text
                        x={mx} y={my - 5}
                        textAnchor="middle"
                        fontSize="9"
                        fill={isHov ? '#a78bfa' : '#64748b'}
                        style={{ pointerEvents: 'none', transition: 'fill 0.2s' }}
                      >
                        {edge.relation}
                      </text>
                    )}
                  </g>
                )
              })}

              {/* Nodes */}
              {laid.map((node) => {
                const s     = nodeStyle(node.type)
                const isHov = hovered === node.id
                const lines = wrapLabel(node.id)
                const r     = isHov ? 40 : 36
                return (
                  <g
                    key={node.id}
                    onMouseEnter={() => setHovered(node.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: 'default' }}
                  >
                    {/* Glow ring on hover */}
                    {isHov && (
                      <circle
                        cx={node.x} cy={node.y} r={r + 6}
                        fill="none"
                        stroke={s.border}
                        strokeWidth="1"
                        opacity="0.35"
                      />
                    )}
                    <circle
                      cx={node.x} cy={node.y} r={r}
                      fill={s.bg}
                      stroke={s.border}
                      strokeWidth={isHov ? 2.5 : 1.5}
                      opacity={isHov ? 1 : 0.9}
                      style={{ transition: 'all 0.2s' }}
                    />
                    {lines.map((line, li) => (
                      <text
                        key={li}
                        x={node.x}
                        y={node.y + (lines.length === 1 ? 0 : li === 0 ? -6 : 7)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="9.5"
                        fontWeight="600"
                        fill={s.text}
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        {line}
                      </text>
                    ))}
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-3 justify-center">
            {Object.entries(NODE_STYLES).map(([type, s]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: s.bg, border: `1.5px solid ${s.border}` }}
                />
                <span className="text-slate-500 text-xs capitalize">{type}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}
