import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GameBoard = ({ children }) => {
  return (
    <div className="relative w-full h-screen bg-[#1a3a2a] overflow-hidden flex flex-col items-center justify-center p-4">
      {/* 木质边框 */}
      <div className="absolute inset-0 border-[16px] border-[#3d2b1f] pointer-events-none z-50 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]" />
      <div className="absolute inset-4 border-4 border-[#5d4037] pointer-events-none z-50" />

      {/* 牌桌纹理 */}
      <div className="absolute inset-0 bg-[#2d5a27]" 
        style={{
          backgroundImage: `radial-gradient(circle at center, #3a6d33 0%, #1a3a14 100%)`,
          opacity: 0.9
        }} 
      />
      
      {/* 中心装饰线 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] border border-white/5 rounded-full pointer-events-none" />

      {/* 内容层 */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {children}
      </div>

      {/* 炸弹/王炸全屏特效容器将挂载于此 */}
      <div id="fx-layer" className="absolute inset-0 pointer-events-none z-[100]" />
    </div>
  );
};

export default GameBoard;
