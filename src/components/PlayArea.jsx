import React from 'react'
import Card from './Card'
import { getCardTypeName } from '../game/validator'
import { PLAYER_ROLE } from '../game/gameEngine'

const PlayArea = ({ playArea, lastCards, lastPlayer, currentPlayer }) => {
  const renderCards = (cards, playerLabel) => {
    if (!cards || cards.length === 0) return null
    
    return (
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
        <div className="flex -space-x-8 mb-2">
          {cards.map((card, idx) => (
            <Card key={idx} card={card} size="md" />
          ))}
        </div>
        <div className="bg-yellow-400/20 backdrop-blur-sm border border-yellow-400/50 px-2 py-0.5 rounded text-yellow-400 text-[10px] font-bold uppercase tracking-wider">
          {playerLabel}
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {/* 左侧出的牌 */}
      <div className="absolute left-[20%] top-1/2 -translate-y-1/2">
        {renderCards(playArea[PLAYER_ROLE.LEFT_AI], 'Pass')}
      </div>

      {/* 右侧出的牌 */}
      <div className="absolute right-[20%] top-1/2 -translate-y-1/2">
        {renderCards(playArea[PLAYER_ROLE.RIGHT_AI], 'Pass')}
      </div>

      {/* 中间最近出的牌 */}
      <div className="flex flex-col items-center">
        {lastCards && lastCards.length > 0 ? (
          <div className="flex flex-col items-center scale-110 drop-shadow-2xl">
            <div className="flex -space-x-10 mb-4">
              {lastCards.map((card, idx) => (
                <Card key={idx} card={card} size="lg" isBomb={lastCards.length >= 4} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-white/10 text-6xl font-black uppercase tracking-tighter select-none">
            斗地主
          </div>
        )}
      </div>
      
      {/* 出牌提示消息 */}
      {currentPlayer !== null && (
        <div className="absolute top-[20%] text-white/30 text-xs animate-pulse">
          轮到 {currentPlayer === 0 ? '你' : currentPlayer === 1 ? '电脑左' : '电脑右'} 出牌...
        </div>
      )}
    </div>
  )
}

export default PlayArea
