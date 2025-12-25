import React from 'react';
import { useGame } from '../context/GameContext';
import { Player } from '../types/game';

export const StartScreen: React.FC = () => {
  const { state, selectCharacter } = useGame();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-8 text-yellow-500">Tournament Emulator</h1>
      <h2 className="text-xl mb-6">Choose your Character</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {state.players.map((player: Player) => (
          <button
            key={player.id}
            onClick={() => selectCharacter(player.id)}
            className="flex flex-col items-center p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all transform hover:scale-105 border-2 border-transparent hover:border-yellow-500"
          >
            <div className="w-20 h-20 bg-gray-600 rounded-full mb-4 flex items-center justify-center text-2xl">
              {player.name.charAt(0)}
            </div>
            <span className="text-lg font-bold">{player.name}</span>
            <div className="mt-2 text-sm text-gray-400">
              Strength: <span className="text-yellow-400">{player.strength}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

