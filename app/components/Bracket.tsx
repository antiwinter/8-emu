import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { KnockoutSeries, Player } from '../types/game';

export const Bracket: React.FC = () => {
  const { state, startKnockoutBattle, simulateNextKnockoutStep } = useGame();
  const [isSimulating, setIsSimulating] = useState(false);

  // Determine user status
  const userInSemis = state.semiFinals.some(s => s.player1Id === state.userPlayerId || s.player2Id === state.userPlayerId);
  const userInFinal = state.final && (state.final.player1Id === state.userPlayerId || state.final.player2Id === state.userPlayerId);
  const userInThird = state.thirdPlace && (state.thirdPlace.player1Id === state.userPlayerId || state.thirdPlace.player2Id === state.userPlayerId);
  
  const isUserPlaying = userInSemis || userInFinal || userInThird;
  const isSpectator = !isUserPlaying;

  const handleSpectatorSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      simulateNextKnockoutStep();
      setIsSimulating(false);
    }, 800);
  };

  const handleUserBattle = (seriesId: string) => {
      startKnockoutBattle(seriesId);
  };

  const semi1 = state.semiFinals[0];
  const semi2 = state.semiFinals[1];
  const final = state.final;
  const thirdPlace = state.thirdPlace;

  const getPlayer = (id: string) => state.players.find(p => p.id === id);

  // Helper to find the active series for the user
  const getUserActiveSeriesId = () => {
      if (state.currentPhase === 'SemiFinals') {
          return state.semiFinals.find(s => s.player1Id === state.userPlayerId || s.player2Id === state.userPlayerId)?.id;
      }
      if (state.currentPhase === 'Finals') {
          if (userInFinal) return state.final?.id;
          if (userInThird) return state.thirdPlace?.id;
      }
      return null;
  };
  
  const userSeriesId = getUserActiveSeriesId();

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-yellow-500 mb-2">Knockout Phase</h2>
      {isSpectator && <div className="mb-6 px-4 py-2 bg-gray-800 rounded-full text-sm text-gray-400">Spectator Mode</div>}

      <div className="flex justify-between w-full gap-8 relative">
        {/* Semi Finals Column */}
        <div className="flex flex-col justify-around gap-16 w-1/3">
          <SeriesCard series={semi1} getPlayer={getPlayer} title="Semi-Final 1" targetWins={7} userPlayerId={state.userPlayerId} />
          <SeriesCard series={semi2} getPlayer={getPlayer} title="Semi-Final 2" targetWins={7} userPlayerId={state.userPlayerId} />
        </div>

        {/* Finals Column */}
        <div className="flex flex-col justify-center gap-16 w-1/3 items-center">
          {final ? (
             <>
               <div className="scale-110">
                 <SeriesCard series={final} getPlayer={getPlayer} title="GRAND FINAL" targetWins={5} isFinal userPlayerId={state.userPlayerId} />
               </div>
               {thirdPlace && (
                 <div className="opacity-90 scale-90">
                    <SeriesCard series={thirdPlace} getPlayer={getPlayer} title="Third Place Match" targetWins={5} userPlayerId={state.userPlayerId} />
                 </div>
               )}
             </>
          ) : (
             <div className="h-64 flex items-center justify-center text-gray-600 border-2 border-dashed border-gray-700 rounded-xl p-8 w-full text-center">
               Waiting for Semi-Finals results...
             </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        {/* Action Button Area */}
        {isSpectator ? (
             <button
                onClick={handleSpectatorSimulate}
                disabled={isSimulating || (!!final?.winnerId && !!thirdPlace?.winnerId)}
                className={`
                    px-10 py-4 bg-gray-700 text-white font-bold text-xl rounded-full shadow-lg 
                    transform transition-all active:scale-95 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed
                    border-4 border-gray-600
                `}
             >
                {!!final?.winnerId ? 'Tournament Finished' : (isSimulating ? 'Simulating...' : 'Watch Next Round')}
             </button>
        ) : (
             userSeriesId && (
                <button
                    onClick={() => handleUserBattle(userSeriesId)}
                    disabled={false} // Should be disabled if waiting for opponent? Logic handled in context usually
                    className={`
                        px-12 py-6 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold text-2xl rounded-full shadow-lg 
                        transform transition-all active:scale-95 hover:brightness-110
                        border-4 border-red-900 animate-pulse
                    `}
                >
                    ENTER BATTLE
                </button>
             )
        )}
      </div>
    </div>
  );
};

interface SeriesCardProps {
  series: KnockoutSeries;
  getPlayer: (id: string) => Player | undefined;
  title: string;
  targetWins: number;
  isFinal?: boolean;
  userPlayerId: string | null;
}

const SeriesCard: React.FC<SeriesCardProps> = ({ series, getPlayer, title, targetWins, isFinal, userPlayerId }) => {
  const p1 = getPlayer(series.player1Id);
  const p2 = getPlayer(series.player2Id);

  if (!p1 || !p2) return null;

  const isCompleted = !!series.winnerId;

  return (
    <div className={`
      flex flex-col bg-gray-800 rounded-xl overflow-hidden border-2 w-full transition-all duration-300
      ${isFinal ? 'border-yellow-500 shadow-yellow-500/30 shadow-2xl' : 'border-gray-700 shadow-lg'}
    `}>
      <div className={`py-2 px-4 font-bold text-center text-sm uppercase tracking-widest ${isFinal ? 'bg-yellow-600 text-black' : 'bg-gray-700 text-gray-300'}`}>
        {title} <span className="text-xs opacity-75">(Best of {targetWins === 7 ? 13 : 9})</span>
      </div>
      
      <div className="flex flex-col p-4 gap-2">
        {/* Player 1 */}
        <div className={`flex justify-between items-center p-2 rounded ${series.winnerId === p1.id ? 'bg-green-900/30' : ''}`}>
           <div className="flex items-center gap-2">
             <span className={`font-bold ${p1.id === userPlayerId ? 'text-yellow-400' : 'text-white'}`}>{p1.name}</span>
             {series.winnerId === p1.id && <span className="text-green-500">👑</span>}
           </div>
           <div className="flex items-center gap-2">
             <div className="w-24 md:w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(series.player1Wins / targetWins) * 100}%` }}></div>
             </div>
             <span className="font-mono font-bold text-xl w-6 text-right text-blue-400">{series.player1Wins}</span>
           </div>
        </div>

        {/* Player 2 */}
        <div className={`flex justify-between items-center p-2 rounded ${series.winnerId === p2.id ? 'bg-green-900/30' : ''}`}>
           <div className="flex items-center gap-2">
             <span className={`font-bold ${p2.id === userPlayerId ? 'text-yellow-400' : 'text-white'}`}>{p2.name}</span>
             {series.winnerId === p2.id && <span className="text-green-500">👑</span>}
           </div>
           <div className="flex items-center gap-2">
             <div className="w-24 md:w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${(series.player2Wins / targetWins) * 100}%` }}></div>
             </div>
             <span className="font-mono font-bold text-xl w-6 text-right text-red-400">{series.player2Wins}</span>
           </div>
        </div>
      </div>
      
      {isCompleted && (
        <div className="bg-gray-900/50 py-1 text-center text-xs text-gray-400">
          Winner: {series.winnerId === p1.id ? p1.name : p2.name}
        </div>
      )}
    </div>
  );
};
