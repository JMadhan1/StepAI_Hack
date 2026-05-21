import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Zap, Brain, BookOpen, MessageSquare, BarChart2, Search,
  Layers, FileText, Mic, ArrowRight, Sparkles, CheckCircle,
  Star, Bot, TrendingUp, ClipboardList, Timer, Trophy, Flame,
  Globe, ChevronRight
} from 'lucide-react'

/* ── Features (all 12) ──────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Bot,
    grad: 'from-indigo-500 via-violet-500 to-purple-600',
    glow: 'glow-purple',
    tag: 'NEW',
    tagColor: 'tag-purple',
    title: 'AI Tutor Chat',
    desc: 'Persistent multi-turn conversation with your AI tutor. Streams answers token-by-token with KaTeX math support.',
  },
  {
    icon: BookOpen,
    grad: 'from-violet-600 via-purple-600 to-indigo-700',
    glow: 'glow-purple',
    title: 'Smart Study Planner',
    desc: 'AI builds a personalised day-by-day schedule with curated Tavily resource links per topic.',
  },
  {
    icon: Brain,
    grad: 'from-cyan-500 via-sky-500 to-blue-600',
    glow: 'glow-cyan',
    title: 'Adaptive Quiz Arena',
    desc: 'MCQs with 60 s timer, Easy/Medium/Hard difficulty, and instant AI explanations on every answer.',
  },
  {
    icon: ClipboardList,
    grad: 'from-red-600 via-rose-500 to-pink-600',
    glow: 'glow-pink',
    tag: 'NEW',
    tagColor: 'tag-pink',
    title: 'AI Exam Mode',
    desc: 'Timed full exam across all topics. No going back — strict mode with grade, per-topic breakdown and review.',
  },
  {
    icon: Layers,
    grad: 'from-indigo-500 via-purple-500 to-violet-600',
    glow: 'glow-purple',
    title: 'Flashcards + Spaced Rep',
    desc: 'AI-generated flip cards with hint reveal, difficulty tagging, and spaced-repetition queuing.',
  },
  {
    icon: FileText,
    grad: 'from-emerald-500 via-green-500 to-teal-600',
    glow: 'glow-green',
    title: 'Auto Study Notes',
    desc: 'One click turns any topic into structured notes: sections, key terms, quick facts and exam tips.',
  },
  {
    icon: MessageSquare,
    grad: 'from-pink-500 via-rose-500 to-purple-600',
    glow: 'glow-pink',
    title: 'Voice Doubt Solver',
    desc: 'Ask doubts by voice. Groq Whisper transcribes, LLaMA streams the answer, whiteboard renders steps.',
  },
  {
    icon: TrendingUp,
    grad: 'from-yellow-500 via-amber-500 to-orange-600',
    glow: '',
    tag: 'NEW',
    tagColor: 'tag-yellow',
    title: 'Learning Analytics',
    desc: 'Activity heatmap, XP timeline, topic mastery radar chart — plus AI-generated study insights.',
  },
  {
    icon: BarChart2,
    grad: 'from-amber-500 via-orange-500 to-yellow-600',
    glow: '',
    title: 'Weak Area Tracker',
    desc: 'Tracker Agent analyses quiz patterns and builds a radar of strong vs. weak topics over time.',
  },
  {
    icon: Search,
    grad: 'from-sky-500 via-blue-500 to-indigo-600',
    glow: 'glow-cyan',
    title: 'Resource Finder',
    desc: 'Tavily-powered search surfaces the best YouTube videos, articles and research papers per topic.',
  },
  {
    icon: Trophy,
    grad: 'from-yellow-400 via-amber-400 to-orange-500',
    glow: '',
    tag: 'NEW',
    tagColor: 'tag-yellow',
    title: 'Gamification',
    desc: 'Earn XP for every action. Climb 6 levels (Novice → Grandmaster), track streaks and see level-up toasts.',
  },
  {
    icon: Timer,
    grad: 'from-fuchsia-500 via-pink-500 to-rose-600',
    glow: 'glow-pink',
    tag: 'NEW',
    tagColor: 'tag-pink',
    title: 'Pomodoro Timer',
    desc: 'Floating focus timer with circular SVG progress. 25/5/15 min modes. +25 XP per completed session.',
  },
]

/* ── Agents ─────────────────────────────────────────────────────────────── */
const AGENTS = [
  { label: 'Research Agent',  dot: 'bg-cyan-400',    ring: 'ring-cyan-400/30'    },
  { label: 'Quiz Agent',      dot: 'bg-purple-400',  ring: 'ring-purple-400/30'  },
  { label: 'Planner Agent',   dot: 'bg-green-400',   ring: 'ring-green-400/30'   },
  { label: 'Tracker Agent',   dot: 'bg-yellow-400',  ring: 'ring-yellow-400/30'  },
  { label: 'Doubt Agent',     dot: 'bg-pink-400',    ring: 'ring-pink-400/30'    },
  { label: 'Flashcard Agent', dot: 'bg-indigo-400',  ring: 'ring-indigo-400/30'  },
  { label: 'Notes Agent',     dot: 'bg-emerald-400', ring: 'ring-emerald-400/30' },
]

/* ── Tech stack ─────────────────────────────────────────────────────────── */
const STACK = [
  'Groq LLaMA 3.3 70B', 'Whisper Large v3', 'FastAPI', 'Tavily Search',
  'React 18', 'Tailwind CSS', 'Framer Motion', 'KaTeX', 'Recharts',
  'pdfplumber', 'SSE Streaming', 'Vercel',
]

/* ── Stats ──────────────────────────────────────────────────────────────── */
const STATS = [
  { value: '12',   label: 'Features',     color: 'text-purple-400' },
  { value: '7',    label: 'AI Agents',    color: 'text-cyan-400'   },
  { value: '70B',  label: 'LLM Params',   color: 'text-pink-400'   },
  { value: '6',    label: 'XP Levels',    color: 'text-yellow-400' },
]

/* ── How it works ───────────────────────────────────────────────────────── */
const STEPS = [
  { num: '01', title: 'Upload your PDF',       desc: 'Drop any syllabus or notes. AI extracts topics and builds a knowledge base in seconds.',          icon: FileText,  color: 'from-purple-600 to-violet-600' },
  { num: '02', title: 'Get your Study Plan',   desc: 'Planner Agent schedules your days with curated resource links per topic.',                          icon: BookOpen,  color: 'from-cyan-500 to-sky-600'     },
  { num: '03', title: 'Learn & Practice',      desc: 'Chat with your AI tutor, take quizzes, flip flashcards, solve voice doubts on the whiteboard.',     icon: Brain,    color: 'from-indigo-500 to-purple-600' },
  { num: '04', title: 'Track & Improve',       desc: 'See your analytics, take timed exams, earn XP and climb levels as your mastery grows.',             icon: TrendingUp,color: 'from-yellow-500 to-amber-600' },
]

/* ── Perks ──────────────────────────────────────────────────────────────── */
const PERKS = [
  'Live streaming AI answers (ChatGPT-style)',
  'Voice doubts with interactive whiteboard',
  'Timed Exam Mode with full score report',
  'XP / streaks / 6-level gamification',
  'Learning analytics with AI insights',
  'Pomodoro timer built right in',
]

/* ── Animation presets ──────────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay },
})
const fadeUpView = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
})

/* ── Component ──────────────────────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#07070f] overflow-x-hidden text-slate-200">

      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="orb orb-purple absolute w-[650px] h-[650px] top-[-140px] left-[-180px] opacity-70" />
        <div className="orb orb-cyan   absolute w-[550px] h-[550px] bottom-[-120px] right-[-140px] opacity-60" />
        <div className="orb orb-pink   absolute w-[420px] h-[420px] top-[38%] left-[52%] opacity-35" />
      </div>

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center glow-purple">
            <Zap size={15} className="text-white" />
          </div>
          <span className="text-white font-bold text-base">EduAgent <span className="hero-text font-black">Pro</span></span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 text-xs font-semibold">
            <Flame size={10} /> Gamified Learning
          </div>
          <span className="tag tag-purple hidden sm:inline-flex">
            <Star size={9} className="fill-purple-400" /> Hackathon 2026
          </span>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Launch App <ArrowRight size={13} />
          </button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pt-14 pb-20 text-center">

        {/* Badge */}
        <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 mb-8">
          <span className="tag tag-purple px-4 py-1.5 text-xs">
            <Sparkles size={10} className="text-purple-400" />
            12 AI Features &nbsp;·&nbsp; 7 Agents &nbsp;·&nbsp; Groq LLaMA 3.3 70B
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1 {...fadeUp(0.08)} className="text-6xl md:text-[82px] font-black leading-[1.04] mb-6 tracking-tight">
          <span className="text-white">The Ultimate</span>
          <br />
          <span className="hero-text">AI Study Companion</span>
        </motion.h1>

        <motion.p {...fadeUp(0.18)} className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload your syllabus. Seven specialised AI agents build your plan, quiz you,
          solve doubts live, generate flashcards, run timed exams, and track your
          growth — all in one gamified dashboard.
        </motion.p>

        {/* Perks grid */}
        <motion.div {...fadeUp(0.24)} className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2.5 max-w-2xl mx-auto mb-10">
          {PERKS.map((p) => (
            <span key={p} className="flex items-center gap-1.5 text-slate-400 text-sm text-left">
              <CheckCircle size={13} className="text-green-400 flex-shrink-0" /> {p}
            </span>
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div {...fadeUp(0.3)} className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => navigate('/dashboard')}
            className="group relative flex items-center gap-2 px-10 py-4 rounded-2xl text-white font-bold text-lg overflow-hidden shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
          >
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-[0.08] transition-opacity rounded-2xl" />
            <Zap size={18} />
            Start Studying Free
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-9 py-4 glass-card border-white/10 text-slate-300 hover:text-white font-semibold text-lg hover:border-purple-500/30 transition-all rounded-2xl"
          >
            See Features
          </button>
        </motion.div>

        {/* Stats strip */}
        <motion.div {...fadeUp(0.42)} className="mt-20 grid grid-cols-4 gap-6 max-w-md mx-auto">
          {STATS.map(({ value, label, color }) => (
            <div key={label} className="text-center">
              <div className={`text-3xl font-black ${color} tabular-nums`}>{value}</div>
              <div className="text-slate-600 text-xs mt-1">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Agent pills ────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 pb-20">
        <motion.div {...fadeUpView()} className="glass-card p-8 shimmer">
          <p className="text-center text-xs text-slate-500 uppercase tracking-widest mb-5 font-semibold">7-Agent Architecture</p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {AGENTS.map(({ label, dot, ring }) => (
              <div key={label} className={`flex items-center gap-2.5 px-4 py-2 bg-white/4 rounded-full border border-white/8 ring-1 ${ring} hover:bg-white/8 transition-colors`}>
                <span className={`w-2 h-2 rounded-full ${dot} pulse-dot shadow-lg`} />
                <span className="text-slate-300 text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-slate-600 text-xs">
            {['Tavily Web Search', 'Groq Whisper Voice', 'In-memory RAG', 'SSE Token Streaming'].map((txt) => (
              <span key={txt} className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-slate-700 inline-block" /> {txt}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pb-24">
        <motion.div {...fadeUpView()} className="text-center mb-12">
          <h2 className="text-4xl font-black text-white mb-3">How it works</h2>
          <p className="text-slate-500">From PDF to mastery in four steps</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map(({ num, title, desc, icon: Icon, color }, i) => (
            <motion.div key={num} {...fadeUpView(i * 0.07)}
              className="glass-card p-6 relative group hover:scale-[1.03] transition-all duration-200">
              {/* Connector arrow for desktop */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ChevronRight size={16} className="text-slate-700" />
                </div>
              )}
              <div className="text-slate-700 text-4xl font-black mb-4 tabular-nums">{num}</div>
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon size={16} className="text-white" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-2">{title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features grid (12) ─────────────────────────────────────────── */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-8 pb-24">
        <motion.div {...fadeUpView()} className="text-center mb-12">
          <h2 className="text-4xl font-black text-white mb-3">Everything a student needs</h2>
          <p className="text-slate-500">Twelve powerful features — one unified platform</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, grad, glow, tag, tagColor, title, desc }, i) => (
            <motion.div key={title} {...fadeUpView(i * 0.04)}
              className="glass-card shimmer p-5 group cursor-default hover:scale-[1.03] transition-all duration-200 relative overflow-hidden"
            >
              {tag && (
                <span className={`absolute top-3 right-3 tag ${tagColor} text-[10px] px-2 py-0.5`}>{tag}</span>
              )}
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center mb-4 shadow-lg ${glow} group-hover:scale-110 transition-transform`}>
                <Icon size={18} className="text-white" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-2 leading-snug">{title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Gamification spotlight ──────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pb-24">
        <motion.div {...fadeUpView()} className="glass-card p-10 shimmer">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
                  <Trophy size={14} className="text-white" />
                </div>
                <span className="tag tag-yellow">Gamified Learning</span>
              </div>
              <h3 className="text-3xl font-black text-white mb-3">Study like a game.<br />Level up for real.</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Every action earns XP. Upload a PDF (+50 XP), take a quiz (+20 XP),
                complete an exam (+75 XP). Maintain daily streaks, hit level milestones,
                and see live level-up toasts pop as you study.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Novice', 'Learner', 'Scholar', 'Expert', 'Master', 'Grandmaster'].map((l, i) => (
                  <span key={l} className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    i === 0 ? 'border-slate-500/30 text-slate-400 bg-slate-600/20' :
                    i === 1 ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                    i === 2 ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10' :
                    i === 3 ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' :
                    i === 4 ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
                              'border-pink-500/30 text-pink-400 bg-pink-500/10'
                  }`}>Lv.{i+1} {l}</span>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {[
                { action: 'Upload PDF',          xp: '+50 XP',  color: 'text-purple-400', bg: 'bg-purple-600/15 border-purple-600/25' },
                { action: 'Generate Study Plan', xp: '+30 XP',  color: 'text-cyan-400',   bg: 'bg-cyan-500/15   border-cyan-500/25'   },
                { action: 'Complete Exam',       xp: '+75 XP',  color: 'text-red-400',    bg: 'bg-red-500/15    border-red-500/25'     },
                { action: 'Take Quiz',           xp: '+20 XP',  color: 'text-blue-400',   bg: 'bg-blue-500/15   border-blue-500/25'    },
                { action: 'Solve Doubt',         xp: '+10 XP',  color: 'text-pink-400',   bg: 'bg-pink-500/15   border-pink-500/25'    },
                { action: 'Pomodoro Session',    xp: '+25 XP',  color: 'text-green-400',  bg: 'bg-green-500/15  border-green-500/25'   },
              ].map(({ action, xp, color, bg }) => (
                <div key={action} className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${bg}`}>
                  <span className="text-slate-300 text-sm">{action}</span>
                  <span className={`font-black text-sm ${color}`}>{xp}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Tech stack ─────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 pb-20">
        <motion.div {...fadeUpView()} className="glass-card p-8 text-center shimmer">
          <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-5">Built With</p>
          <div className="flex flex-wrap justify-center gap-2">
            {STACK.map((tech) => (
              <span key={tech} className="px-3 py-1.5 bg-white/4 border border-white/8 rounded-full text-slate-400 text-xs hover:text-white hover:border-purple-500/30 transition-colors">
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-3xl mx-auto px-8 pb-28 text-center">
        <motion.div {...fadeUpView()} className="animated-border">
          <div className="glass-card p-14 rounded-[19px]">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center mx-auto mb-6 glow-purple">
              <Zap size={24} className="text-white" />
            </div>
            <h2 className="text-4xl font-black mb-3">
              <span className="hero-text">Ready to study smarter?</span>
            </h2>
            <p className="text-slate-400 mb-2 leading-relaxed">
              Upload your syllabus and let 7 AI agents take care of everything.
            </p>
            <p className="text-slate-600 text-sm mb-8">No login. No credit card. Runs on Vercel.</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button
                onClick={() => navigate('/dashboard')}
                className="group inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-white font-bold text-lg glow-purple hover:scale-105 transition-all"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
              >
                Start for Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="inline-flex items-center gap-2 px-8 py-4 glass-card border-white/10 text-slate-300 hover:text-white font-semibold hover:border-purple-500/30 transition-all rounded-2xl"
              >
                <Bot size={16} /> Try AI Tutor
              </button>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  )
}
