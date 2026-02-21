// src/components/Bidding.jsx
import React from 'react'

const Bidding = ({ currentMaxBid, onBid, isPlayerTurn }) => {
  if (!isPlayerTurn) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-stone-900/40 backdrop-blur-md rounded-2xl border border-white/10 animate-pulse">
        <span className="text-amber-500 font-serif tracking-[0.2em] uppercase text-sm">Opponents are thinking...</span>
      </div>
    )
  }

  const options = [
    { label: '不 叫', value: 0, color: 'bg-stone-700 hover:bg-stone-600' },
    { label: '1 分', value: 1, color: 'bg-amber-900/50 hover:bg-amber-800' },
    { label: '2 分', value: 2, color: 'bg-amber-800/70 hover:bg-amber-700' },
    { label: '3 分', value: 3, color: 'bg-amber-600 hover:bg-amber-500' },
  ]

  return (
    <div className="flex flex-col items-center gap-6 p-10 bg-stone-950/80 backdrop-blur-xl rounded-3xl border-2 border-amber-900/50 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <h2 className="text-2xl font-black text-amber-500 uppercase tracking-widest italic" style={{ textShadow: '2px 2px 0px #3e2723' }}>
        Claim Your Domain
      </h2>
      
      <div className="flex gap-4">
        {options.map((opt) => (
          <button
            key={opt.value}
            disabled={opt.value !== 0 && opt.value <= currentMaxBid}
            onClick={() => onBid(opt.value)}
            className={`
              px-8 py-4 rounded-xl font-black text-xl transition-all transform hover:scale-105 active:scale-95
              border-b-4 border-black/40 shadow-lg uppercase
              ${opt.color} 
              ${opt.value !== 0 && opt.value <= currentMaxBid ? 'opacity-20 grayscale pointer-events-none' : 'text-stone-100'}
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="text-xs text-stone-500 uppercase tracking-widest font-mono">
        Current Highest Bid: <span className="text-amber-700">{currentMaxBid === 0 ? 'None' : `${currentMaxBid} Points`}</span>
      </div>
    </div>
  )
}

export default Bidding
