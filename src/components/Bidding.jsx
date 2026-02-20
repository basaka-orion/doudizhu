import React from 'react'

const Bidding = ({ bidInfo, onBid, isTurn, players }) => {
  const bids = [
    { value: 0, label: '不叫', color: 'bg-slate-600 hover:bg-slate-500' },
    { value: 1, label: '1分', color: 'bg-emerald-600 hover:bg-emerald-500' },
    { value: 2, label: '2分', color: 'bg-blue-600 hover:bg-blue-500' },
    { value: 3, label: '3分', color: 'bg-rose-600 hover:bg-rose-500' },
  ]

  const maxBid = Math.max(...bidInfo.bids)

  return (
    <div className="flex flex-col items-center gap-10 animate-in zoom-in duration-300">
      <div className="text-center">
        <h2 className="text-5xl font-black text-white mb-2 italic tracking-widest drop-shadow-lg">
          抢地主
        </h2>
        <p className="text-yellow-400 font-bold uppercase tracking-widest text-sm">
          谁才是真正的地主？
        </p>
      </div>

      <div className="flex gap-4">
        {isTurn ? (
          bids.map((bid) => {
            const isDisabled = bid.value !== 0 && bid.value <= maxBid
            return (
              <button
                key={bid.value}
                disabled={isDisabled}
                onClick={() => onBid(bid.value)}
                className={`
                  ${bid.color} ${isDisabled ? 'opacity-30 cursor-not-allowed scale-90' : 'hover:scale-105 active:scale-95 shadow-2xl'}
                  text-white px-8 py-4 rounded-2xl font-black text-xl transition-all border-b-4 border-black/40
                `}
              >
                {bid.label}
              </button>
            )
          })
        ) : (
          <div className="flex flex-col items-center">
             <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-white font-bold text-xl animate-pulse">正在等待对手叫分...</p>
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {bidInfo.bids.map((b, i) => (
          <div key={i} className="flex flex-col items-center bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
            <span className="text-white/50 text-xs mb-1">
              {i === 0 ? '你' : i === 1 ? '电脑左' : '电脑右'}
            </span>
            <span className="text-yellow-400 font-black text-2xl">
              {b === 0 ? '-' : b + '分'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Bidding
