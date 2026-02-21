// src/components/GameBoard.jsx
import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createInitialState, deal, playerBid, playerPlayCards, processAIBid, processAIAction, GAME_PHASE, PLAYER_ROLE } from '../game/gameEngine'
import CardHand from './CardHand'
import Bidding from './Bidding'
import PlayArea from './PlayArea'
import GameResult from './GameResult'

const GameBoard = () => {
  const [state, setState] = useState(null)
  const [selectedCards, setSelectedCards] = useState([])
  const [userAvatar, setUserAvatar] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix')

  // Initialize
  useEffect(() => {
    const s = createInitialState(userAvatar)
    setState(s)
  }, [userAvatar])

  // AI Behaviors
  useEffect(() => {
    if (!state || state.phase === GAME_PHASE.GAME_OVER || state.phase === GAME_PHASE.LOBBY) return

    const currentPlayer = state.players[state.currentPlayer]
    
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

    if (state.phase === GAME_PHASE.PLAYING && currentPlayer.isAI) {
      const timer = setTimeout(async () => {
        const newState = await processAIAction(state)
        setState(newState)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [state])

  if (!state) return null

  const handleStartGame = () => {
    setState(deal(state))
  }

  const onBid = (bid) => setState(playerBid(state, bid))

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

  const PlayerInfo = ({ player, position }) => (
    <div className={`flex flex-col items-center gap-2 ${position === 'left' ? 'ml-10' : position === 'right' ? 'mr-10' : ''}`}>
      <div className="relative">
        <motion.img 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          src={player.avatar} 
          className={`w-20 h-20 rounded-full border-4 ${state.currentPlayer === player.id ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)]' : 'border-stone-800'} transition-all`}
        />
        {state.landlord === player.role && (
          <div className="absolute -top-2 -right-2 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded shadow-lg">BOSS</div>
        )}
        <AnimatePresence>
          {player.message && (
            <motion.div 
              initial={{ scale: 0, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: -40 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-stone-900 px-4 py-2 rounded-2xl text-xs font-bold shadow-2xl border-2 border-amber-500 z-50"
            >
              {player.message}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-amber-500/80 font-mono text-[10px] uppercase tracking-tighter">{player.name}</span>
        <span className="text-white font-black text-lg">{player.hand.length} <span className="text-[10px] text-stone-500">CARDS</span></span>
      </div>
      {player.lastAction && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-900/40 px-3 py-1 rounded text-[10px] font-black text-amber-400 uppercase border border-amber-900/50"
        >
          {player.lastAction}
        </motion.div>
      )}
    </div>
  )

  return (
    <div className="relative w-full h-screen bg-[#0c0a09] overflow-hidden flex flex-col font-serif select-none">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d4a017 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      {/* Header */}
      <div className="h-16 bg-black/60 border-b border-amber-900/30 flex items-center justify-between px-10 z-30 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <h1 className="text-amber-600 font-black italic tracking-tighter text-xl">DOUDIZHU ROYAL</h1>
          <div className="h-6 w-px bg-white/10"></div>
          <div className="flex flex-col leading-none">
            <span className="text-stone-500 text-[8px] uppercase font-bold">Current Stakes</span>
            <span className="text-amber-500 font-black text-lg">x{state.multiplier * (state.landlord ? 2 : 1)}</span>
          </div>
        </div>
        
        <div className="flex gap-1.5 p-1 bg-black/40 rounded-lg border border-white/5">
          {state.phase !== GAME_PHASE.BIDDING && state.phase !== GAME_PHASE.LOBBY ? (
            state.landlordCards.map((c, i) => (
              <div key={i} className="w-8 h-11 bg-white rounded border border-amber-600 flex items-center justify-center text-[10px] font-bold" style={{ color: c.color === 'red' ? '#ef4444' : '#171717'}}>
                {c.rank}
              </div>
            ))
          ) : (
             <div className="flex gap-1.5">
               {[1,2,3].map(i => <div key={i} className="w-8 h-11 bg-amber-900/10 rounded border border-amber-900/20" />)}
             </div>
          )}
        </div>

        <div className="flex items-center gap-4">
           <button className="text-stone-500 hover:text-amber-500 transition-colors">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
           </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {state.phase === GAME_PHASE.LOBBY ? (
            <motion.div 
              key="lobby"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#1a140f] to-[#0c0a09] z-40"
            >
              <div className="p-16 border-8 border-double border-amber-900/40 bg-stone-900 rounded-[3rem] text-center space-y-10 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                <h2 className="text-6xl font-black text-amber-500 uppercase tracking-tighter italic" style={{ textShadow: '6px 6px 0px #3e2723' }}>Select Avatar</h2>
                <div className="flex gap-6">
                  {['Felix', 'Aneka', 'Milo', 'Luna', 'Oscar'].map(name => {
                    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
                    return (
                      <motion.img 
                        key={name}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setUserAvatar(url)}
                        src={url} 
                        className={`w-24 h-24 rounded-full cursor-pointer border-4 transition-all ${userAvatar === url ? 'border-amber-400 ring-4 ring-amber-400/20' : 'border-transparent hover:border-white/20'}`}
                      />
                    )
                  })}
                </div>
                <button
                  onClick={handleStartGame}
                  className="w-full py-6 bg-amber-600 hover:bg-amber-500 text-stone-100 transition-all border-b-8 border-amber-800 active:border-b-0 active:translate-y-2 uppercase font-black text-3xl tracking-widest rounded-2xl shadow-2xl"
                >
                  Enter Arena
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full w-full">
              {/* Opponents */}
              <div className="absolute left-10 top-1/2 -translate-y-1/2">
                <PlayerInfo player={state.players[1]} position="left" />
                <div className="mt-10">
                  <PlayArea cards={state.playArea[PLAYER_ROLE.LEFT_AI]} />
                </div>
              </div>

              <div className="absolute right-10 top-1/2 -translate-y-1/2">
                <PlayerInfo player={state.players[2]} position="right" />
                <div className="mt-10">
                  <PlayArea cards={state.playArea[PLAYER_ROLE.RIGHT_AI]} />
                </div>
              </div>

              {/* Center Play Zone */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {state.phase === GAME_PHASE.BIDDING && (
                  <div className="pointer-events-auto">
                    <Bidding 
                      currentMaxBid={Math.max(...state.bidInfo.bids)} 
                      isPlayerTurn={state.bidInfo.currentBidder === 0}
                      onBid={onBid} 
                    />
                  </div>
                )}

                {state.phase === GAME_PHASE.PLAYING && (
                  <div className="flex flex-col items-center gap-12">
                    <PlayArea cards={state.playArea[PLAYER_ROLE.PLAYER]} isLandlord={state.landlord === PLAYER_ROLE.PLAYER} />
                    
                    {state.currentPlayer === 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-6 pointer-events-auto"
                      >
                        <button onClick={onPass} className="px-12 py-4 bg-stone-800 hover:bg-stone-700 text-stone-100 font-black rounded-2xl border-b-4 border-black active:border-b-0 active:translate-y-1 transition-all uppercase tracking-widest shadow-xl">Pass</button>
                        <button onClick={() => setSelectedCards([])} className="px-12 py-4 bg-amber-950/20 hover:bg-amber-950/40 text-amber-200 font-black rounded-2xl border border-amber-900/50 active:scale-95 transition-all uppercase tracking-widest shadow-xl">Reset</button>
                        <button 
                          onClick={onPlay} 
                          disabled={selectedCards.length === 0}
                          className="px-16 py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-30 disabled:pointer-events-none text-white font-black rounded-2xl border-b-4 border-amber-800 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-widest shadow-[0_0_30px_rgba(217,119,6,0.3)]"
                        >
                          Strike
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer: Hand */}
      <div className="h-72 bg-gradient-to-t from-black/90 to-transparent relative z-20">
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-6 p-4 bg-stone-900/80 rounded-full border border-white/5 backdrop-blur-xl shadow-2xl">
           <img src={state.players[0].avatar} className={`w-14 h-14 rounded-full border-4 ${state.currentPlayer === 0 ? 'border-amber-400 animate-pulse' : 'border-stone-800'}`} />
           <div className="flex flex-col pr-4">
             <span className="text-amber-500 font-black tracking-widest text-xl italic uppercase">
               {state.players[0].name}
             </span>
             <span className="text-stone-500 text-[10px] font-bold font-mono">RANK: ROYAL ENFORCER</span>
           </div>
        </div>
        <CardHand 
          cards={state.players[0].hand} 
          selectedCards={selectedCards} 
          onCardClick={setSelectedCards} 
          isPlayer={true} 
          selectable={state.phase === GAME_PHASE.PLAYING && state.currentPlayer === 0}
        />
      </div>

      {state.phase === GAME_PHASE.GAME_OVER && (
        <GameResult 
          winner={state.winner} 
          reason={state.winnerReason} 
          onRestart={() => {
            setUserAvatar(userAvatar); // Refresh state
            handleStartGame();
          }} 
        />
      )}

      {/* SFX Warning */}
      <div className="absolute bottom-4 right-4 text-[8px] text-stone-700 font-bold uppercase tracking-[0.3em]">
        Audio Engine Active // High Fidelity Mode
      </div>
    </div>
  )
}

export default GameBoard
