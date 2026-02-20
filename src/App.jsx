import React, { useState, useEffect, useCallback, useRef } from 'react'
import GameBoard from './components/GameBoard'
import { 
  createInitialState, 
  deal, 
  playerBid, 
  processAIBid, 
  playerPlayCards, 
  processAIAction, 
  GAME_PHASE 
} from './game/gameEngine'

function App() {
  const [state, setState] = useState(() => createInitialState())
  const [error, setError] = useState(null)
  const processingRef = useRef(false)

  // 错误捕获
  useEffect(() => {
    const handleError = (event) => {
      console.error('Captured error:', event.error)
      setError(event.error?.message || '未知运行错误')
    }
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  // 发牌
  useEffect(() => {
    if (state && state.phase === GAME_PHASE.DEALING) {
      const timer = setTimeout(() => {
        setState(s => deal(s))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [state?.phase])

  // 自动AI行为
  useEffect(() => {
    if (!state || state.phase === GAME_PHASE.GAME_OVER || processingRef.current) return

    const player = state.players ? state.players[state.currentPlayer] : null
    if (!player || !player.isAI) return

    const runAI = async () => {
      if (processingRef.current) return
      processingRef.current = true
      try {
        if (state.phase === GAME_PHASE.BIDDING) {
          const newState = await processAIBid(state)
          if (newState) setState(newState)
        } else if (state.phase === GAME_PHASE.PLAYING) {
          const newState = await processAIAction(state)
          if (newState) setState(newState)
        }
      } catch (err) {
        console.error('AI Process Error:', err)
      } finally {
        processingRef.current = false
      }
    }

    const timer = setTimeout(runAI, 800)
    return () => clearTimeout(timer)
  }, [state?.phase, state?.currentPlayer])

  const handleRestart = () => {
    setError(null)
    setState(createInitialState())
  }

  if (error) {
    return (
      <div className="w-screen h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-10 text-center">
        <div className="text-8xl mb-6">🚑</div>
        <h1 className="text-4xl font-black mb-4 text-rose-500">系统异常中断</h1>
        <p className="mb-8 opacity-50 font-mono text-sm bg-black/30 p-4 rounded-lg max-w-xl">
          Error: {error}
        </p>
        <div className="flex gap-4">
          <button onClick={handleRestart} className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-2xl font-bold shadow-xl transition-all">
            重置游戏状态
          </button>
          <button onClick={() => window.location.reload()} className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-2xl font-bold border border-white/20 transition-all">
            刷新页面
          </button>
        </div>
      </div>
    )
  }

  if (!state || !state.players) {
    return <div className="w-screen h-screen bg-slate-900 flex items-center justify-center text-white">初始化中...</div>
  }

  return (
    <div className="w-screen h-screen bg-slate-900 select-none overflow-hidden font-sans">
      <GameBoard 
        state={state}
        onPlayerBid={(bid) => setState(s => playerBid(s, bid))}
        onPlayerPlay={(cards) => setState(s => playerPlayCards(s, cards))}
        onRestart={handleRestart}
      />
    </div>
  )
}

export default App
