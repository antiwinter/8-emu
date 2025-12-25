import React from 'react';
import { useGame } from '../context/GameContext';

export const CelebrationModal: React.FC = () => {
  const { state, closeCelebration } = useGame();

  if (!state.showCelebration) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gradient-to-b from-yellow-600 to-yellow-800 p-1 rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform transition-all scale-100 animate-bounce-in">
        <div className="bg-gray-900 rounded-xl p-8 text-center border border-yellow-500/30">
          <div className="text-6xl mb-6 animate-pulse">🎉</div>
          <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-wider">
            Celebration!
          </h2>
          <p className="text-xl text-yellow-200 mb-8 font-medium">
            {state.celebrationMessage}
          </p>
          
          <button
            onClick={closeCelebration}
            className="px-8 py-3 bg-white text-yellow-900 font-bold rounded-full hover:bg-gray-200 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

