// 手牌组件
import React from 'react'
import Card from './Card'

const CardHand = ({ cards, selectedCards, onCardClick, selectable = true, isPlayer = false }) => {
  if (!cards || cards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[100px]">
        <span className="text-white/50 text-lg">无牌</span>
      </div>
    )
  }

  const handleCardClick = (card) => {
    if (!selectable || onCardClick === null) return

    // 检查是否是王炸
    const isJokerBomb = (c1, c2) =>
      (c1.rank === '小王' && c2.rank === '大王') ||
      (c1.rank === '大王' && c2.rank === '小王')

    const isSelected = selectedCards.some(
      c => c.suit === card.suit && c.rank === card.rank
    )

    if (isSelected) {
      // 取消选择
      const newSelected = selectedCards.filter(
        c => !(c.suit === card.suit && c.rank === card.rank)
      )
      onCardClick(newSelected)
    } else {
      // 检查是否选择了王炸
      let newSelected = [...selectedCards, card]

      // 如果选择的是王，尝试与已选择的王组成王炸
      if (card.rank === '小王' || card.rank === '大王') {
        const otherJoker = selectedCards.find(
          c => (c.rank === '小王' || c.rank === '大王') && c.rank !== card.rank
        )
        if (otherJoker) {
          // 已有另一张王，选中这张就组成王炸
          newSelected = [otherJoker, card]
        }
      }

      onCardClick(newSelected)
    }
  }

  // 检查是否是炸弹或王炸
  const isBombCard = (card) => {
    const selectedRanks = selectedCards.map(c => c.rank)
    if (selectedRanks.includes('小王') && selectedRanks.includes('大王')) {
      return true
    }
    const count = selectedRanks.filter(r => r === card.rank).length
    return count === 3 // 选第4张时显示炸弹效果
  }

  return (
    <div className={`flex flex-wrap justify-center items-end gap-1 px-4 py-2 ${isPlayer ? 'min-h-[120px]' : ''}`}>
      {cards.map((card, index) => {
        const isSelected = selectedCards.some(
          c => c.suit === card.suit && c.rank === card.rank
        )
        const showBomb = selectable && isSelected && isBombCard(card)

        return (
          <Card
            key={`${card.rank}-${card.suit}-${index}`}
            card={card}
            selected={isSelected}
            onClick={() => handleCardClick(card)}
            disabled={!selectable}
            isBomb={showBomb}
          />
        )
      })}
    </div>
  )
}

export default CardHand
