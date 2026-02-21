// src/game/cards.js
export const SUITS = {
  SPADES: { symbol: '♠', color: 'black', weight: 4 },
  HEARTS: { symbol: '♥', color: 'red', weight: 3 },
  CLUBS: { symbol: '♣', color: 'black', weight: 2 },
  DIAMONDS: { symbol: '♦', color: 'red', weight: 1 },
};

export const RANKS = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
export const JOKERS = [
  { rank: 'SJ', suit: 'JOKER', weight: 52, name: '小王' },
  { rank: 'BJ', suit: 'JOKER', weight: 53, name: '大王' }
];

export const createDeck = () => {
  const deck = [];
  let weight = 0;
  for (const rank of RANKS) {
    for (const suitKey in SUITS) {
      deck.push({
        id: `${rank}-${suitKey}`,
        rank,
        suit: SUITS[suitKey].symbol,
        color: SUITS[suitKey].color,
        weight: weight + (SUITS[suitKey].weight * 0.1),
        rankWeight: weight
      });
    }
    weight++;
  }
  return [...deck, ...JOKERS.map(j => ({ 
    id: j.rank, 
    rank: j.name, 
    suit: '🃏', 
    color: j.rank === 'BJ' ? 'red' : 'black', 
    weight: j.weight,
    rankWeight: j.weight 
  }))];
};

export const sortCards = (cards) => {
  return [...cards].sort((a, b) => b.weight - a.weight);
};
