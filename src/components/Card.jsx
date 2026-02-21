import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ card, selected, onClick, disabled, isBack, isHidden, size = 'md', index = 0, total = 1 }) => {
  const sizeClasses = {
    sm: 'w-10 h-14 text-[10px]',
    md: 'w-20 h-32 text-base',
    lg: 'w-24 h-36 text-xl'
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;
  
  // 计算扇形布局旋转角度
  const rotationPerCard = total > 10 ? 4 : 6;
  const startRotation = -((total - 1) * rotationPerCard) / 2;
  const rotation = startRotation + index * rotationPerCard;
  
  // 根据角度微调 Y 位移
  const translateY = Math.abs(rotation) * 0.8;

  if (isBack) {
    return (
      <motion.div
        layout
        className={`${currentSize} rounded-xl border-2 border-amber-100 bg-blue-800 shadow-lg relative overflow-hidden`}
        style={{
          backgroundImage: 'radial-gradient(circle at center, #1e40af 0%, #172554 100%)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3), inset 0 0 30px rgba(255,255,255,0.1)'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="w-full h-full border-4 border-white/20 m-2 rounded-lg flex items-center justify-center rotate-45">
             <span className="text-4xl">⚓</span>
          </div>
        </div>
      </motion.div>
    );
  }

  const isRed = card.color === 'red';
  const colorClass = isRed ? 'text-red-600' : 'text-slate-900';

  return (
    <motion.div
      layout
      whileHover={!disabled ? { y: -30, scale: 1.05, zIndex: 50 } : {}}
      animate={{ 
        y: selected ? -40 : translateY, 
        rotate: rotation,
        zIndex: index 
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`${currentSize} rounded-xl bg-white shadow-md flex flex-col p-2 border border-slate-300
        ${disabled ? 'opacity-70 grayscale' : 'cursor-pointer'}
        relative select-none ring-1 ring-slate-200`}
      onClick={disabled ? null : onClick}
    >
      {/* 光泽效果 */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 rounded-xl pointer-events-none" />
      
      <div className={`flex flex-col items-start leading-none font-bold ${colorClass}`}>
        <span className="text-lg leading-tight">{card.rank}</span>
        <span className="text-sm mt-0.5">{card.suit}</span>
      </div>

      <div className={`flex-1 flex items-center justify-center ${colorClass}`}>
        <span className="text-5xl drop-shadow-sm">
          {card.suit}
        </span>
      </div>

      <div className={`flex flex-col items-end leading-none font-bold rotate-180 ${colorClass}`}>
        <span className="text-lg leading-tight">{card.rank}</span>
        <span className="text-sm mt-0.5">{card.suit}</span>
      </div>
    </motion.div>
  );
};

export default Card;
