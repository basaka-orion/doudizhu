import React from 'react'

const GameResult = ({ winner, winnerReason, players, onRestart }) => {
  const isPlayerWin = winner === 'player' || (winner !== 'landlord' && players[0].role !== 'landlord')
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] animate-in fade-in duration-500">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-yellow-500/50 rounded-3xl p-10 max-w-md w-full text-center shadow-[0_0_50px_rgba(234,179,8,0.3)]">
        <div className="text-6xl mb-4">{isPlayerWin ? '🎉' : '💀'}</div>
        <h2 className={`text-4xl font-black mb-2 ${isPlayerWin ? 'text-yellow-400' : 'text-gray-400'}`}>
          {isPlayerWin ? '你赢了！' : '遗憾落败'}
        </h2>
        <p className="text-white/60 mb-8">{winnerReason}</p>

        <div className="space-y-4 mb-10">
          {players.map((p, i) => (
            <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <img src={p.avatar} alt="" className="w-8 h-8 rounded-full" />
                <span className="text-white font-medium">{p.name}</span>
              </div>
              <span className={`font-bold ${p.score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {p.score >= 0 ? '+' : ''}{p.score} 积分
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onRestart}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95"
        >
          再来一局
        </button>
      </div>
    </div>
  )
}

export default GameResult
