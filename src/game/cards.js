// 牌的定义和工具函数

// 花色
const SUITS = {
  SPADE: '♠',
  HEART: '♥',
  CLUB: '♣',
  DIAMOND: '♦',
}

// 点数 (3最小, 2最大)
const RANKS = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2']

// 特殊牌
const JOKER_SMALL = '小王'
const JOKER_BIG = '大王'

// 获取牌的数值 (用于比较大小)
export function getCardValue(card) {
  if (card.rank === JOKER_SMALL) return 14
  if (card.rank === JOKER_BIG) return 15
  return RANKS.indexOf(card.rank)
}

// 获取牌的排序值 (用于手牌排序)
export function getCardSortValue(card) {
  if (card.rank === JOKER_SMALL) return 53
  if (card.rank === JOKER_BIG) return 54
  const suitValue = { '♠': 3, '♥': 2, '♣': 1, '♦': 0 }
  const rankValue = RANKS.indexOf(card.rank)
  return rankValue * 4 + suitValue[card.suit]
}

// 创建一副牌
export function createDeck() {
  const deck = []

  // 普通牌
  for (const suit of Object.values(SUITS)) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, isRed: suit === '♥' || suit === '♦' })
    }
  }

  // 小王
  deck.push({ suit: '', rank: JOKER_SMALL, isRed: false })

  // 大王
  deck.push({ suit: '', rank: JOKER_BIG, isRed: true })

  return deck
}

// 洗牌
export function shuffleDeck(deck) {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// 发牌
export function dealCards(deck) {
  const player1 = []
  const player2 = []
  const player3 = []
  const landlordCards = []

  // 每人17张
  for (let i = 0; i < 17; i++) {
    player1.push(deck[i])
    player2.push(deck[i + 17])
    player3.push(deck[i + 34])
  }

  // 最后3张作为底牌
  for (let i = 51; i < 54; i++) {
    landlordCards.push(deck[i])
  }

  return { player1, player2, player3, landlordCards }
}

// 排序手牌
export function sortHand(cards) {
  return [...cards].sort((a, b) => getCardSortValue(b) - getCardSortValue(a))
}

// 检查是否是炸弹
export function isBomb(cards) {
  if (cards.length !== 4) return false
  const ranks = cards.map(c => c.rank)
  return ranks[0] === ranks[1] && ranks[1] === ranks[2] && ranks[2] === ranks[3]
}

// 检查是否是王炸
export function isJokerBomb(cards) {
  if (cards.length !== 2) return false
  const ranks = cards.map(c => c.rank)
  return (ranks.includes(JOKER_SMALL) && ranks.includes(JOKER_BIG))
}

// 获取牌组中的炸弹数量
export function countBombs(cards) {
  const rankCount = {}
  for (const card of cards) {
    rankCount[card.rank] = (rankCount[card.rank] || 0) + 1
  }

  let bombs = 0
  for (const count of Object.values(rankCount)) {
    if (count === 4) bombs++
  }

  // 王炸算炸弹
  const ranks = cards.map(c => c.rank)
  if (ranks.includes(JOKER_SMALL) && ranks.includes(JOKER_BIG)) {
    bombs++
  }

  return bombs
}

export { SUITS, RANKS, JOKER_SMALL, JOKER_BIG }
