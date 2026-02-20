import React, { useState, useEffect } from 'react'
import Card from './Card'
import CardHand from './CardHand'
import PlayArea from './PlayArea'
import Bidding from './Bidding'
import GameResult from './GameResult'
import { GAME_PHASE, PLAYER_ROLE } from '../game/gameEngine'
import { validateCards, canBeat } from '../game/validator'

const GameBoard = ({ state, onPlayerBid, onPlayerPlay, onRestart }) => {
  const [selectedCards, setSelectedCards] = useState([])
  
  if (!state || !state.players) return null

  const { phase, players, landlord, currentPlayer, lastCards, lastPlayer,
    landlordCards, bidInfo, playArea, winner, winnerReason, multiplier } = state

  const isPlayerTurn = currentPlayer === 0 && phase === GAME_PHASE.PLAYING

  const handleCardSelect = (cards) => {
    setSelectedCards(cards)
  }

  const handlePlay = () => {
    if (selectedCards.length === 0) return
    const validation = validateCards(selectedCards)
    if (!validation.valid) return alert('牌型不合法哦！')

    if (lastCards && lastCards.length > 0) {
      if (!canBeat(selectedCards, lastCards, landlord === PLAYER_ROLE.PLAYER, PLAYER_ROLE.PLAYER)) {
        return alert('压不住对手的牌～')
      }
    }

    onPlayerPlay(selectedCards)
    setSelectedCards([])
  }

  const handlePass = () => {
    onPlayerPlay([])
    setSelectedCards([])
  }

  // 渲染头像
  const renderAvatar = (idx) => {
    const player = players[idx]
    if (!player) return null
    const isActive = currentPlayer === idx && phase !== GAME_PHASE.GAME_OVER
    const isLandlord = landlord === player.role

    return (
      <div className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-80'}`}>
        <div className={`relative w-16 h-16 rounded-full border-4 shadow-lg overflow-hidden
          ${isActive ? 'border-yellow-400 ring-4 ring-yellow-400/50' : 'border-white/50'}
          ${isLandlord ? 'bg-orange-100' : 'bg-blue-100'}`}>
          <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
          {isLandlord && (
            <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] px-1 font-bold">地主</div>
          )}
        </div>
        <div className="mt-2 bg-black/60 px-2 py-0.5 rounded text-white text-xs font-medium">
          {player.name}
        </div>
        <div className="text-yellow-400 text-[10px] font-bold mt-1">
          积分: {player.score}
        </div>
        {player.isAI && (
          <div className="text-white/50 text-[10px] italic">难度: {player.difficulty}</div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col items-center justify-between p-4"
      style={{
        background: 'radial-gradient(circle at center, #1a4d2e 0%, #0d2b1a 100%)',
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)'
      }}
    >
      {/* 顶部状态 */}
      <div className="w-full flex justify-between items-start z-10">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex gap-4 text-white text-sm shadow-2xl">
          <span className="text-yellow-400 font-bold">倍数: {multiplier}</span>
          <span className="opacity-60">
            {phase === GAME_PHASE.BIDDING ? '等待发底牌' : `地主: ${landlord === PLAYER_ROLE.PLAYER ? '你' : '电脑'}`}
          </span>
        </div>
        
        <div className="flex gap-2">
          {landlordCards && landlordCards.map((card, idx) => (
            <Card key={idx} card={card} size="sm" isBack={phase === GAME_PHASE.BIDDING} />
          ))}
        </div>

        <button onClick={onRestart} className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full text-xs transition-colors border border-white/20">
          重新开始
        </button>
      </div>

      {/* 游戏主体 */}
      <div className="w-full flex-1 relative flex items-center justify-center">
        {/* 左侧玩家 */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          {renderAvatar(1)}
          <div className="mt-4 flex flex-col items-center">
            <div className="text-white text-[10px] mb-1 opacity-60">手牌: {players[1].hand.length}</div>
            <div className="flex -space-y-10 flex-col">
              {Array(Math.min(players[1].hand.length, 6)).fill(0).map((_, i) => (
                <div key={i} className="w-8 h-4 bg-blue-800 border border-white/20 rounded shadow-sm"></div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧玩家 */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          {renderAvatar(2)}
          <div className="mt-4 flex flex-col items-center">
            <div className="text-white text-[10px] mb-1 opacity-60">手牌: {players[2].hand.length}</div>
            <div className="flex -space-y-10 flex-col">
              {Array(Math.min(players[2].hand.length, 6)).fill(0).map((_, i) => (
                <div key={i} className="w-8 h-4 bg-blue-800 border border-white/20 rounded shadow-sm"></div>
              ))}
            </div>
          </div>
        </div>

        {/* 出牌显示区 */}
        <PlayArea
          playArea={playArea}
          lastCards={lastCards}
          lastPlayer={lastPlayer}
          currentPlayer={currentPlayer}
        />
      </div>

      {/* 底部控制区 */}
      <div className="w-full flex flex-col items-center gap-6 z-10">
        {/* 玩家提示 */}
        {isPlayerTurn && (
          <div className="flex gap-4 animate-in slide-in-from-bottom-4 duration-300">
            <button onClick={handlePass} className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-2 rounded-full font-bold shadow-lg border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all">
              不出
            </button>
            <button onClick={handlePlay} disabled={selectedCards.length === 0}
              className={`${selectedCards.length > 0 ? 'bg-orange-500 hover:bg-orange-400 border-orange-700' : 'bg-slate-500 cursor-not-allowed border-slate-700'} 
              text-white px-12 py-2 rounded-full font-bold shadow-lg border-b-4 active:border-b-0 active:translate-y-1 transition-all`}>
              出牌
            </button>
          </div>
        )}

        {/* 玩家手牌 */}
        <div className="relative w-full max-w-4xl pb-4">
          <div className="absolute -top-16 left-0">{renderAvatar(0)}</div>
          <CardHand
            cards={players[0].hand}
            selectedCards={selectedCards}
            onCardClick={handleCardSelect}
            selectable={isPlayerTurn}
            isPlayer={true}
          />
        </div>
      </div>

      {/* 浮动面板 */}
      {phase === GAME_PHASE.BIDDING && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <Bidding
            bidInfo={bidInfo}
            onBid={onPlayerBid}
            isTurn={currentPlayer === 0}
            players={players}
          />
        </div>
      )}

      {phase === GAME_PHASE.GAME_OVER && (
        <GameResult
          winner={winner}
          winnerReason={winnerReason}
          players={players}
          onRestart={onRestart}
        />
      )}
    </div>
  )
}

export default GameBoard
