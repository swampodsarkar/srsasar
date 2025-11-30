import React from 'react';
import { MAX_HP } from '../types';

interface UIProps {
  hp1: number;
  hp2: number;
  winner: 1 | 2 | null;
  onRestart: () => void;
}

export const UI: React.FC<UIProps> = ({ hp1, hp2, winner, onRestart }) => {
  const hp1Percent = (hp1 / MAX_HP) * 100;
  const hp2Percent = (hp2 / MAX_HP) * 100;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      
      {/* Health Bars Container */}
      <div className="flex justify-between items-start w-full gap-8">
        
        {/* Player 1 Health */}
        <div className="w-1/2 flex flex-col relative">
          <div className="text-yellow-400 arcade-font text-xl mb-1 drop-shadow-md">PLAYER 1</div>
          <div className="h-8 w-full bg-red-900 border-2 border-white skew-x-[-15deg] relative overflow-hidden">
             <div 
                className="h-full bg-yellow-500 transition-all duration-200 ease-out" 
                style={{ width: `${hp1Percent}%` }}
             />
          </div>
          {/* Avatar Placeholder */}
          <div className="absolute -left-2 top-0 h-16 w-16 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center overflow-hidden shadow-lg z-20">
             <span className="text-2xl font-bold text-white">P1</span>
          </div>
        </div>

        {/* VS Timer (Static for now) */}
        <div className="flex flex-col items-center justify-center">
            <div className="text-4xl text-white font-bold arcade-font drop-shadow-lg">99</div>
        </div>

        {/* Player 2 Health */}
        <div className="w-1/2 flex flex-col items-end relative">
          <div className="text-yellow-400 arcade-font text-xl mb-1 drop-shadow-md">PLAYER 2</div>
          <div className="h-8 w-full bg-red-900 border-2 border-white skew-x-[15deg] relative overflow-hidden">
             <div 
                className="h-full bg-yellow-500 transition-all duration-200 ease-out float-right" 
                style={{ width: `${hp2Percent}%` }}
             />
          </div>
          {/* Avatar Placeholder */}
          <div className="absolute -right-2 top-0 h-16 w-16 bg-red-600 border-2 border-white rounded-full flex items-center justify-center overflow-hidden shadow-lg z-20">
             <span className="text-2xl font-bold text-white">P2</span>
          </div>
        </div>
      </div>

      {/* Controls Help */}
      {!winner && (
        <div className="text-white/50 text-sm text-center font-mono">
           <p><span className="text-blue-400">P1:</span> WASD + Space (Punch)</p>
           <p><span className="text-red-400">P2:</span> Arrows + Enter (Punch)</p>
        </div>
      )}

      {/* Winner Overlay */}
      {winner && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center pointer-events-auto">
          <div className="text-center animate-bounce">
            <h1 className="text-8xl text-yellow-400 arcade-font drop-shadow-[0_5px_5px_rgba(255,0,0,0.8)] mb-4">
              K.O.
            </h1>
            <h2 className="text-4xl text-white font-bold mb-8">
              PLAYER {winner} WINS!
            </h2>
            <button 
              onClick={onRestart}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-lg transform hover:scale-105 transition-transform"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};