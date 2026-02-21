// src/game/ai.js
import { canPlay, getType, CARD_TYPES } from './validator';

export const getBestPlay = (hand, prevCards) => {
  if (!prevCards || prevCards.length === 0) {
    // 尽量出长顺子或连对，没有就出最小的单张/对子
    return [hand[hand.length - 1]]; 
  }

  const prevInfo = getType(prevCards);
  const possible = [];

  // 暴力搜索简单的压制策略 (单张/对子)
  for (let i = hand.length - 1; i >= 0; i--) {
    // 尝试单张
    if (canPlay([hand[i]], prevCards)) {
       return [hand[i]];
    }
  }

  // 尝试炸弹作为保底
  // ... 此处逻辑简化，实际可更复杂
  
  return null; // 要不起
};
