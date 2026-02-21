// src/game/validator.js

export const CARD_TYPES = {
  SINGLE: '单张',
  PAIR: '对子',
  TRIPLE: '三张',
  TRIPLE_SINGLE: '三带一',
  TRIPLE_PAIR: '三带二',
  STRAIGHT: '顺子',
  PAIR_STRAIGHT: '连对',
  AIRPLANE: '飞机',
  AIRPLANE_SINGLE: '飞机带单',
  AIRPLANE_PAIR: '飞机带双',
  BOMB: '炸弹',
  ROCKET: '王炸',
  INVALID: '非法牌型'
};

export const getType = (cards) => {
  if (!cards || cards.length === 0) return { type: CARD_TYPES.INVALID, weight: -1 };
  
  const sorted = [...cards].sort((a, b) => a.rankWeight - b.rankWeight);
  const len = cards.length;
  const weights = sorted.map(c => c.rankWeight);
  
  // 统计每个点数出现的次数
  const counts = {};
  weights.forEach(w => counts[w] = (counts[w] || 0) + 1);
  const countEntries = Object.entries(counts).sort((a, b) => b[1] - a[1] || parseInt(b[0]) - parseInt(a[0]));
  
  // 王炸
  if (len === 2 && weights[0] >= 52 && weights[1] >= 52) {
    return { type: CARD_TYPES.ROCKET, weight: 1000 };
  }

  // 炸弹
  if (len === 4 && countEntries[0][1] === 4) {
    return { type: CARD_TYPES.BOMB, weight: parseInt(countEntries[0][0]) + 500 };
  }

  // 单张
  if (len === 1) return { type: CARD_TYPES.SINGLE, weight: weights[0] };

  // 对子
  if (len === 2 && countEntries[0][1] === 2) return { type: CARD_TYPES.PAIR, weight: weights[0] };

  // 三张系列
  if (len === 3 && countEntries[0][1] === 3) return { type: CARD_TYPES.TRIPLE, weight: weights[0] };
  if (len === 4 && countEntries[0][1] === 3) return { type: CARD_TYPES.TRIPLE_SINGLE, weight: parseInt(countEntries[0][0]) };
  if (len === 5 && countEntries[0][1] === 3 && countEntries[1][1] === 2) return { type: CARD_TYPES.TRIPLE_PAIR, weight: parseInt(countEntries[0][0]) };

  // 顺子 (5张起)
  if (len >= 5 && countEntries.every(e => e[1] === 1) && weights[len-1] < 12) { // 不能包含2和王
    if (weights[len-1] - weights[0] === len - 1) return { type: CARD_TYPES.STRAIGHT, weight: weights[0] };
  }

  // 连对 (3对起)
  if (len >= 6 && len % 2 === 0 && countEntries.every(e => e[1] === 2) && weights[len-1] < 12) {
    const uniqueWeights = [...new Set(weights)].sort((a, b) => a - b);
    if (uniqueWeights[uniqueWeights.length-1] - uniqueWeights[0] === uniqueWeights.length - 1) 
      return { type: CARD_TYPES.PAIR_STRAIGHT, weight: weights[0] };
  }

  // 更多复杂牌型（飞机等）简化处理
  return { type: CARD_TYPES.INVALID, weight: -1 };
};

export const canPlay = (newCards, prevCards) => {
  const newInfo = getType(newCards);
  if (newInfo.type === CARD_TYPES.INVALID) return false;
  if (!prevCards || prevCards.length === 0) return newInfo;

  const prevInfo = getType(prevCards);
  
  // 王炸压一切
  if (newInfo.type === CARD_TYPES.ROCKET) return newInfo;
  
  // 炸弹压非炸弹
  if (newInfo.type === CARD_TYPES.BOMB && prevInfo.type !== CARD_TYPES.BOMB && prevInfo.type !== CARD_TYPES.ROCKET) return newInfo;

  // 同牌型比权重
  if (newInfo.type === prevInfo.type && newCards.length === prevCards.length) {
    if (newInfo.weight > prevInfo.weight) return newInfo;
  }

  return false;
};
