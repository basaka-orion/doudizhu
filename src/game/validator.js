// 核心出牌验证器
export const CARD_TYPE = {
  SINGLE: 'single',
  PAIR: 'pair',
  TRIPLE: 'triple',
  TRIPLE_WITH_SINGLE: 'triple_with_single',
  TRIPLE_WITH_PAIR: 'triple_with_pair',
  STRAIGHT: 'straight',
  DOUBLE_STRAIGHT: 'double_straight',
  AIRPLANE: 'airplane',
  AIRPLANE_WITH_SINGLE: 'airplane_with_single',
  AIRPLANE_WITH_PAIR: 'airplane_with_pair',
  QUAD_WITH_TWO: 'quad_with_two',
  BOMB: 'bomb',
  JOKER_BOMB: 'joker_bomb',
  INVALID: 'invalid'
}

// 牌值映射
const rankValue = {
  '3': 0, '4': 1, '5': 2, '6': 3, '7': 4, '8': 5, '9': 6, '10': 7, 
  'J': 8, 'Q': 9, 'K': 10, 'A': 11, '2': 12, '小王': 13, '大王': 14
}

export function getCardValue(card) {
  if (!card) return -1
  return rankValue[card.rank] ?? -1
}

export function getCardTypeName(type) {
  const names = {
    [CARD_TYPE.SINGLE]: '单张',
    [CARD_TYPE.PAIR]: '对子',
    [CARD_TYPE.TRIPLE]: '三不带',
    [CARD_TYPE.TRIPLE_WITH_SINGLE]: '三带一',
    [CARD_TYPE.TRIPLE_WITH_PAIR]: '三带二',
    [CARD_TYPE.STRAIGHT]: '顺子',
    [CARD_TYPE.DOUBLE_STRAIGHT]: '连对',
    [CARD_TYPE.AIRPLANE]: '飞机',
    [CARD_TYPE.AIRPLANE_WITH_SINGLE]: '飞机带单',
    [CARD_TYPE.AIRPLANE_WITH_PAIR]: '飞机带对',
    [CARD_TYPE.QUAD_WITH_TWO]: '四带二',
    [CARD_TYPE.BOMB]: '炸弹',
    [CARD_TYPE.JOKER_BOMB]: '王炸',
    [CARD_TYPE.INVALID]: '非法牌型'
  }
  return names[type] || '未知'
}

export function validateCards(cards) {
  if (!cards || cards.length === 0) return { valid: false, type: CARD_TYPE.INVALID }

  const sortedCards = [...cards].sort((a, b) => getCardValue(a) - getCardValue(b))
  const len = sortedCards.length
  const values = sortedCards.map(c => getCardValue(c))
  
  const counts = {}
  values.forEach(v => counts[v] = (counts[v] || 0) + 1)
  const countValues = Object.values(counts).sort((a, b) => b - a)
  const countKeys = Object.keys(counts).map(Number).sort((a, b) => counts[b] - counts[a] || a - b)

  // 王炸
  if (len === 2 && values.includes(13) && values.includes(14)) {
    return { valid: true, type: CARD_TYPE.JOKER_BOMB, power: 999 }
  }

  // 炸弹
  if (len === 4 && countValues[0] === 4) {
    return { valid: true, type: CARD_TYPE.BOMB, power: countKeys[0] }
  }

  // 单张
  if (len === 1) {
    return { valid: true, type: CARD_TYPE.SINGLE, power: values[0] }
  }

  // 对子
  if (len === 2 && values[0] === values[1]) {
    return { valid: true, type: CARD_TYPE.PAIR, power: values[0] }
  }

  // 三张
  if (len === 3 && countValues[0] === 3) {
    return { valid: true, type: CARD_TYPE.TRIPLE, power: countKeys[0] }
  }

  // 三带一
  if (len === 4 && countValues[0] === 3) {
    return { valid: true, type: CARD_TYPE.TRIPLE_WITH_SINGLE, power: countKeys[0] }
  }

  // 三带二
  if (len === 5 && countValues[0] === 3 && countValues[1] === 2) {
    return { valid: true, type: CARD_TYPE.TRIPLE_WITH_PAIR, power: countKeys[0] }
  }

  // 顺子 (5张及以上)
  if (len >= 5 && countValues[0] === 1 && values[len-1] < 12) {
    let isStraight = true
    for (let i = 1; i < len; i++) {
      if (values[i] !== values[i-1] + 1) { isStraight = false; break }
    }
    if (isStraight) return { valid: true, type: CARD_TYPE.STRAIGHT, power: values[0], length: len }
  }

  // 连对 (3对及以上)
  if (len >= 6 && len % 2 === 0 && countValues.every(v => v === 2) && values[len-1] < 12) {
    let isDoubleStraight = true
    for (let i = 2; i < len; i += 2) {
      if (values[i] !== values[i-2] + 1) { isDoubleStraight = false; break }
    }
    if (isDoubleStraight) return { valid: true, type: CARD_TYPE.DOUBLE_STRAIGHT, power: values[0], length: len / 2 }
  }

  // 飞机 (2个三张及以上)
  if (len >= 6 && len % 3 === 0 && countValues.every(v => v === 3) && countKeys[0] < 12) {
    const keys = countKeys.sort((a, b) => a - b)
    let isAirplane = true
    for (let i = 1; i < keys.length; i++) {
      if (keys[i] !== keys[i-1] + 1) { isAirplane = false; break }
    }
    if (isAirplane) return { valid: true, type: CARD_TYPE.AIRPLANE, power: keys[0], length: keys.length }
  }

  return { valid: false, type: CARD_TYPE.INVALID }
}

export function canBeat(cards, lastCards, isLandlord, role) {
  const v1 = validateCards(cards)
  const v2 = validateCards(lastCards)

  if (!v1.valid) return false
  if (v1.type === CARD_TYPE.JOKER_BOMB) return true
  if (v2.type === CARD_TYPE.JOKER_BOMB) return false

  if (v1.type === CARD_TYPE.BOMB && v2.type !== CARD_TYPE.BOMB) return true
  
  if (v1.type === v2.type) {
    if (v1.length && v1.length !== v2.length) return false
    return v1.power > v2.power
  }

  return false
}
