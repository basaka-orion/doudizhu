// AI决策逻辑
import { validateCards, CARD_TYPE, canBeat, getCardTypeName } from './validator'
import { getCardValue, countBombs, isBomb, isJokerBomb, sortHand } from './cards'

// AI思考延迟
const AI_THINK_MIN = 500
const AI_THINK_MAX = 1000

// 随机延迟
function thinkDelay() {
  return new Promise(resolve => {
    setTimeout(resolve, AI_THINK_MIN + Math.random() * (AI_THINK_MAX - AI_THINK_MIN))
  })
}

// AI决策
export async function aiPlay(hand, lastCards, playerRole, gameState) {
  await thinkDelay()

  const { landlord, players } = gameState
  const isLandlordPlayer = playerRole === landlord

  // 获取其他玩家的手牌数
  const otherPlayers = players.filter(p => p.role !== playerRole)
  const otherHandCounts = otherPlayers.map(p => p.hand.length)

  // 如果是首次出牌
  if (!lastCards || lastCards.length === 0) {
    return firstPlay(hand, isLandlordPlayer)
  }

  // 尝试压制
  return tryToBeat(hand, lastCards, isLandlordPlayer, otherHandCounts)
}

// 首次出牌策略
function firstPlay(hand, isLandlord) {
  const sortedHand = sortHand(hand)

  // 地主优先出大牌
  if (isLandlord) {
    // 找顺子
    const straight = findBestStraight(sortedHand)
    if (straight) return straight

    // 找连对
    const doubleStraight = findBestDoubleStraight(sortedHand)
    if (doubleStraight) return doubleStraight

    // 找飞机
    const airplane = findBestAirplane(sortedHand)
    if (airplane) return airplane
  }

  // 找三带一/三带对
  const tripleWith = findTripleWith(sortedHand)
  if (tripleWith) return tripleWith

  // 找对子
  const pair = findBestPair(sortedHand)
  if (pair) return pair

  // 出单张
  return [sortedHand[0]]
}

// 尝试压制
function tryToBeat(hand, lastCards, isLandlord, otherHandCounts) {
  const lastValidation = validateCards(lastCards)
  const sortedHand = sortHand(hand)

  // 尝试找到能压制的牌
  const beatingCards = findBeatingCards(sortedHand, lastValidation)

  if (beatingCards.length > 0) {
    // 如果手牌很少，优先出完
    if (hand.length <= 3) {
      return beatingCards
    }

    // 如果对方手牌很少，可能要不起
    if (otherHandCounts.some(c => c <= 2)) {
      // 判断是否应该放水
      if (!isLandlord && shouldPass(hand, lastValidation, otherHandCounts)) {
        return null
      }
    }

    return beatingCards
  }

  // 检查是否有炸弹
  const bombs = findBombs(sortedHand)
  if (bombs.length > 0) {
    // 如果对方是炸弹或王炸，不一定要炸
    if (lastValidation.type === CARD_TYPE.BOMB || lastValidation.type === CARD_TYPE.JOKER_BOMB) {
      return null
    }
    // 否则可以考虑炸
    return bombs
  }

  // 要不起
  return null
}

// 判断是否应该放水(农民)
function shouldPass(hand, lastValidation, otherHandCounts) {
  // 如果队友手牌也很少，不放水
  if (otherHandCounts.every(c => c > 3)) {
    // 检查自己有没有大牌可以收
    const handValues = hand.map(c => getCardValue(c))
    const maxValue = Math.max(...handValues)
    return maxValue < 12 // 少于A
  }
  return true
}

// 找能压制的牌
function findBeatingCards(hand, lastValidation) {
  const type = lastValidation.type

  switch (type) {
    case CARD_TYPE.SINGLE:
      return findBeatingSingle(hand, lastValidation.power)
    case CARD_TYPE.PAIR:
      return findBeatingPair(hand, lastValidation.power)
    case CARD_TYPE.TRIPLE:
      return findBeatingTriple(hand, lastValidation.power)
    case CARD_TYPE.TRIPLE_WITH_SINGLE:
      return findBeatingTripleWithSingle(hand, lastValidation.power)
    case CARD_TYPE.TRIPLE_WITH_PAIR:
      return findBeatingTripleWithPair(hand, lastValidation.power)
    case CARD_TYPE.STRAIGHT:
      return findBeatingStraight(hand, lastValidation.power)
    case CARD_TYPE.DOUBLE_STRAIGHT:
      return findBeatingDoubleStraight(hand, lastValidation.power)
    case CARD_TYPE.AIRPLANE:
      return findBeatingAirplane(hand, lastValidation.power)
    case CARD_TYPE.AIRPLANE_WITH_SINGLE:
      return findBeatingAirplaneWithSingle(hand, lastValidation.power)
    case CARD_TYPE.AIRPLANE_WITH_PAIR:
      return findBeatingAirplaneWithPair(hand, lastValidation.power)
    default:
      return []
  }
}

// 找能压制的单张
function findBeatingSingle(hand, minPower) {
  for (const card of hand) {
    if (getCardValue(card) > minPower) {
      return [card]
    }
  }
  return []
}

// 找能压制的对子
function findBeatingPair(hand, minPower) {
  const pairs = findPairs(hand)
  for (const pair of pairs) {
    if (getCardValue(pair[0]) > minPower) {
      return pair
    }
  }
  return []
}

// 找能压制的三张
function findBeatingTriple(hand, minPower) {
  const triples = findTriples(hand)
  for (const triple of triples) {
    if (getCardValue(triple[0]) > minPower) {
      return triple
    }
  }
  return []
}

// 找能压制的三带一
function findBeatingTripleWithSingle(hand, minPower) {
  const triples = findTriples(hand)
  if (triples.length === 0) return []

  for (let i = triples.length - 1; i >= 0; i--) {
    if (getCardValue(triples[i][0]) > minPower) {
      const triple = triples[i]
      const remaining = hand.filter(c => !triple.includes(c))
      if (remaining.length > 0) {
        return [...triple, remaining[0]]
      }
    }
  }
  return []
}

// 找能压制的三带对
function findBeatingTripleWithPair(hand, minPower) {
  const triples = findTriples(hand)
  const pairs = findPairs(hand)
  if (triples.length === 0 || pairs.length === 0) return []

  for (let i = triples.length - 1; i >= 0; i--) {
    if (getCardValue(triples[i][0]) > minPower) {
      const triple = triples[i]
      const remaining = hand.filter(c => !triple.includes(c))
      const availablePairs = findPairs(remaining)
      if (availablePairs.length > 0) {
        return [...triple, ...availablePairs[0]]
      }
    }
  }
  return []
}

// 找能压制的顺子
function findBeatingStraight(hand, minPower) {
  const straights = findAllStraights(hand)
  for (const straight of straights) {
    if (getCardValue(straight[0]) > minPower) {
      return straight
    }
  }
  return []
}

// 找能压制的连对
function findBeatingDoubleStraight(hand, minPower) {
  const doubleStraights = findAllDoubleStraights(hand)
  for (const ds of doubleStraights) {
    if (getCardValue(ds[0]) > minPower) {
      return ds
    }
  }
  return []
}

// 找能压制的飞机
function findBeatingAirplane(hand, minPower) {
  const airplanes = findAllAirplanes(hand)
  for (const airplane of airplanes) {
    if (getCardValue(airplane[0]) > minPower) {
      return airplane
    }
  }
  return []
}

// 找能压制的飞机带翅膀(单)
function findBeatingAirplaneWithSingle(hand, minPower) {
  const airplanes = findAllAirplanes(hand)
  for (const airplane of airplanes) {
    if (getCardValue(airplane[0]) > minPower) {
      const remaining = hand.filter(c => !airplane.includes(c))
      if (remaining.length >= airplane.length / 3) {
        return [...airplane, ...remaining.slice(0, airplane.length / 3)]
      }
    }
  }
  return []
}

// 找能压制的飞机带翅膀(对)
function findBeatingAirplaneWithPair(hand, minPower) {
  const airplanes = findAllAirplanes(hand)
  for (const airplane of airplanes) {
    if (getCardValue(airplane[0]) > minPower) {
      const remaining = hand.filter(c => !airplane.includes(c))
      const pairs = findPairs(remaining)
      if (pairs.length >= airplane.length / 3) {
        return [...airplane, ...pairs.slice(0, airplane.length / 3).flat()]
      }
    }
  }
  return []
}

// 辅助函数：找所有对子
function findPairs(hand) {
  const rankCount = {}
  for (const card of hand) {
    rankCount[card.rank] = (rankCount[card.rank] || 0) + 1
  }

  const pairs = []
  for (const [rank, count] of Object.entries(rankCount)) {
    if (count >= 2) {
      const pair = hand.filter(c => c.rank === rank).slice(0, 2)
      pairs.push(pair)
    }
  }

  return pairs.sort((a, b) => getCardValue(b[0]) - getCardValue(a[0]))
}

// 辅助函数：找所有三张
function findTriples(hand) {
  const rankCount = {}
  for (const card of hand) {
    rankCount[card.rank] = (rankCount[card.rank] || 0) + 1
  }

  const triples = []
  for (const [rank, count] of Object.entries(rankCount)) {
    if (count >= 3) {
      const triple = hand.filter(c => c.rank === rank).slice(0, 3)
      triples.push(triple)
    }
  }

  return triples.sort((a, b) => getCardValue(b[0]) - getCardValue(a[0]))
}

// 辅助函数：找炸弹
function findBombs(hand) {
  const rankCount = {}
  for (const card of hand) {
    rankCount[card.rank] = (rankCount[card.rank] || 0) + 1
  }

  // 找四张
  for (const [rank, count] of Object.entries(rankCount)) {
    if (count === 4) {
      return hand.filter(c => c.rank === rank)
    }
  }

  // 检查王炸
  const ranks = hand.map(c => c.rank)
  if (ranks.includes('小王') && ranks.includes('大王')) {
    return hand.filter(c => c.rank === '小王' || c.rank === '大王')
  }

  return []
}

// 辅助函数：找所有顺子
function findAllStraights(hand) {
  const values = [...new Set(hand.map(c => getCardValue(c)))].filter(v => v < 13).sort((a, b) => a - b)

  const straights = []
  for (let start = 0; start < values.length; start++) {
    for (let end = start + 4; end < values.length; end++) {
      let isStraight = true
      for (let i = start + 1; i <= end; i++) {
        if (values[i] !== values[i-1] + 1) {
          isStraight = false
          break
        }
      }
      if (isStraight) {
        const straight = values.slice(start, end + 1).map(v => {
          return hand.find(c => getCardValue(c) === v)
        })
        straights.push(straight)
      }
    }
  }

  return straights.sort((a, b) => getCardValue(b[0]) - getCardValue(a[0]))
}

// 找最好的顺子
function findBestStraight(hand) {
  const straights = findAllStraights(hand)
  if (straights.length === 0) return null

  // 返回最大的顺子
  return straights[0]
}

// 找所有连对
function findAllDoubleStraights(hand) {
  const pairs = findPairs(hand)
  if (pairs.length < 3) return []

  const values = pairs.map(p => getCardValue(p[0]))
  const doubleStraights = []

  for (let start = 0; start < values.length - 2; start++) {
    let isDoubleStraight = true
    for (let i = start + 1; i < Math.min(start + values.length, values.length); i++) {
      if (i > start && values[i] !== values[i-1] + 1) {
        break
      }
      const length = i - start + 1
      if (length >= 3) {
        const ds = pairs.slice(start, i + 1).flat()
        doubleStraights.push(ds)
      }
    }
  }

  return doubleStraights.sort((a, b) => getCardValue(b[0]) - getCardValue(a[0]))
}

// 找最好的连对
function findBestDoubleStraight(hand) {
  const doubleStraights = findAllDoubleStraights(hand)
  if (doubleStraights.length === 0) return null
  return doubleStraights[0]
}

// 找所有飞机
function findAllAirplanes(hand) {
  const triples = findTriples(hand)
  if (triples.length < 2) return []

  const values = triples.map(t => getCardValue(t[0]))
  const airplanes = []

  for (let start = 0; start < values.length - 1; start++) {
    let isAirplane = true
    for (let i = start + 1; i < values.length; i++) {
      if (values[i] !== values[i-1] + 1) {
        break
      }
      const length = i - start + 1
      if (length >= 2) {
        const airplane = triples.slice(start, i + 1).flat()
        airplanes.push(airplane)
      }
    }
  }

  return airplanes.sort((a, b) => getCardValue(b[0]) - getCardValue(a[0]))
}

// 找最好的飞机
function findBestAirplane(hand) {
  const airplanes = findAllAirplanes(hand)
  if (airplanes.length === 0) return null
  return airplanes[0]
}

// 找三带一/三带对
function findTripleWith(hand) {
  const triples = findTriples(hand)
  if (triples.length === 0) return null

  const triple = triples[0]
  const remaining = hand.filter(c => !triple.includes(c))

  // 找对子带
  const pairs = findPairs(remaining)
  if (pairs.length > 0) {
    return [...triple, ...pairs[0]]
  }

  // 找单张带
  if (remaining.length > 0) {
    return [...triple, remaining[0]]
  }

  return null
}

// 找最好的对子
function findBestPair(hand) {
  const pairs = findPairs(hand)
  if (pairs.length === 0) return null
  return pairs[0]
}

// AI叫地主决策
export async function aiBid(hand, bidIndex, maxBid) {
  await thinkDelay()

  const sortedHand = sortHand(hand)
  const bombCount = countBombs(hand)
  const highCardCount = hand.filter(c => getCardValue(c) >= 10).length

  // 有王炸必叫
  if (isJokerBomb(hand)) {
    return 3
  }

  // 炸弹多可以考虑
  if (bombCount >= 2) {
    return Math.min(3, maxBid + 1)
  }

  // 大牌多可以考虑
  if (highCardCount >= 6) {
    return Math.min(2, maxBid + 1)
  }

  // 有2可以叫
  const hasTwo = hand.some(c => c.rank === '2')
  if (hasTwo && highCardCount >= 4) {
    return Math.min(2, maxBid + 1)
  }

  // 不叫
  return 0
}
