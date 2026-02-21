// src/components/GameResult.jsx
import React from 'react'
import { motion } from 'framer-motion'

const GameResult = ({ winner, reason, onRestart }) => {
  const isPlayerWinner = winner === 'player' || (winner !== 'landlord' && winner !== 'player') // Simplified: if you are a farmer and farmers win

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.5, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        className={`p-16 rounded-[4rem] text-center space-y-10 border-8 border-double ${isPlayerWinner ? 'bg-amber-900/20 border-amber-500 shadow-[0_0_100px_rgba(251,191,36,0.4)]' : 'bg-red-950/20 border-red-900 shadow-[0_0_100px_rgba(127,29,29,0.4)]'}`}
      >
        <h2 className={`text-7xl font-black uppercase tracking-tighter italic ${isPlayerWinner ? 'text-amber-500' : 'text-red-600'}`} style={{ textShadow: '6px 6px 0px #000' }}>
          {isPlayerWinner ? 'Grand Victory' : 'Total Defeat'}
        </h2>
        
        <div className="space-y-2">
          <p className="text-white/60 font-mono tracking-[0.4em] uppercase text-sm">{reason}</p>
          <div className="h-1 w-24 bg-white/10 mx-auto rounded-full"></div>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={onRestart}
            className={`px-20 py-6 rounded-2xl font-black text-2xl transition-all border-b-8 active:border-b-0 active:translate-y-2 uppercase tracking-widest ${isPlayerWinner ? 'bg-amber-600 border-amber-800 text-stone-100 hover:bg-amber-500' : 'bg-stone-800 border-black text-white hover:bg-stone-700'}`}
          >
            Reclaim Glory
          </button>
          <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest">Protocol Reset Initiated</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default GameResult
