// src/game/ai.js
import { getType, canBeat, CARD_TYPES } from './validator';

/**
 * AI 叫分逻辑
 */
export const aiBid = async (hand, playerIdx, currentMaxBid) => {
  // 模拟思考
  await new Promise(r => setTimeout(r, 1000));
  
  let score = 0;
  const weights = hand.map(c => c.rankWeight);
  
  // 大王 +2, 小王 +1.5, 2 +1
  if (weights.includes(53)) score += 2;
  if (weights.includes(52)) score += 1.5;
  const countOf2 = weights.filter(w => w === 12).length;
  score += countOf2 * 0.8;

  // 炸弹 +2
  const counts = {};
  weights.forEach(w => counts[w] = (counts[w] || 0) + 1);
  if (Object.values(counts).some(c => c === 4)) score += 2;

  let decision = 0;
  if (score >= 4) decision = 3;
  else if (score >= 2.5) decision = 2;
  else if (score >= 1.5) decision = 1;

  return decision > currentMaxBid ? decision : 0;
};

/**
 * AI 出牌逻辑
 */
export const aiPlay = async (hand, lastCards, role, context) => {
  await new Promise(r => setTimeout(r, 1200));

  const { landlord, players } = context;
  const isLandlord = role === landlord;

  // 辅助函数：查找所有可能的合法组合
  const getAllPossiblePlays = (myHand, targetCards) => {
    // 这是一个简化版，实际需要搜索所有排列组合
    // 这里我们只搜索 单张、对子、三张、炸弹
    const results = [];
    const weights = [...new Set(myHand.map(c => c.rankWeight))].sort((a, b) => a - b);
    const counts = {};
    myHand.forEach(c => counts[c.rankWeight] = (counts[c.rankWeight] || 0) + 1);

    const getCardsByWeight = (w, count) => myHand.filter(c => c.rankWeight === w).slice(0, count);

    // 搜索
    weights.forEach(w => {
      const c = counts[w];
      if (c >= 1) results.push(getCardsByWeight(w, 1));
      if (c >= 2) results.push(getCardsByWeight(w, 2));
      if (c >= 3) results.push(getCardsByWeight(w, 3));
      if (c === 4) results.push(getCardsByWeight(w, 4));
    });

    // 火箭
    if (weights.includes(52) && weights.includes(53)) {
      results.push(myHand.filter(c => c.rankWeight >= 52));
    }

    // 过滤出能压过的
    return results.filter(play => canBeat(play, targetCards, isLandlord, role));
  };

  // 1. 如果是首发
  if (!lastCards || lastCards.length === 0) {
    // 优先出最小的牌（尝试出对子或三张）
    const counts = {};
    hand.forEach(c => counts[c.rankWeight] = (counts[c.rankWeight] || 0) + 1);
    const sortedRanks = [...new Set(hand.map(c => c.rankWeight))].sort((a, b) => a - b);
    
    for (let r of sortedRanks) {
      if (counts[r] === 3) return hand.filter(c => c.rankWeight === r);
      if (counts[r] === 2) return hand.filter(c => c.rankWeight === r);
    }
    return [hand[hand.length - 1]]; // 最小单张 (hand 已排序)
  }

  // 2. 如果跟牌
  const possiblePlays = getAllPossiblePlays(hand, lastCards);
  if (possiblePlays.length === 0) return null;

  // 策略：如果是农民，不要压队友的大牌
  if (!isLandlord) {
    // 简单判断：如果上家也是农民且出的牌很大，就过
    // 这里需要 context.lastPlayerRole，简化处理：如果是小牌就压
    const lastType = getType(lastCards);
    if (lastType.weight > 10 && !isLandlord) { // 假设 weight > 10 是大牌
       // 随机概率过牌，模拟“防守”
       if (Math.random() > 0.7) return null;
    }
  }

  // 默认压最小能压过的
  possiblePlays.sort((a, b) => getType(a).weight - getType(b).weight);
  return possiblePlays[0];
};
