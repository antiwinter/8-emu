import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Match, Player } from '../types/game';

export const MatchArea: React.FC = () => {
  const { state, playNextMatch } = useGame();
  const [isSimulating, setIsSimulating] = useState(false);
  
  const currentMatch = state.roundRobinMatches[state.currentMatchIndex];
  
  // Find players for current match
  const p1 = state.players.find(p => p.id === currentMatch?.player1Id);
  const p2 = state.players.find(p => p.id === currentMatch?.player2Id);

  const handlePlay = () => {
    setIsSimulating(true);
    // Add a small delay for suspense
    setTimeout(() => {
      playNextMatch();
      setIsSimulating(false);
    }, 800);
  };

  if (!currentMatch || !p1 || !p2) return <div className="text-white">Loading match...</div>;

  // Last match result
  const lastMatchIndex = state.currentMatchIndex - 1;
  const lastMatch = lastMatchIndex >= 0 ? state.roundRobinMatches[lastMatchIndex] : null;
  const lastWinner = lastMatch ? state.players.find(p => p.id === lastMatch.winnerId) : null;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl text-yellow-500 font-bold mb-2">Round {state.currentMatchIndex + 1} / {state.roundRobinMatches.length}</h2>
        <p className="text-gray-400">Round Robin Phase</p>
      </div>

      {/* Match Up */}
      <div className="flex items-center justify-between w-full mb-10 gap-8">
        <PlayerCard player={p1} isUser={p1.id === state.userPlayerId} />
        
        <div className="flex flex-col items-center">
          <span className="text-4xl font-black text-white italic">VS</span>
          {isSimulating && <span className="text-yellow-500 animate-pulse mt-2">Fighting...</span>}
        </div>

        <PlayerCard player={p2} isUser={p2.id === state.userPlayerId} />
      </div>

      {/* Action Button */}
      <button
        onClick={handlePlay}
        disabled={isSimulating}
        className={`
          px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold text-xl rounded-full shadow-lg 
          transform transition-all active:scale-95 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed
          border-4 border-red-900
        `}
      >
        {isSimulating ? 'Battling...' : '开始对战 (Start Battle)'}
      </button>

      {/* Last Result Log */}
      {lastMatch && lastWinner && (
        <div className="mt-8 p-4 bg-gray-800 rounded-lg text-gray-300 animate-fade-in">
          <span className="text-sm uppercase tracking-wider text-gray-500">Last Match:</span>
          <div className="text-lg">
            <span className="text-white font-bold">{state.players.find(p => p.id === lastMatch.player1Id)?.name}</span>
            <span className="mx-2 text-red-500">vs</span>
            <span className="text-white font-bold">{state.players.find(p => p.id === lastMatch.player2Id)?.name}</span>
            <span className="mx-2">→</span>
            Winner: <span className="text-green-400 font-bold">{lastWinner.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const PlayerCard: React.FC<{ player: Player; isUser: boolean }> = ({ player, isUser }) => (
  <div className={`
    flex flex-col items-center p-6 bg-gray-800 rounded-2xl border-2 w-48
    ${isUser ? 'border-yellow-500 shadow-yellow-500/20 shadow-lg' : 'border-gray-700'}
  `}>
    <div className="w-24 h-24 bg-gray-700 rounded-full mb-4 flex items-center justify-center text-3xl text-white font-bold">
      {player.name.charAt(0)}
    </div>
    <h3 className="text-xl font-bold text-white mb-1">{player.name}</h3>
    <div className="text-sm text-gray-400">Str: {player.strength}</div>
    {isUser && <span className="mt-2 text-xs bg-yellow-600 text-white px-2 py-0.5 rounded">YOU</span>}
  </div>
);

