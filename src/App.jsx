import React, { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import Card from './components/Card';
import { createDeck, sortCards } from './game/cards';
import { audioEngine } from './game/audio';
import { canPlay, getType } from './game/validator';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const App = () => {
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [leftAIHand, setLeftAIHand] = useState([]);
  const [rightAIHand, setRightAIHand] = useState([]);
  const [tableCards, setTableCards] = useState([]);
  const [lastPlayer, setLastPlayer] = useState(null);
  const [turn, setTurn] = useState(0); // 0: Player, 1: Right AI, 2: Left AI
  const [selectedCards, setSelectedCards] = useState([]);
  const [gameState, setGameState] = useState('menu'); // menu, bidding, playing, result

  const initGame = () => {
    audioEngine.init();
    const newDeck = [...createDeck()].sort(() => Math.random() - 0.5);
    setPlayerHand(sortCards(newDeck.slice(0, 17)));
    setRightAIHand(newDeck.slice(17, 34));
    setLeftAIHand(newDeck.slice(34, 51));
    setTableCards([]);
    setGameState('playing');
    setTurn(0);
    audioEngine.playPlay();
  };

  const toggleSelect = (card) => {
    if (selectedCards.find(c => c.id === card.id)) {
      setSelectedCards(selectedCards.filter(c => c.id !== card.id));
    } else {
      setSelectedCards([...selectedCards, card]);
      audioEngine.playSelect();
    }
  };

  const handlePlay = () => {
    const playInfo = canPlay(selectedCards, lastPlayer !== 0 ? tableCards : []);
    if (playInfo) {
      setTableCards(selectedCards);
      setPlayerHand(playerHand.filter(c => !selectedCards.find(sc => sc.id === c.id)));
      setSelectedCards([]);
      setLastPlayer(0);
      setTurn(1);
      audioEngine.playPlay();
      if (playerHand.length === selectedCards.length) winEffect();
    }
  };

  const winEffect = () => {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    setGameState('result');
  };

  return (
    <GameBoard>
      {gameState === 'menu' ? (
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-7xl font-black text-amber-500 drop-shadow-[0_5px_0_rgba(180,83,9,1)] italic">斗地主·至尊</h1>
          <button 
            onClick={initGame}
            className="px-12 py-4 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full text-white text-2xl font-bold shadow-xl hover:scale-110 transition-transform active:scale-95"
          >
            开始游戏
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between p-8 relative">
          {/* Top Info */}
          <div className="flex justify-between text-white font-bold">
            <div className="bg-black/20 p-2 rounded">左家: {leftAIHand.length}张</div>
            <div className="bg-black/20 p-2 rounded">右家: {rightAIHand.length}张</div>
          </div>

          {/* Table Area */}
          <div className="flex-1 flex items-center justify-center">
             <div className="flex gap-2">
                {tableCards.map((c, i) => (
                  <Card key={c.id} card={c} size="md" index={i} total={tableCards.length} disabled />
                ))}
             </div>
          </div>

          {/* Player Controls */}
          <div className="flex flex-col items-center gap-8">
            <div className="flex gap-4">
              <button 
                onClick={() => setSelectedCards([])}
                className="px-6 py-2 bg-slate-700/80 text-white rounded-lg font-bold"
              >
                重选
              </button>
              <button 
                onClick={handlePlay}
                disabled={selectedCards.length === 0}
                className="px-8 py-2 bg-amber-600 text-white rounded-lg font-bold shadow-lg disabled:opacity-50"
              >
                出牌
              </button>
              <button 
                onClick={() => {setTurn(1); setLastPlayer(lastPlayer);}}
                className="px-6 py-2 bg-slate-700/80 text-white rounded-lg font-bold"
              >
                不要
              </button>
            </div>

            {/* Player Hand */}
            <div className="flex justify-center h-48 w-full max-w-4xl relative">
              {playerHand.map((c, i) => (
                <div key={c.id} style={{ marginLeft: i === 0 ? 0 : '-50px' }}>
                  <Card 
                    card={c} 
                    index={i} 
                    total={playerHand.length}
                    selected={!!selectedCards.find(sc => sc.id === c.id)}
                    onClick={() => toggleSelect(c)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </GameBoard>
  );
};

export default App;
