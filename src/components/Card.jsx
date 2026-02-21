// src/components/Card.jsx
import React from 'react'

const Card = ({ card, selected, onClick, disabled, isBomb }) => {
  const { rank, suit, color, isJoker } = card

  // 牌面显示
  const getDisplayRank = (r) => {
    if (r === '小王') return 'JOKER'
    if (r === '大王') return 'JOKER'
    return r
  }

  const rankClass = isJoker ? 'text-lg font-black' : 'text-2xl font-bold'
  
  return (
    <div
      onClick={onClick}
      className={`
        relative w-24 h-36 rounded-xl cursor-pointer border-2 shadow-2xl transition-all duration-300 transform
        ${selected ? '-translate-y-8 shadow-[0_20px_40px_rgba(0,0,0,0.4)] border-amber-400 z-50' : 'bg-white border-gray-200 hover:-translate-y-4 hover:shadow-xl'}
        ${disabled ? 'cursor-default brightness-90' : ''}
        ${isBomb ? 'ring-4 ring-red-500 animate-pulse' : ''}
      `}
      style={{
        backgroundColor: '#fff',
        color: color === 'red' ? '#e11d48' : '#1f2937'
      }}
    >
      {/* 牌面纹理 */}
      <div className="absolute inset-1 border border-gray-100 rounded-lg opacity-50" />
      
      {/* 左上角 */}
      <div className="absolute top-2 left-2 flex flex-col items-center leading-none">
        <span className={rankClass}>{getDisplayRank(rank)}</span>
        {!isJoker && <span className="text-xl">{suit}</span>}
      </div>

      {/* 中心大图标 */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
         <span className="text-7xl select-none">{isJoker ? '🃏' : suit}</span>
      </div>

      {/* 右下角 (倒转) */}
      <div className="absolute bottom-2 right-2 flex flex-col items-center leading-none rotate-180">
        <span className={rankClass}>{getDisplayRank(rank)}</span>
        {!isJoker && <span className="text-xl">{suit}</span>}
      </div>

      {/* 选中状态遮罩 */}
      {selected && (
        <div className="absolute inset-0 bg-amber-500/10 rounded-lg pointer-events-none" />
      )}
    </div>
  )
}

export default Card
