import React from 'react';
import { useGame } from '../context/GameContext';

export const Scoreboard: React.FC = () => {
  const { state } = useGame();
  
  // Sort players by points desc for display
  const sortedPlayers = [...state.players].sort((a, b) => b.points - a.points);

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md">
      <h3 className="text-xl font-bold mb-4 text-white border-b border-gray-700 pb-2">Standings</h3>
      <div className="space-y-2">
        <div className="grid grid-cols-4 text-sm text-gray-400 font-semibold mb-2 px-2">
          <span>Rank</span>
          <span className="col-span-2">Player</span>
          <span className="text-right">Points</span>
        </div>
        
        {sortedPlayers.map((player, index) => (
          <div 
            key={player.id}
            className={`grid grid-cols-4 items-center p-2 rounded ${
              player.id === state.userPlayerId ? 'bg-yellow-900/30 border border-yellow-600/50' : 'bg-gray-700/50'
            }`}
          >
            <span className={`font-bold ${index < 4 ? 'text-green-400' : 'text-gray-500'}`}>
              #{index + 1}
            </span>
            <span className="col-span-2 text-white font-medium flex items-center gap-2">
              {player.name}
              {player.id === state.userPlayerId && <span className="text-xs text-yellow-500">(You)</span>}
            </span>
            <span className="text-right text-yellow-400 font-bold">{player.points}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs text-gray-500 text-center">
        Top 4 qualify for Semi-Finals
      </div>
    </div>
  );
};

