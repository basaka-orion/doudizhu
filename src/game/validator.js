// src/game/validator.js

export const CARD_TYPES = {
  SINGLE: 'single',
  PAIR: 'pair',
  TRIPLE: 'triple',
  TRIPLE_SINGLE: 'triple_single',
  TRIPLE_PAIR: 'triple_pair',
  STRAIGHT: 'straight',
  PAIR_STRAIGHT: 'pair_straight',
  AIRPLANE: 'airplane',
  AIRPLANE_SINGLE: 'airplane_single',
  AIRPLANE_PAIR: 'airplane_pair',
  QUAD_SINGLE: 'quad_single',
  QUAD_PAIR: 'quad_pair',
  BOMB: 'bomb',
  ROCKET: 'rocket',
  INVALID: 'invalid'
};

export const getType = (cards) => {
  if (!cards || cards.length === 0) return { type: CARD_TYPES.INVALID, weight: -1 };
  
  const sorted = [...cards].sort((a, b) => a.rankWeight - b.rankWeight);
  const len = cards.length;
  const weights = sorted.map(c => c.rankWeight);
  
  // 统计点数
  const counts = {};
  weights.forEach(w => counts[w] = (counts[w] || 0) + 1);
  const countEntries = Object.entries(counts).sort((a, b) => b[1] - a[1] || parseInt(b[0]) - parseInt(a[0]));
  
  const maxCount = countEntries[0][1];
  const distinctRanks = countEntries.length;

  // 1. 火箭 (王炸)
  if (len === 2 && weights[0] >= 52 && weights[1] >= 52) return { type: CARD_TYPES.ROCKET, weight: 1000 };

  // 2. 炸弹
  if (len === 4 && maxCount === 4) return { type: CARD_TYPES.BOMB, weight: parseInt(countEntries[0][0]) };

  // 3. 单张
  if (len === 1) return { type: CARD_TYPES.SINGLE, weight: weights[0] };

  // 4. 对子
  if (len === 2 && maxCount === 2) return { type: CARD_TYPES.PAIR, weight: weights[0] };

  // 5. 三张系列
  if (len === 3 && maxCount === 3) return { type: CARD_TYPES.TRIPLE, weight: weights[0] };
  if (len === 4 && maxCount === 3) return { type: CARD_TYPES.TRIPLE_SINGLE, weight: parseInt(countEntries[0][0]) };
  if (len === 5 && maxCount === 3 && countEntries[1][1] === 2) return { type: CARD_TYPES.TRIPLE_PAIR, weight: parseInt(countEntries[0][0]) };

  // 6. 顺子 (5张起, 不能有2和王)
  if (len >= 5 && maxCount === 1 && weights[len-1] < 12) {
    if (weights[len-1] - weights[0] === len - 1) return { type: CARD_TYPES.STRAIGHT, weight: weights[0] };
  }

  // 7. 连对 (3对起, 不能有2和王)
  if (len >= 6 && len % 2 === 0 && maxCount === 2 && weights[len-1] < 12) {
    const uniqueWeights = [...new Set(weights)].sort((a, b) => a - b);
    if (uniqueWeights.length === len / 2 && uniqueWeights[uniqueWeights.length-1] - uniqueWeights[0] === uniqueWeights.length - 1)
      return { type: CARD_TYPES.PAIR_STRAIGHT, weight: uniqueWeights[0] };
  }

  // 8. 飞机 (2连三起)
  if (len >= 6 && maxCount === 3) {
    const triples = countEntries.filter(e => e[1] === 3).map(e => parseInt(e[0])).sort((a, b) => a - b);
    // 检查三张是否连续
    const isContinuous = (arr) => {
      for(let i=1; i<arr.length; i++) if(arr[i] - arr[i-1] !== 1 || arr[i] >= 12) return false;
      return true;
    };

    if (triples.length >= 2 && isContinuous(triples)) {
      if (len === triples.length * 3) return { type: CARD_TYPES.AIRPLANE, weight: triples[0] };
      if (len === triples.length * 4) return { type: CARD_TYPES.AIRPLANE_SINGLE, weight: triples[0] };
      if (len === triples.length * 5 && countEntries.filter(e => e[1] === 2).length === triples.length) 
        return { type: CARD_TYPES.AIRPLANE_PAIR, weight: triples[0] };
    }
  }

  // 9. 四带二
  if (len === 6 && maxCount === 4) return { type: CARD_TYPES.QUAD_SINGLE, weight: parseInt(countEntries[0][0]) };
  if (len === 8 && maxCount === 4 && countEntries[1][1] === 2 && countEntries[2][1] === 2) 
    return { type: CARD_TYPES.QUAD_PAIR, weight: parseInt(countEntries[0][0]) };

  return { type: CARD_TYPES.INVALID, weight: -1 };
};

export const validateCards = getType;

export const canBeat = (newCards, prevCards, isLandlord, role) => {
  const newInfo = getType(newCards);
  if (newInfo.type === CARD_TYPES.INVALID) return false;
  if (!prevCards || prevCards.length === 0) return true;

  const prevInfo = getType(prevCards);
  
  if (newInfo.type === CARD_TYPES.ROCKET) return true;
  if (prevInfo.type === CARD_TYPES.ROCKET) return false;

  if (newInfo.type === CARD_TYPES.BOMB) {
    if (prevInfo.type !== CARD_TYPES.BOMB) return true;
    return newInfo.weight > prevInfo.weight;
  }

  if (newInfo.type === prevInfo.type && newCards.length === prevCards.length) {
    return newInfo.weight > prevInfo.weight;
  }

  return false;
};

export const canPlay = canBeat;
