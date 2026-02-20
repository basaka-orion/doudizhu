// 游戏状态管理
import { createDeck, shuffleDeck, dealCards, sortHand } from './cards'
import { validateCards, canBeat } from './validator'
import { aiPlay, aiBid } from './ai'

// 游戏阶段
export const GAME_PHASE = {
  DEALING: 'dealing',       // 发牌阶段
  BIDDING: 'bidding',      // 叫地主阶段
  PLAYING: 'playing',      // 游戏进行阶段
  GAME_OVER: 'game_over',  // 游戏结束阶段
}

// 玩家角色
export const PLAYER_ROLE = {
  PLAYER: 'player',   // 真实玩家(底部)
  LEFT_AI: 'left',    // 左边AI
  RIGHT_AI: 'right',  // 右边AI
}

// 难度级别
export const DIFFICULTY = {
  EASY: '新手',
  MEDIUM: '精英',
  HARD: '大师'
}

// 初始游戏状态
export function createInitialState() {
  const difficulties = [DIFFICULTY.EASY, DIFFICULTY.MEDIUM, DIFFICULTY.HARD]
  return {
    phase: GAME_PHASE.DEALING,
    players: [
      { 
        id: 0, 
        role: PLAYER_ROLE.PLAYER, 
        hand: [], 
        name: '你', 
        isAI: false, 
        avatar: `https://api.multiavatar.com/player_${Math.random()}.svg`,
        score: 0
      },
      { 
        id: 1, 
        role: PLAYER_ROLE.LEFT_AI, 
        hand: [], 
        name: '电脑左', 
        isAI: true, 
        avatar: `https://api.multiavatar.com/ai_left_${Math.random()}.svg`,
        difficulty: difficulties[Math.floor(Math.random() * 3)],
        score: 0
      },
      { 
        id: 2, 
        role: PLAYER_ROLE.RIGHT_AI, 
        hand: [], 
        name: '电脑右', 
        isAI: true, 
        avatar: `https://api.multiavatar.com/ai_right_${Math.random()}.svg`,
        difficulty: difficulties[Math.floor(Math.random() * 3)],
        score: 0
      },
    ],
    landlord: null,           
    landlordCards: [],        
    currentPlayer: 0,          
    lastCards: null,           
    lastPlayer: null,          
    lastCardType: null,       
    playArea: {               
      [PLAYER_ROLE.PLAYER]: [],
      [PLAYER_ROLE.LEFT_AI]: [],
      [PLAYER_ROLE.RIGHT_AI]: [],
    },
    passCount: 0,             
    bidInfo: {                
      currentBidder: 0,       
      bids: [0, 0, 0],       
      finished: false,        
    },
    winner: null,             
    winnerReason: '',         
    message: '',              // 提示消息 (AI对话等)
    multiplier: 1,            // 倍数
  }
}

export function deal(state) {
  const deck = createDeck()
  const shuffled = shuffleDeck(deck)
  const { player1, player2, player3, landlordCards } = dealCards(shuffled)

  return {
    ...state,
    phase: GAME_PHASE.BIDDING,
    players: state.players.map((p, i) => ({
      ...p,
      hand: sortHand([player1, player2, player3][i]),
    })),
    landlordCards,
    bidInfo: {
      currentBidder: Math.floor(Math.random() * 3), // 随机谁先叫
      bids: [0, 0, 0],
      finished: false,
    },
    lastCards: null,
    lastPlayer: null,
    passCount: 0,
    playArea: {
      [PLAYER_ROLE.PLAYER]: [],
      [PLAYER_ROLE.LEFT_AI]: [],
      [PLAYER_ROLE.RIGHT_AI]: [],
    },
  }
}

export function playerBid(state, bid) {
  const { bidInfo } = state
  const newBids = [...bidInfo.bids]
  newBids[bidInfo.currentBidder] = bid

  const currentIdx = bidInfo.currentBidder
  let nextIdx = (currentIdx + 1) % 3
  
  // 检查是否结束叫地主
  const allBidded = newBids.filter(b => b !== 0).length + newBids.filter(b => b === 0).length >= 3
  const hasThree = bid === 3
  const finished = hasThree || (allBidded && Math.max(...newBids) > 0 && newBids[nextIdx] !== 0) || (newBids.every(b => b === 0) && allBidded)

  if (finished) {
    const maxBid = Math.max(...newBids)
    if (maxBid === 0) return deal(state) // 重新发牌

    const landlordIdx = newBids.lastIndexOf(maxBid)
    const landlord = state.players[landlordIdx].role

    return {
      ...state,
      phase: GAME_PHASE.PLAYING,
      players: state.players.map((p, i) => ({
        ...p,
        hand: i === landlordIdx ? sortHand([...p.hand, ...state.landlordCards]) : p.hand
      })),
      landlord,
      currentPlayer: landlordIdx,
      multiplier: maxBid,
      bidInfo: { ...bidInfo, bids: newBids, finished: true }
    }
  }

  return {
    ...state,
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
  if (!validation.valid) return state

  if (state.lastCards && state.lastCards.length > 0) {
    if (!canBeat(cards, state.lastCards, state.landlord === PLAYER_ROLE.PLAYER, PLAYER_ROLE.PLAYER)) {
      return state
    }
  }

  const player = state.players[0]
  const newHand = player.hand.filter(c => !cards.some(sc => sc.suit === c.suit && sc.rank === c.rank))

  let newMultiplier = state.multiplier
  if (validation.type === 'bomb' || validation.type === 'joker_bomb') newMultiplier *= 2

  const newState = {
    ...state,
    players: state.players.map((p, i) => i === 0 ? { ...p, hand: newHand } : p),
    lastCards: cards,
    lastPlayer: PLAYER_ROLE.PLAYER,
    lastCardType: validation.type,
    playArea: { ...state.playArea, [PLAYER_ROLE.PLAYER]: cards },
    passCount: 0,
    currentPlayer: getNextPlayer(state, 0),
    multiplier: newMultiplier
  }

  return checkGameOver(newState)
}

function handlePass(state, playerIdx) {
  const nextIdx = getNextPlayer(state, playerIdx)
  const newPassCount = state.passCount + 1
  
  // 清空出牌区
  const newPlayArea = { ...state.playArea, [state.players[playerIdx].role]: [] }

  if (newPassCount >= 2) {
    return {
      ...state,
      currentPlayer: nextIdx,
      lastCards: null,
      lastPlayer: null,
      passCount: 0,
      playArea: { ...newPlayArea, [state.players[nextIdx].role]: [] }
    }
  }

  return {
    ...state,
    currentPlayer: nextIdx,
    passCount: newPassCount,
    playArea: newPlayArea
  }
}

function getNextPlayer(state, currentIdx) {
  return (currentIdx + 1) % 3
}

export function checkGameOver(state) {
  const winnerIdx = state.players.findIndex(p => p.hand.length === 0)
  if (winnerIdx === -1) return state

  const winner = state.players[winnerIdx].role
  const isLandlordWin = winner === state.landlord
  const baseScore = 10 * state.multiplier

  return {
    ...state,
    phase: GAME_PHASE.GAME_OVER,
    winner,
    winnerReason: isLandlordWin ? '地主独霸一方！' : '农民起义成功！',
    players: state.players.map(p => {
      let scoreChange = 0
      if (isLandlordWin) {
        scoreChange = p.role === state.landlord ? baseScore * 2 : -baseScore
      } else {
        scoreChange = p.role === state.landlord ? -baseScore * 2 : baseScore
      }
      return { ...p, score: p.score + scoreChange }
    })
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

  if (!cards || cards.length === 0) return handlePass(state, currentPlayer)

  const validation = validateCards(cards)
  const newHand = player.hand.filter(c => !cards.some(sc => sc.suit === c.suit && sc.rank === c.rank))
  
  let newMultiplier = state.multiplier
  if (validation.type === 'bomb' || validation.type === 'joker_bomb') newMultiplier *= 2

  const newState = {
    ...state,
    players: state.players.map((p, i) => i === currentPlayer ? { ...p, hand: newHand } : p),
    lastCards: cards,
    lastPlayer: player.role,
    lastCardType: validation.type,
    playArea: { ...state.playArea, [player.role]: cards },
    passCount: 0,
    currentPlayer: getNextPlayer(state, currentPlayer),
    multiplier: newMultiplier
  }

  return checkGameOver(newState)
}

export function restartGame() {
  const state = createInitialState()
  return deal(state)
}
