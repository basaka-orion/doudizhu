// src/components/GameBoard.jsx
import React, { useEffect, useState, useCallback } from 'react'
import { createInitialState, deal, playerBid, playerPlayCards, processAIBid, processAIAction, GAME_PHASE, PLAYER_ROLE } from '../game/gameEngine'
import CardHand from './CardHand'
import Bidding from './Bidding'
import PlayArea from './PlayArea'
import GameResult from './GameResult'

const GameBoard = () => {
  const [state, setState] = useState(null)
  const [selectedCards, setSelectedCards] = useState([])
  const [autoPlayTimer, setAutoPlayTimer] = useState(null)

  // 初始化
  useEffect(() => {
    const s = createInitialState()
    setState(deal(s))
  }, [])

  // 处理 AI 行为
  useEffect(() => {
    if (!state || state.phase === GAME_PHASE.GAME_OVER) return

    const currentPlayer = state.players[state.currentPlayer]
    
    // AI 叫分
    if (state.phase === GAME_PHASE.BIDDING) {
      const bidder = state.players[state.bidInfo.currentBidder]
      if (bidder.isAI) {
        const timer = setTimeout(async () => {
          const newState = await processAIBid(state)
          setState(newState)
        }, 1500)
        return () => clearTimeout(timer)
      }
    }

    // AI 出牌
    if (state.phase === GAME_PHASE.PLAYING && currentPlayer.isAI) {
      const timer = setTimeout(async () => {
        const newState = await processAIAction(state)
        setState(newState)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [state])

  if (!state) return null

  const onBid = (bid) => {
    setState(playerBid(state, bid))
  }

  const onPlay = () => {
    const newState = playerPlayCards(state, selectedCards)
    if (newState !== state) {
      setState(newState)
      setSelectedCards([])
    }
  }

  const onPass = () => {
    const newState = playerPlayCards(state, [])
    setState(newState)
    setSelectedCards([])
  }

  const handleRestart = () => {
    const s = createInitialState()
    setState(deal(s))
    setSelectedCards([])
  }

  const player = state.players[0]
  const leftAI = state.players[1]
  const rightAI = state.players[2]

  return (
    <div className="relative w-full h-screen bg-[#1a140f] overflow-hidden flex flex-col font-sans">
      {/* 顶部：倍数和底牌 */}
      <div className="h-20 bg-black/40 border-b border-amber-900/30 flex items-center justify-between px-10 z-20">
        <div className="flex flex-col">
          <span className="text-stone-500 text-[10px] uppercase tracking-widest">Multiplier</span>
          <span className="text-amber-500 font-black text-2xl italic">x{state.multiplier * (state.landlord ? 2 : 1)}</span>
        </div>
        
        <div className="flex gap-2">
          {state.phase !== GAME_PHASE.BIDDING ? (
            state.landlordCards.map((c, i) => (
              <div key={i} className="w-10 h-14 bg-white rounded-sm border border-amber-600 flex items-center justify-center text-xs font-bold" style={{ color: c.color === 'red' ? 'red' : 'black'}}>
                {c.rank}
              </div>
            ))
          ) : (
             <div className="flex gap-2">
               {[1,2,3].map(i => <div key={i} className="w-10 h-14 bg-amber-900/20 rounded-sm border border-amber-900/40" />)}
             </div>
          )}
        </div>

        <div className="text-right">
          <span className="text-stone-500 text-[10px] uppercase tracking-widest">Phase</span>
          <div className="text-stone-300 font-bold uppercase">{state.phase}</div>
        </div>
      </div>

      {/* 游戏主体 */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* 左侧 AI */}
        <div className="absolute left-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
          <img src={leftAI.avatar} className="w-20 h-20 rounded-full border-4 border-stone-800 shadow-xl" />
          <div className="bg-black/60 px-3 py-1 rounded text-xs text-stone-400 font-mono">
            {leftAI.name} [{leftAI.hand.length}]
          </div>
          <PlayArea cards={state.playArea[PLAYER_ROLE.LEFT_AI]} isLandlord={state.landlord === PLAYER_ROLE.LEFT_AI} />
        </div>

        {/* 右侧 AI */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
          <img src={rightAI.avatar} className="w-20 h-20 rounded-full border-4 border-stone-800 shadow-xl" />
          <div className="bg-black/60 px-3 py-1 rounded text-xs text-stone-400 font-mono">
            {rightAI.name} [{rightAI.hand.length}]
          </div>
          <PlayArea cards={state.playArea[PLAYER_ROLE.RIGHT_AI]} isLandlord={state.landlord === PLAYER_ROLE.RIGHT_AI} />
        </div>

        {/* 中央操作区 */}
        <div className="flex flex-col items-center gap-10">
          {state.phase === GAME_PHASE.BIDDING && (
            <Bidding 
              currentMaxBid={Math.max(...state.bidInfo.bids)} 
              isPlayerTurn={state.bidInfo.currentBidder === 0}
              onBid={onBid} 
            />
          )}

          {state.phase === GAME_PHASE.PLAYING && (
            <>
              <PlayArea cards={state.playArea[PLAYER_ROLE.PLAYER]} isLandlord={state.landlord === PLAYER_ROLE.PLAYER} />
              
              {state.currentPlayer === 0 && (
                <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <button onClick={onPass} className="px-10 py-3 bg-stone-700 hover:bg-stone-600 text-stone-100 font-bold rounded-xl border-b-4 border-stone-900">Pass</button>
                  <button onClick={() => setSelectedCards([])} className="px-10 py-3 bg-amber-900/40 hover:bg-amber-800/40 text-amber-200 font-bold rounded-xl border border-amber-900/50">Reset</button>
                  <button onClick={onPlay} className="px-12 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl border-b-4 border-amber-800">Play Cards</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 底部：玩家手牌 */}
      <div className="h-64 bg-gradient-to-t from-black/80 to-transparent relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-4">
           <img src={player.avatar} className="w-16 h-16 rounded-full border-4 border-amber-600 shadow-2xl" />
           <div className="text-amber-500 font-bold tracking-tighter text-xl">
             {player.name} {state.landlord === PLAYER_ROLE.PLAYER && <span className="text-xs bg-amber-600 text-black px-2 py-0.5 rounded ml-2">LANDLORD</span>}
           </div>
        </div>
        <CardHand 
          cards={player.hand} 
          selectedCards={selectedCards} 
          onCardClick={setSelectedCards} 
          isPlayer={true} 
          selectable={state.phase === GAME_PHASE.PLAYING && state.currentPlayer === 0}
        />
      </div>

      {state.phase === GAME_PHASE.GAME_OVER && (
        <GameResult winner={state.winner} reason={state.winnerReason} onRestart={handleRestart} />
      )}
    </div>
  )
}

export default GameBoard
