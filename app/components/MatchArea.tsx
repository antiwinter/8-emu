import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Match, Player } from '../types/game';

export const MatchArea: React.FC = () => {
  const { state, playNextMatch, setView, clearLastMatch } = useGame();
  const [isFighting, setIsFighting] = useState(false);
  
  // Logic: 
  // If lastMatchResult exists -> PostFight
  // Else if isFighting -> Fighting
  // Else -> PreFight

  const lastResult = state.lastMatchResult;
  const currentMatch = state.currentActiveMatch;
  
  const activeData = lastResult || currentMatch;
  const p1 = state.players.find(p => p.id === activeData?.player1Id);
  const p2 = state.players.find(p => p.id === activeData?.player2Id);

  // Derived Stats
  const isUserP1 = p1?.id === state.userPlayerId;
  const opponent = isUserP1 ? p2 : p1;
  const user = isUserP1 ? p1 : p2;

  // Head-to-Head / Series Wins
  const getWins = (player: Player | undefined, vsOpponent: Player | undefined) => {
      if (!player || !vsOpponent) return 0;
      
      if (state.currentPhase === 'RoundRobin') {
          return state.roundRobinMatches.filter(m => 
              m.isCompleted && m.winnerId === player.id && 
              (m.player1Id === vsOpponent.id || m.player2Id === vsOpponent.id)
          ).length;
      } else {
          // Knockout Series Wins
          const series = [...state.semiFinals, state.final, state.thirdPlace].find(s => s && (
              (s.player1Id === player.id && s.player2Id === vsOpponent.id) || 
              (s.player2Id === player.id && s.player1Id === vsOpponent.id)
          ));
          if (!series) return 0;
          return series.player1Id === player.id ? series.player1Wins : series.player2Wins;
      }
  };

  const handleStart = () => {
    setIsFighting(true);
    setTimeout(() => {
      playNextMatch();
      setIsFighting(false);
    }, 1500); // 1.5s fight animation
  };

  const handleNextMatch = () => {
      clearLastMatch();
      
      // Auto-start next fight if valid match exists
      if (state.currentActiveMatch) {
           setTimeout(() => {
              handleStart();
           }, 100);
      } else if (state.currentPhase !== 'RoundRobin') {
          // Series Over
          setView('bracket');
      }
  };

  const handleLeaderboard = () => {
      if (state.currentPhase === 'RoundRobin') {
          setView('leaderboard');
      } else {
          setView('bracket'); // "Knockout board"
      }
  };

  if (!activeData || !p1 || !p2) {
      return (
        <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-12 text-gray-400">
             <div className="animate-spin text-4xl text-yellow-500 mb-4">⚔️</div>
             <div>Simulating other matches...</div>
        </div>
      );
  }

  // Titles
  let title = '';
  let subTitle = activeData.phase;
  if (activeData.phase === 'RoundRobin') {
      title = lastResult ? 'Match Finished' : 'Ready to Fight';
      subTitle = `Round ${activeData.gameNumber || 1}`;
  } else {
      const isFinal = activeData.id.startsWith('final');
      const isThird = activeData.id.startsWith('3rd-place');
      
      title = lastResult ? 'Battle Result' : (
          isFinal ? 'Battle for Champion' : 
          isThird ? 'Battle for 3rd Place' : 'Knockout Battle'
      );
      subTitle = `Game ${activeData.roundNumber}`;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-8 relative">
      
      {/* Header */}
      <div className="mb-8 text-center z-10">
        <h2 className="text-3xl text-yellow-500 font-bold mb-2">{title}</h2>
        <p className="text-gray-400 uppercase tracking-widest text-lg font-bold text-white bg-gray-800 px-4 py-1 rounded-full inline-block">
            {subTitle}
        </p>
      </div>

      {/* Battle Arena */}
      <div className="flex items-center justify-between w-full mb-10 gap-4 md:gap-8 relative">
        <PlayerCard 
            player={p1} 
            isUser={p1.id === state.userPlayerId} 
            isWinner={lastResult?.winnerId === p1.id} 
            wins={getWins(p1, p2)}
        />
        
        <div className="flex flex-col items-center justify-center w-32">
          {isFighting ? (
             <div className="text-6xl animate-ping">💥</div>
          ) : lastResult ? (
             <div className="text-4xl font-bold text-white bg-gray-800 px-3 py-1 rounded border border-gray-600">
                 {lastResult.winnerId === p1.id ? '>' : '<'}
             </div>
          ) : (
             <span className="text-5xl font-black text-white italic">VS</span>
          )}
        </div>

        <PlayerCard 
            player={p2} 
            isUser={p2.id === state.userPlayerId} 
            isWinner={lastResult?.winnerId === p2.id} 
            wins={getWins(p2, p1)}
        />
      </div>

      {/* Pre-Fight Info (Points only for RR, stats moved to portrait) */}
      {!lastResult && !isFighting && state.currentPhase === 'RoundRobin' && (
          <div className="flex flex-col items-center w-full mb-8 space-y-2">
              <div className="bg-gray-800/80 p-2 rounded-lg text-sm text-center px-6">
                  <span className="text-gray-400 mr-2">Your Total Points:</span>
                  <span className="text-yellow-400 font-bold text-xl">{user?.points}</span>
              </div>
          </div>
      )}

      {/* Action Buttons */}
      <div className="z-10 mt-4">
          {!lastResult && !isFighting && (
              <button
                onClick={handleStart}
                className="px-12 py-5 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold text-2xl rounded-full shadow-lg transform transition-all hover:scale-105 active:scale-95 border-4 border-red-900 animate-pulse"
              >
                START BATTLE
              </button>
          )}

          {lastResult && (
              <div className="flex gap-4">
                  <button
                    onClick={handleLeaderboard}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg shadow transition-colors"
                  >
                    {state.currentPhase === 'RoundRobin' ? 'Leaderboard' : 'Check bracket'}
                  </button>
                  <button
                    onClick={handleNextMatch}
                    className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg shadow transition-colors"
                  >
                    Next Match
                  </button>
              </div>
          )}
      </div>
      
    </div>
  );
};

const PlayerCard: React.FC<{ player: Player; isUser: boolean; isWinner?: boolean; wins: number }> = ({ player, isUser, isWinner, wins }) => (
  <div className={`
    flex flex-col items-center p-4 md:p-6 bg-gray-800 rounded-2xl border-4 w-36 md:w-48 transition-all duration-500 relative
    ${isWinner ? 'border-green-500 scale-110 shadow-green-500/50 shadow-2xl z-20' : (isUser ? 'border-yellow-500' : 'border-gray-700')}
    ${isWinner === false ? 'opacity-50 grayscale' : ''}
  `}>
    {/* Wins Indicator */}
    <div className="absolute -top-4 bg-gray-900 border border-green-500 px-3 py-1 rounded-full text-green-400 font-bold text-sm shadow-lg whitespace-nowrap z-30">
        {wins} wins
    </div>

    <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-700 rounded-full mb-4 flex items-center justify-center text-2xl md:text-3xl text-white font-bold relative overflow-hidden mt-2">
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
