// src/game/gameEngine.js
import { createDeck, shuffleDeck, dealCards, sortHand } from './cards'
import { validateCards, canBeat, CARD_TYPES } from './validator'
import { aiPlay, aiBid } from './ai'
import { audioEngine } from './audio'

export const GAME_PHASE = {
  LOBBY: 'lobby',
  DEALING: 'dealing',
  BIDDING: 'bidding',
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
}

export const PLAYER_ROLE = {
  PLAYER: 'player',
  LEFT_AI: 'left',
  RIGHT_AI: 'right',
}

const TRASH_TALK = [
  "快点啊，等到花儿都谢了！",
  "你的牌打得也太好了吧！",
  "大你！不要走！",
  "你是地主还是我是地主？",
  "这牌也能赢？我不信！",
  "炸弹！感受痛苦吧！",
  "配合一下，队友！",
  "稳住，我们能赢。",
  "这就是大师级的操作吗？",
  "你要不起？我要！"
];

export function createInitialState(userAvatar = null) {
  const avatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Oscar'
  ];

  return {
    phase: GAME_PHASE.LOBBY,
    players: [
      { 
        id: 0, 
        role: PLAYER_ROLE.PLAYER, 
        hand: [], 
        name: 'You', 
        isAI: false, 
        avatar: userAvatar || avatars[0],
        score: 0,
        lastAction: '',
        message: ''
      },
      { 
        id: 1, 
        role: PLAYER_ROLE.LEFT_AI, 
        hand: [], 
        name: 'Master AI', 
        isAI: true, 
        avatar: avatars[1],
        score: 0,
        lastAction: '',
        message: ''
      },
      { 
        id: 2, 
        role: PLAYER_ROLE.RIGHT_AI, 
        hand: [], 
        name: 'Cyber Expert', 
        isAI: true, 
        avatar: avatars[2],
        score: 0,
        lastAction: '',
        message: ''
      },
    ],
    landlord: null,
    landlordCards: [],
    currentPlayer: 0,
    lastCards: null,
    lastPlayer: null,
    playArea: { [PLAYER_ROLE.PLAYER]: [], [PLAYER_ROLE.LEFT_AI]: [], [PLAYER_ROLE.RIGHT_AI]: [] },
    passCount: 0,
    bidInfo: { currentBidder: 0, bids: [0, 0, 0], finished: false },
    winner: null,
    winnerReason: '',
    multiplier: 1,
    baseScore: 100
  }
}

export function deal(state) {
  audioEngine.play('DEAL');
  const deck = createDeck()
  const shuffled = shuffleDeck(deck)
  const { player1, player2, player3, landlordCards } = dealCards(shuffled)

  return {
    ...state,
    phase: GAME_PHASE.BIDDING,
    players: state.players.map((p, i) => ({
      ...p,
      hand: sortHand([player1, player2, player3][i]),
      lastAction: '',
      message: ''
    })),
    landlordCards,
    bidInfo: {
      currentBidder: Math.floor(Math.random() * 3),
      bids: [0, 0, 0],
      finished: false,
    },
    lastCards: null,
    lastPlayer: null,
    passCount: 0,
    multiplier: 1,
    playArea: { [PLAYER_ROLE.PLAYER]: [], [PLAYER_ROLE.LEFT_AI]: [], [PLAYER_ROLE.RIGHT_AI]: [] },
  }
}

export function playerBid(state, bid) {
  audioEngine.play('BID');
  const { bidInfo } = state
  const newBids = [...bidInfo.bids]
  newBids[bidInfo.currentBidder] = bid

  const currentIdx = bidInfo.currentBidder
  const nextIdx = (currentIdx + 1) % 3
  
  const allBidded = newBids.filter(b => b !== 0).length + newBids.filter(b => b === 0).length >= 3
  const finished = bid === 3 || (allBidded && Math.max(...newBids) > 0);

  // Update last action for UI display
  const players = state.players.map((p, i) => 
    i === currentIdx ? { ...p, lastAction: bid === 0 ? '不叫' : `${bid}分` } : p
  );

  if (finished) {
    const maxBid = Math.max(...newBids)
    if (maxBid === 0) return deal(state)

    const landlordIdx = newBids.lastIndexOf(maxBid)
    const landlord = state.players[landlordIdx].role

    return {
      ...state,
      phase: GAME_PHASE.PLAYING,
      players: players.map((p, i) => ({
        ...p,
        hand: i === landlordIdx ? sortHand([...p.hand, ...state.landlordCards]) : p.hand,
        lastAction: i === landlordIdx ? '地主' : p.lastAction
      })),
      landlord,
      currentPlayer: landlordIdx,
      multiplier: maxBid,
      bidInfo: { ...bidInfo, bids: newBids, finished: true }
    }
  }

  return {
    ...state,
    players,
    bidInfo: { ...bidInfo, bids: newBids, currentBidder: nextIdx }
  }
}

export async function processAIBid(state) {
  const aiIdx = state.bidInfo.currentBidder
  if (!state.players[aiIdx]?.isAI) return state
  const bid = await aiBid(state.players[aiIdx].hand, aiIdx, Math.max(...state.bidInfo.bids))
  return playerBid(state, bid)
}

export function playerPlayCards(state, cards) {
  if (state.currentPlayer !== 0 || state.phase !== GAME_PHASE.PLAYING) return state
  if (!cards || cards.length === 0) return handlePass(state, 0)

  const validation = validateCards(cards)
  if (validation.type === CARD_TYPES.INVALID) return state

  if (state.lastCards && state.lastCards.length > 0) {
    if (!canBeat(cards, state.lastCards)) return state
  }

  audioEngine.play(validation.type === CARD_TYPES.BOMB || validation.type === CARD_TYPES.ROCKET ? 'BOMB' : 'PLAY');

  const player = state.players[0]
  const newHand = player.hand.filter(c => !cards.some(sc => sc.id === c.id))

  let newMultiplier = state.multiplier
  if (validation.type === CARD_TYPES.BOMB || validation.type === CARD_TYPES.ROCKET) newMultiplier *= 2

  const newState = {
    ...state,
    players: state.players.map((p, i) => i === 0 ? { ...p, hand: newHand, lastAction: '出牌' } : p),
    lastCards: cards,
    lastPlayer: PLAYER_ROLE.PLAYER,
    playArea: { ...state.playArea, [PLAYER_ROLE.PLAYER]: cards, [PLAYER_ROLE.LEFT_AI]: [], [PLAYER_ROLE.RIGHT_AI]: [] },
    passCount: 0,
    currentPlayer: 1,
    multiplier: newMultiplier
  }

  return checkGameOver(newState)
}

function handlePass(state, playerIdx) {
  audioEngine.play('PASS');
  const nextIdx = (playerIdx + 1) % 3
  const newPassCount = state.passCount + 1
  
  const players = state.players.map((p, i) => i === playerIdx ? { ...p, lastAction: '过' } : p);
  const newPlayArea = { ...state.playArea, [state.players[playerIdx].role]: [] }

  if (newPassCount >= 2) {
    return {
      ...state,
      players,
      currentPlayer: nextIdx,
      lastCards: null,
      lastPlayer: null,
      passCount: 0,
      playArea: { [PLAYER_ROLE.PLAYER]: [], [PLAYER_ROLE.LEFT_AI]: [], [PLAYER_ROLE.RIGHT_AI]: [] }
    }
  }

  return {
    ...state,
    players,
    currentPlayer: nextIdx,
    passCount: newPassCount,
    playArea: newPlayArea
  }
}

export async function processAIAction(state) {
  const { currentPlayer, players, lastCards, landlord } = state
  if (currentPlayer === 0 || state.phase !== GAME_PHASE.PLAYING) return state

  const player = players[currentPlayer]
  const cards = await aiPlay(player.hand, lastCards, player.role, {
    landlord,
    players: players.map(p => ({ role: p.role, hand: p.hand })),
  })

  // Random trash talk
  let updatedPlayers = [...state.players];
  if (Math.random() > 0.8) {
    updatedPlayers[currentPlayer] = { ...player, message: TRASH_TALK[Math.floor(Math.random() * TRASH_TALK.length)] };
    // Clear message after 3 seconds
    setTimeout(() => {
       // Note: This logic depends on state being external or using a functional update in UI
    }, 3000);
  }

  if (!cards || cards.length === 0) return handlePass({ ...state, players: updatedPlayers }, currentPlayer)

  const validation = validateCards(cards)
  const newHand = player.hand.filter(c => !cards.some(sc => sc.id === c.id))
  
  audioEngine.play(validation.type === CARD_TYPES.BOMB || validation.type === CARD_TYPES.ROCKET ? 'BOMB' : 'PLAY');

  let newMultiplier = state.multiplier
  if (validation.type === CARD_TYPES.BOMB || validation.type === CARD_TYPES.ROCKET) newMultiplier *= 2

  const nextIdx = (currentPlayer + 1) % 3
  const newState = {
    ...state,
    players: updatedPlayers.map((p, i) => i === currentPlayer ? { ...p, hand: newHand, lastAction: '出牌' } : p),
    lastCards: cards,
    lastPlayer: player.role,
    playArea: { ...state.playArea, [player.role]: cards },
    passCount: 0,
    currentPlayer: nextIdx,
    multiplier: newMultiplier
  }

  return checkGameOver(newState)
}

export function checkGameOver(state) {
  const winnerIdx = state.players.findIndex(p => p.hand.length === 0)
  if (winnerIdx === -1) return state

  const winner = state.players[winnerIdx].role
  const isLandlordWin = winner === state.landlord
  const finalScore = state.baseScore * state.multiplier

  audioEngine.play(winner === PLAYER_ROLE.PLAYER || (!isLandlordWin && state.landlord !== PLAYER_ROLE.PLAYER) ? 'WIN' : 'LOSE');

  return {
    ...state,
    phase: GAME_PHASE.GAME_OVER,
    winner,
    winnerReason: isLandlordWin ? 'Landlord Dominates!' : 'Farmers Revolted!',
    players: state.players.map(p => {
      let scoreChange = 0
      if (isLandlordWin) {
        scoreChange = p.role === state.landlord ? finalScore * 2 : -finalScore
      } else {
        scoreChange = p.role === state.landlord ? -finalScore * 2 : finalScore
      }
      return { ...p, score: p.score + scoreChange, lastAction: p.hand.length === 0 ? 'WIN' : '' }
    })
  }
}
