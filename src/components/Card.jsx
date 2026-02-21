// src/components/Card.jsx
import React from 'react'
import { motion } from 'framer-motion'

const Card = ({ card, selected, onClick, disabled, isBomb }) => {
  const { rank, suit, color, isJoker } = card

  const getDisplayRank = (r) => {
    if (r === '小王') return 'J'
    if (r === '大王') return 'J'
    return r
  }

  return (
    <motion.div
      whileHover={{ y: selected ? -32 : -12, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative w-24 h-36 rounded-2xl cursor-pointer border-2 shadow-[0_10px_20px_rgba(0,0,0,0.3)] transition-all duration-300
        ${selected ? '-translate-y-8 border-amber-400 shadow-[0_30px_60px_rgba(0,0,0,0.6)] z-50 ring-2 ring-amber-400/50' : 'bg-white border-stone-200'}
        ${disabled ? 'cursor-default grayscale-[0.2] brightness-90' : ''}
        ${isBomb ? 'ring-4 ring-red-500 animate-pulse' : ''}
      `}
      style={{
        backgroundColor: '#fff',
        color: color === 'red' ? '#e11d48' : '#1c1917'
      }}
    >
      {/* Decorative Border */}
      <div className="absolute inset-1.5 border border-stone-100 rounded-xl pointer-events-none" />

      {/* Top Left Corner */}
      <div className="absolute top-2.5 left-2.5 flex flex-col items-center leading-none">
        <span className={`text-2xl font-black ${isJoker ? 'text-lg' : ''}`}>{getDisplayRank(rank)}</span>
        {!isJoker && <span className="text-sm mt-0.5">{suit}</span>}
        {isJoker && <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5">Joker</span>}
      </div>

      {/* Center Symbol */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
         <span className="text-7xl select-none">{isJoker ? '🃏' : suit}</span>
      </div>

      {/* Bottom Right Corner */}
      <div className="absolute bottom-2.5 right-2.5 flex flex-col items-center leading-none rotate-180">
        <span className={`text-2xl font-black ${isJoker ? 'text-lg' : ''}`}>{getDisplayRank(rank)}</span>
        {!isJoker && <span className="text-sm mt-0.5">{suit}</span>}
        {isJoker && <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5">Joker</span>}
      </div>

      {/* Surface Gloss */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl pointer-events-none" />
      
      {/* Selection Glow */}
      {selected && (
        <div className="absolute inset-0 bg-amber-500/5 rounded-2xl pointer-events-none" />
      )}
    </motion.div>
  )
}

export default Card
