import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Match, Player } from '../types/game';

export const MatchArea: React.FC = () => {
  const { state, playNextMatch } = useGame();
  const [isSimulating, setIsSimulating] = useState(false);
  
  const currentMatch = state.currentActiveMatch;
  
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

  if (!currentMatch || !p1 || !p2) {
      return (
        <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-12 text-gray-400">
             <div className="animate-spin text-4xl text-yellow-500 mb-4">⚔️</div>
             <div>Simulating other matches...</div>
        </div>
      );
  }

  // Determine Title based on Phase
  let title = '';
  let subTitle = currentMatch.phase;

  if (currentMatch.phase === 'RoundRobin') {
      // Logic to find "Opponent X/6"
      if (state.userPlayerId) {
          const userMatches = state.roundRobinMatches.filter(m => 
              m.player1Id === state.userPlayerId || m.player2Id === state.userPlayerId
          );
          
          // Count unique opponents faced up to current match
          const opponentsFaced = new Set<string>();
          for (const m of userMatches) {
              const opId = m.player1Id === state.userPlayerId ? m.player2Id : m.player1Id;
              opponentsFaced.add(opId);
              if (m.id === currentMatch.id) break;
          }
          
          title = `Opponents: ${opponentsFaced.size}/6`;
      } else {
          title = `Round ${currentMatch.roundNumber}`;
      }
      subTitle = `Round ${currentMatch.gameNumber || 1}`;

  } else if (currentMatch.phase === 'SemiFinals') {
      title = `Semi-Final`;
      subTitle = `Game ${currentMatch.roundNumber}`;
  } else if (currentMatch.phase === 'Finals') {
      title = `Grand Final`;
      subTitle = `Game ${currentMatch.roundNumber}`;
  } else if (currentMatch.phase === 'ThirdPlace') {
      title = `Third Place`;
      subTitle = `Game ${currentMatch.roundNumber}`;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl text-yellow-500 font-bold mb-2">{title}</h2>
        <p className="text-gray-400 uppercase tracking-widest text-lg font-bold text-white bg-gray-800 px-4 py-1 rounded-full inline-block">
            {subTitle}
        </p>
      </div>

      {/* Match Up */}
      <div className="flex items-center justify-between w-full mb-10 gap-4 md:gap-8">
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
          border-4 border-red-900 min-w-[200px]
        `}
      >
        {isSimulating ? 'Battling...' : '开始对战 (Start Battle)'}
      </button>
    </div>
  );
};

const PlayerCard: React.FC<{ player: Player; isUser: boolean }> = ({ player, isUser }) => (
  <div className={`
    flex flex-col items-center p-4 md:p-6 bg-gray-800 rounded-2xl border-2 w-36 md:w-48
    ${isUser ? 'border-yellow-500 shadow-yellow-500/20 shadow-lg' : 'border-gray-700'}
  `}>
    <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-700 rounded-full mb-4 flex items-center justify-center text-2xl md:text-3xl text-white font-bold relative overflow-hidden">
      {player.avatar ? (
          <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
      ) : (
          <span>{player.name.charAt(0)}</span>
      )}
    </div>
    <h3 className="text-lg md:text-xl font-bold text-white mb-1 text-center">{player.name}</h3>
    <div className="text-xs md:text-sm text-gray-400">Str: {player.strength}</div>
    {isUser && <span className="mt-2 text-xs bg-yellow-600 text-white px-2 py-0.5 rounded">YOU</span>}
  </div>
);
