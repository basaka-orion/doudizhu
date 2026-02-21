// src/components/PlayArea.jsx
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PlayArea = ({ cards, isLandlord }) => {
  if (!cards || cards.length === 0) return (
    <div className="h-32 flex items-center justify-center opacity-10 italic text-amber-500 font-black tracking-[0.5em] text-xs">
      PASSIVITY
    </div>
  )

  return (
    <div className="flex flex-col items-center">
      <AnimatePresence mode="popLayout">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="flex -space-x-12 mb-4 drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        >
          {cards.map((card, idx) => (
            <motion.div 
              key={`${card.id}-${idx}`} 
              layoutId={card.id}
              className="w-20 h-28 bg-white rounded-xl border-2 border-stone-200 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden"
              style={{ color: card.color === 'red' ? '#e11d48' : '#1f2937' }}
            >
              <div className="absolute inset-1 border border-stone-100 rounded-lg pointer-events-none opacity-50" />
              <span className="text-sm font-black absolute top-1.5 left-1.5 leading-none">{card.rank}</span>
              <span className="text-3xl select-none">{card.isJoker ? '🃏' : card.suit}</span>
              <span className="text-sm font-black absolute bottom-1.5 right-1.5 leading-none rotate-180">{card.rank}</span>
              
              {/* Card Texture Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-stone-100/10 to-transparent pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
      {isLandlord && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-amber-600/90 backdrop-blur-sm px-4 py-1 rounded-full text-[10px] font-black text-black uppercase tracking-widest shadow-xl border border-amber-400/50"
        >
          Grand Marshal
        </motion.div>
      )}
    </div>
  )
}

export default PlayArea
