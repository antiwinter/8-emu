import React from 'react';
import { useGame } from '../context/GameContext';
import { Player } from '../types/game';

export const Leaderboard: React.FC = () => {
  const { state, setView } = useGame();

  const handleBack = () => {
      // Logic to determine where to go back to
      if (state.currentPhase === 'RoundRobin') {
          setView('match');
      } else {
          setView('bracket');
      }
  };

  const sortedPlayers = [...state.players].sort((a, b) => b.points - a.points);
  const isTournamentOver = !!state.final?.winnerId;
  const isKnockout = state.currentPhase !== 'RoundRobin';

  // Logs: Show ALL completed matches
  const matchHistory = [
      ...state.roundRobinMatches,
      ...(state.semiFinals.flatMap(s => s.matches) || []),
      ...(state.final?.matches || []),
      ...(state.thirdPlace?.matches || [])
  ].filter(m => m.isCompleted);

  const getPlayerName = (id: string) => state.players.find(p => p.id === id)?.name || id;

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto p-4 space-y-8 pb-20">
      <div className="flex justify-between items-center border-b border-gray-700 pb-4">
        <h2 className="text-3xl font-bold text-yellow-500">Leaderboard</h2>
        <button 
            onClick={handleBack}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold"
        >
            Continue match
        </button>
      </div>

      {/* 1. Champion Section */}
      {isTournamentOver && state.final?.winnerId && (
        <div className="bg-gray-800 rounded-xl p-6 border border-yellow-600 shadow-xl">
           <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-widest text-center">Tournament Results</h3>
           <div className="flex justify-center items-end gap-4 h-64">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                    <div className="text-gray-300 font-bold mb-2">{getPlayerName(state.final.winnerId === state.final.player1Id ? state.final.player2Id : state.final.player1Id)}</div>
                    <div className="w-24 h-32 bg-gray-600 rounded-t-lg flex items-center justify-center text-4xl font-bold text-gray-400">2</div>
                </div>
                {/* 1st Place */}
                <div className="flex flex-col items-center">
                    <div className="text-yellow-400 font-bold text-xl mb-2">👑 {getPlayerName(state.final.winnerId)}</div>
                    <div className="w-28 h-48 bg-yellow-600 rounded-t-lg flex items-center justify-center text-6xl font-bold text-white shadow-lg">1</div>
                </div>
                {/* 3rd Place */}
                {state.thirdPlace?.winnerId && (
                    <div className="flex flex-col items-center">
                        <div className="text-orange-300 font-bold mb-2">{getPlayerName(state.thirdPlace.winnerId)}</div>
                        <div className="w-24 h-24 bg-orange-700 rounded-t-lg flex items-center justify-center text-3xl font-bold text-orange-200">3</div>
                    </div>
                )}
           </div>
        </div>
      )}

      {/* 2. Round Robin Wins / Qualifiers */}
      {isKnockout && (
          <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Round Robin Top 4</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {sortedPlayers.slice(0, 4).map((p, i) => (
                      <div key={p.id} className="bg-gray-700 p-3 rounded-lg flex items-center justify-between">
                          <span className="font-bold text-white">#{i+1} {p.name}</span>
                          <span className="text-yellow-500 font-mono">{p.points} wins</span>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* 3. Player Standings */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Full Standings</h3>
        <div className="space-y-2">
            <div className="grid grid-cols-4 text-sm text-gray-500 font-semibold px-4">
                <span>Rank</span>
                <span className="col-span-2">Player</span>
                <span className="text-right">Points</span>
            </div>
            {sortedPlayers.map((player, index) => (
            <div 
                key={player.id}
                className={`grid grid-cols-4 items-center p-3 rounded ${
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
      </div>

      {/* 4. Match Logs */}
      {matchHistory.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Tournament Match History</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {matchHistory.reverse().map((m) => {
                      const p1Name = getPlayerName(m.player1Id);
                      const p2Name = getPlayerName(m.player2Id);
                      const winnerName = getPlayerName(m.winnerId || '');
                      const isUserInvolved = m.player1Id === state.userPlayerId || m.player2Id === state.userPlayerId;
                      
                      return (
                          <div key={m.id} className={`flex justify-between items-center p-3 rounded ${isUserInvolved ? 'bg-gray-700 border-l-4 border-yellow-500' : 'bg-gray-800/50'}`}>
                              <div className="flex flex-col text-sm">
                                  <span className="text-xs text-gray-500 uppercase">{m.phase} - Round {m.roundNumber}</span>
                                  <div className="text-white">
                                      <span className={m.winnerId === m.player1Id ? 'text-green-400 font-bold' : ''}>{p1Name}</span>
                                      <span className="mx-2 text-gray-500">vs</span>
                                      <span className={m.winnerId === m.player2Id ? 'text-green-400 font-bold' : ''}>{p2Name}</span>
                                  </div>
                              </div>
                              <div className="text-xs bg-gray-900 px-2 py-1 rounded text-gray-400">
                                  Winner: <span className="text-white font-bold">{winnerName}</span>
                              </div>
                          </div>
                      )
                  })}
              </div>
          </div>
      )}
    </div>
  );
};
