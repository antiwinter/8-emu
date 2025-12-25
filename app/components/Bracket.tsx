'use client';

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { KnockoutSeries, Player } from '../types/game';
import { motion } from 'framer-motion';

export const Bracket: React.FC = () => {
  const { state, startKnockoutBattle, simulateNextKnockoutStep, setView } = useGame();
  const [isSimulating, setIsSimulating] = useState(false);

  // Determine user status
  const userInSemis = state.semiFinals.some(s => s.player1Id === state.userPlayerId || s.player2Id === state.userPlayerId);
  const userInFinal = state.final && (state.final.player1Id === state.userPlayerId || state.final.player2Id === state.userPlayerId);
  const userInThird = state.thirdPlace && (state.thirdPlace.player1Id === state.userPlayerId || state.thirdPlace.player2Id === state.userPlayerId);
  
  const isUserPlaying = userInSemis || userInFinal || userInThird;
  const isSpectator = !isUserPlaying;

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
  
  const allSeries = [...state.semiFinals, state.final, state.thirdPlace].filter(Boolean) as KnockoutSeries[];
  const userSeries = allSeries.find(s => s.id === userSeriesId);
  const isUserSeriesFinished = userSeries ? !!userSeries.winnerId : false;

  let isOtherSeriesActive = false;
  if (state.currentPhase === 'SemiFinals') {
      isOtherSeriesActive = state.semiFinals.some(s => !s.winnerId);
  } else if (state.currentPhase === 'Finals') {
      isOtherSeriesActive = (!!state.final && !state.final.winnerId) || (!!state.thirdPlace && !state.thirdPlace.winnerId);
  }

  const isWaitingForOpponent = isUserSeriesFinished && isOtherSeriesActive;
  const isTournamentFinished = !!state.final?.winnerId && !!state.thirdPlace?.winnerId;

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      simulateNextKnockoutStep();
      setIsSimulating(false);
    }, 800);
  };
  
  const handleLeaderboard = () => {
      setView('leaderboard');
  };

  const handleUserBattle = (seriesId: string) => {
      startKnockoutBattle(seriesId);
  };

  const semi1 = state.semiFinals[0];
  const semi2 = state.semiFinals[1];
  const final = state.final;
  const thirdPlace = state.thirdPlace;

  const getPlayer = (id: string) => state.players.find(p => p.id === id);

  return (
    <div className="flex flex-col items-center w-full min-h-screen p-4 pb-32 relative">
      
      {/* Ambient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[var(--color-cyber-pink)] opacity-5 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 z-10"
      >
        <h2 className="text-2xl md:text-3xl font-black text-[var(--color-cyber-pink)] glow-text-pink tracking-wider mb-2">
          KNOCKOUT PHASE
        </h2>
        {isSpectator && (
          <span className="inline-block px-3 py-1 glass-panel text-gray-400 text-xs font-bold uppercase tracking-wider rounded-full">
            Spectator Mode
          </span>
        )}
        {isWaitingForOpponent && (
          <span className="inline-block px-3 py-1 bg-[var(--color-cyber-cyan)]/10 border border-[var(--color-cyber-cyan)]/30 text-[var(--color-cyber-cyan)] text-xs font-bold uppercase tracking-wider rounded-full animate-pulse">
            Waiting for opponent...
          </span>
        )}
      </motion.div>

      {/* Bracket Display */}
      <div className="flex flex-col gap-4 w-full max-w-md z-10">
        
        {/* Semi Finals Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[var(--color-cyber-cyan)]/30" />
            <h3 className="text-xs font-bold text-[var(--color-cyber-cyan)] uppercase tracking-[0.2em]">Semi Finals</h3>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[var(--color-cyber-cyan)]/30" />
          </div>
          <MatchCard series={semi1} getPlayer={getPlayer} title="Match 1" targetWins={7} userPlayerId={state.userPlayerId} />
          <MatchCard series={semi2} getPlayer={getPlayer} title="Match 2" targetWins={7} userPlayerId={state.userPlayerId} />
        </div>

        {/* Connector Line */}
        <div className="flex justify-center">
          <div className="w-[2px] h-8 bg-gradient-to-b from-[var(--color-cyber-cyan)]/50 to-[var(--color-cyber-yellow)]/50" />
        </div>

        {/* Finals Section */}
        {(final || thirdPlace) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[var(--color-cyber-yellow)]/30" />
              <h3 className="text-xs font-bold text-[var(--color-cyber-yellow)] uppercase tracking-[0.2em]">Finals</h3>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[var(--color-cyber-yellow)]/30" />
            </div>
            
            {final ? (
              <MatchCard series={final} getPlayer={getPlayer} title="Championship" targetWins={5} isFinal userPlayerId={state.userPlayerId} />
            ) : (
              <div className="h-20 glass-panel rounded-xl flex items-center justify-center text-gray-500 text-sm border border-dashed border-gray-700">
                Awaiting Semi-Final Results...
              </div>
            )}
            
            {thirdPlace && (
              <div className="opacity-80">
                <MatchCard series={thirdPlace} getPlayer={getPlayer} title="3rd Place" targetWins={5} userPlayerId={state.userPlayerId} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Bottom Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 z-40 pointer-events-none">
        <div className="flex justify-center pointer-events-auto w-full max-w-md mx-auto">
          {isSpectator || isWaitingForOpponent || isTournamentFinished ? (
            <button
              onClick={isTournamentFinished ? handleLeaderboard : handleSimulate}
              disabled={isSimulating || (!isOtherSeriesActive && !isWaitingForOpponent && !isTournamentFinished)}
              className={`
                w-full py-4 font-bold text-lg uppercase tracking-wider rounded-none transition-all
                ${isTournamentFinished 
                  ? 'cyber-btn bg-gradient-to-r from-[var(--color-cyber-yellow)] to-[var(--color-cyber-green)]' 
                  : 'glass-panel text-gray-300 hover:text-[var(--color-cyber-cyan)] border border-[var(--color-cyber-cyan)]/30'}
                disabled:opacity-50 disabled:cursor-not-allowed
                clip-angle-both
              `}
            >
              {isTournamentFinished ? 'VIEW RESULTS' : (isSimulating ? 'Simulating...' : (isWaitingForOpponent ? 'Watch Matches' : 'Watch Next'))}
            </button>
          ) : (
            userSeriesId && (
              <button
                onClick={() => handleUserBattle(userSeriesId)}
                className="cyber-btn-pink cyber-btn w-full text-lg pulse-glow"
                style={{ boxShadow: 'var(--glow-pink)' }}
              >
                ENTER BATTLE
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

interface MatchCardProps {
  series: KnockoutSeries;
  getPlayer: (id: string) => Player | undefined;
  title: string;
  targetWins: number;
  isFinal?: boolean;
  userPlayerId: string | null;
}

const MatchCard: React.FC<MatchCardProps> = ({ series, getPlayer, title, targetWins, isFinal, userPlayerId }) => {
  const p1 = getPlayer(series.player1Id);
  const p2 = getPlayer(series.player2Id);

  if (!p1 || !p2) return null;

  const isCompleted = !!series.winnerId;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative glass-panel overflow-hidden rounded-xl
        ${isFinal ? 'border-[var(--color-cyber-yellow)]/50 shadow-[0_0_30px_rgba(255,215,0,0.15)]' : 'border-[var(--color-glass-border)]'}
        ${isCompleted ? 'opacity-90' : ''}
      `}
    >
      {/* Header */}
      <div className={`px-3 py-2 flex justify-between items-center border-b border-white/5 ${isFinal ? 'bg-[var(--color-cyber-yellow)]/10' : ''}`}>
        <span className={`text-xs font-bold uppercase tracking-wider ${isFinal ? 'text-[var(--color-cyber-yellow)]' : 'text-gray-500'}`}>
          {title}
        </span>
        <span className="text-[10px] font-mono text-gray-600">
          BO{targetWins === 7 ? 13 : 9}
        </span>
      </div>
      
      {/* Players */}
      <div className="p-3 space-y-2">
        <PlayerRow player={p1} wins={series.player1Wins} targetWins={targetWins} isUser={p1.id === userPlayerId} isWinner={series.winnerId === p1.id} />
        <div className="h-[1px] bg-white/5" />
        <PlayerRow player={p2} wins={series.player2Wins} targetWins={targetWins} isUser={p2.id === userPlayerId} isWinner={series.winnerId === p2.id} />
      </div>
      
      {/* Completed Overlay */}
      {isCompleted && (
        <div className="absolute inset-0 bg-[var(--color-void)]/60 backdrop-blur-[2px] flex items-center justify-center">
          <div className="glass-panel px-4 py-2 rounded-full text-xs font-bold text-white flex items-center gap-2 border border-[var(--color-cyber-green)]/30">
            <span className="text-[var(--color-cyber-green)]">✓</span>
            Winner: {series.winnerId === p1.id ? p1.name : p2.name}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const PlayerRow: React.FC<{ player: Player; wins: number; targetWins: number; isUser: boolean; isWinner: boolean }> = ({ player, wins, targetWins, isUser, isWinner }) => (
  <div className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${isWinner ? 'bg-[var(--color-cyber-green)]/10' : (isUser ? 'bg-[var(--color-cyber-cyan)]/5' : '')}`}>
    {/* Avatar */}
    <div className={`w-8 h-8 rounded overflow-hidden shrink-0 ${isUser ? 'ring-1 ring-[var(--color-cyber-cyan)]' : ''}`}>
      <img src={`/avatars/${player.id}.jpg`} alt={player.name} className="w-full h-full object-cover" />
    </div>
    
    {/* Name */}
    <span className={`flex-1 text-sm font-bold truncate ${isUser ? 'text-[var(--color-cyber-cyan)]' : 'text-white'}`}>
      {player.name} {isWinner && '👑'}
    </span>
    
    {/* Win Pips */}
    <div className="flex gap-0.5 items-center">
      {[...Array(targetWins)].map((_, i) => (
        <div 
          key={i} 
          className={`w-1.5 h-3 rounded-sm ${i < wins ? 'bg-[var(--color-cyber-green)]' : 'bg-gray-700'}`}
        />
      ))}
      <span className="ml-2 text-xs font-mono font-bold text-gray-400 w-4 text-right">{wins}</span>
    </div>
  </div>
);
