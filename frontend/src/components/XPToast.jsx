import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Star, TrendingUp } from 'lucide-react'

export default function XPToast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 60, x: '-50%' }}
          animate={{ opacity: 1, y: 0,  x: '-50%' }}
          exit={{   opacity: 0, y: 60,  x: '-50%' }}
          className="fixed bottom-8 left-1/2 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.95), rgba(6,182,212,0.95))', backdropFilter: 'blur(16px)' }}
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            {toast.levelUp ? <TrendingUp size={16} className="text-white" /> : <Star size={14} className="text-yellow-300" />}
          </div>
          <div>
            {toast.levelUp && (
              <p className="text-white font-black text-sm">Level Up! {toast.newTitle}</p>
            )}
            <p className="text-white/90 text-sm font-medium">
              <span className="text-yellow-300 font-bold">+{toast.xp} XP</span>
              {' '}&mdash; {toast.desc}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
