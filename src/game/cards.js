// src/game/cards.js
export const SUITS = {
  SPADES: { symbol: '♠', color: 'black', weight: 4 },
  HEARTS: { symbol: '♥', color: 'red', weight: 3 },
  CLUBS: { symbol: '♣', color: 'black', weight: 2 },
  DIAMONDS: { symbol: '♦', color: 'red', weight: 1 },
};

export const RANKS = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];

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
  // Add Jokers
  deck.push({ id: 'SJ', rank: '小王', suit: '🃏', color: 'black', weight: 52, rankWeight: 52, isJoker: true });
  deck.push({ id: 'BJ', rank: '大王', suit: '🃏', color: 'red', weight: 53, rankWeight: 53, isJoker: true });
  return deck;
};

export const shuffleDeck = (deck) => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const dealCards = (shuffledDeck) => {
  return {
    player1: shuffledDeck.slice(0, 17),
    player2: shuffledDeck.slice(17, 34),
    player3: shuffledDeck.slice(34, 51),
    landlordCards: shuffledDeck.slice(51, 54)
  };
};

export const sortHand = (cards) => {
  return [...cards].sort((a, b) => b.weight - a.weight);
};

export const sortCards = sortHand;
