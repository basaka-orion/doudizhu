// src/components/CardHand.jsx
import React, { useState, useRef } from 'react'
import Card from './Card'

const CardHand = ({ cards, selectedCards, onCardClick, selectable = true, isPlayer = false }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [startIndex, setStartIndex] = useState(-1)
  const containerRef = useRef(null)

  if (!cards || cards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[120px]">
        <span className="text-white/30 text-lg font-serif italic tracking-widest">No Cards</span>
      </div>
    )
  }

  // 计算重叠位置
  const getCardStyle = (index, total) => {
    if (!isPlayer) {
      // AI 手牌更紧凑
      const offset = 20;
      return {
        marginLeft: index === 0 ? 0 : `-${offset}px`,
        zIndex: index,
      }
    }
    // 玩家手牌
    const maxOverlap = 60; // 最大重叠像素
    const containerWidth = containerRef.current?.offsetWidth || 800;
    const cardWidth = 100;
    const totalNeeded = cardWidth + (total - 1) * (cardWidth - maxOverlap);
    
    let overlap = maxOverlap;
    if (totalNeeded > containerWidth - 40) {
      overlap = cardWidth - (containerWidth - 40 - cardWidth) / (total - 1);
    }

    return {
      marginLeft: index === 0 ? 0 : `-${overlap}px`,
      zIndex: index,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    }
  }

  const handleToggleCard = (card) => {
    const isSelected = selectedCards.some(
      c => c.suit === card.suit && c.rank === card.rank
    )
    let newSelected;
    if (isSelected) {
      newSelected = selectedCards.filter(c => !(c.suit === card.suit && c.rank === card.rank))
    } else {
      newSelected = [...selectedCards, card]
    }
    onCardClick(newSelected)
  }

  return (
    <div 
      ref={containerRef}
      className={`flex justify-center items-end px-10 py-6 select-none ${isPlayer ? 'min-h-[180px] w-full' : 'scale-75 origin-bottom'}`}
    >
      <div className="flex">
        {cards.map((card, index) => {
          const isSelected = selectedCards.some(
            c => c.suit === card.suit && c.rank === card.rank
          )

          return (
            <div 
              key={`${card.rank}-${card.suit}-${index}`}
              style={getCardStyle(index, cards.length)}
              className="relative group"
            >
              <Card
                card={card}
                selected={isSelected}
                onClick={() => selectable && handleToggleCard(card)}
                disabled={!selectable}
              />
              {/* 优雅的阴影和悬停效果 */}
              {isPlayer && selectable && (
                <div className="absolute inset-0 pointer-events-none rounded-lg group-hover:bg-white/5 transition-colors" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CardHand
