import React from 'react'

const Card = ({ card, selected, onClick, disabled, isBack, isBomb, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-10 h-14 text-[10px]',
    md: 'w-16 h-24 text-sm',
    lg: 'w-20 h-28 text-lg'
  }

  const currentSize = sizeClasses[size] || sizeClasses.md

  if (isBack) {
    return (
      <div
        className={`${currentSize} rounded-lg border-2 border-white bg-blue-700 shadow-md 
          ${disabled ? 'opacity-50' : 'cursor-pointer hover:-translate-y-1'}
          transition-all duration-200 relative overflow-hidden`}
        onClick={disabled ? null : onClick}
        style={{
          backgroundImage: 'radial-gradient(circle at center, #2563eb 0%, #1e40af 100%)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2), inset 0 0 20px rgba(255,255,255,0.2)'
        }}
      >
        <div className="absolute inset-2 border border-white/20 rounded-md flex items-center justify-center">
          <div className="text-white/20 text-4xl rotate-45">♠</div>
        </div>
      </div>
    )
  }

  const isRed = card.suit === '♥' || card.suit === '♦' || card.rank === '大王'
  const isJoker = card.rank === '小王' || card.rank === '大王'
  const colorClass = isRed ? 'text-red-600' : 'text-slate-900'

  return (
    <div
      className={`${currentSize} rounded-lg bg-white shadow-xl flex flex-col p-1.5 border border-slate-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-2xl'}
        ${selected ? '-translate-y-6' : ''}
        ${isBomb ? 'ring-2 ring-yellow-400 animate-pulse' : ''}
        transition-all duration-200 relative select-none`}
      onClick={disabled ? null : onClick}
      style={{
        boxShadow: selected ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className={`flex flex-col items-start leading-none font-bold ${colorClass}`}>
        <span>{card.rank}</span>
        <span className="text-xs">{isJoker ? '' : card.suit}</span>
      </div>

      <div className={`flex-1 flex items-center justify-center ${colorClass}`}>
        <span className={`${size === 'sm' ? 'text-xl' : 'text-3xl'}`}>
          {isJoker ? '🃏' : card.suit}
        </span>
      </div>

      <div className={`flex flex-col items-end leading-none font-bold rotate-180 ${colorClass}`}>
        <span>{card.rank}</span>
        <span className="text-xs">{isJoker ? '' : card.suit}</span>
      </div>
    </div>
  )
}

export default Card
