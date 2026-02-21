// src/components/PlayArea.jsx
import React from 'react'

const PlayArea = ({ cards, isLandlord }) => {
  if (!cards || cards.length === 0) return (
    <div className="h-24 flex items-center justify-center opacity-30 italic text-stone-500 text-sm">
      PASS
    </div>
  )

  return (
    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
      <div className="flex -space-x-12 mb-2">
        {cards.map((card, idx) => (
          <div 
            key={idx} 
            className="w-16 h-24 bg-white rounded-lg border-2 border-stone-200 shadow-xl flex flex-col items-center justify-center relative overflow-hidden"
            style={{ color: card.color === 'red' ? '#e11d48' : '#1f2937' }}
          >
            <span className="text-sm font-black absolute top-1 left-1 leading-none">{card.rank}</span>
            <span className="text-xl">{card.isJoker ? '🃏' : card.suit}</span>
            <span className="text-sm font-black absolute bottom-1 right-1 leading-none rotate-180">{card.rank}</span>
          </div>
        ))}
      </div>
      {isLandlord && (
        <div className="bg-amber-600 px-2 py-0.5 rounded text-[8px] font-black text-black uppercase tracking-tighter">
          Landlord
        </div>
      )}
    </div>
  )
}

export default PlayArea
