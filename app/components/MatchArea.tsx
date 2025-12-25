'use client';

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Player } from '../types/game';
import { motion, AnimatePresence } from 'framer-motion';

export const MatchArea: React.FC = () => {
  const { state, playNextMatch, setView, clearLastMatch } = useGame();
  const [isFighting, setIsFighting] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  
  const lastResult = state.lastMatchResult;
  const currentMatch = state.currentActiveMatch;
  
  const activeData = lastResult || currentMatch;
  const p1 = state.players.find(p => p.id === activeData?.player1Id);
  const p2 = state.players.find(p => p.id === activeData?.player2Id);

  const isUserP1 = p1?.id === state.userPlayerId;
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
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 150);
      playNextMatch();
      setIsFighting(false);
    }, 1800); 
  };

  const handleNextMatch = () => {
      const prevMatch = lastResult;
      clearLastMatch();
      
      // Auto-start only if same opponent (2nd game of H2H)
      if (state.currentActiveMatch && prevMatch) {
          const sameOpponent = 
              (state.currentActiveMatch.player1Id === prevMatch.player1Id && state.currentActiveMatch.player2Id === prevMatch.player2Id) ||
              (state.currentActiveMatch.player1Id === prevMatch.player2Id && state.currentActiveMatch.player2Id === prevMatch.player1Id);
          if (sameOpponent) {
              setTimeout(() => handleStart(), 150);
              return;
          }
      }
      
      if (!state.currentActiveMatch && state.currentPhase !== 'RoundRobin') {
          setView('bracket');
      }
  };

  const handleLeaderboard = () => {
      if (state.currentPhase === 'RoundRobin') {
          setView('leaderboard');
      } else {
          setView('bracket');
      }
  };

  if (!activeData || !p1 || !p2) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
             <div className="text-4xl mb-4 animate-pulse">⚔️</div>
             <div className="text-gray-400 uppercase tracking-widest text-sm">Simulating matches...</div>
        </div>
      );
  }

  // Titles
  let title = '';
  let subTitle = '';
  if (activeData.phase === 'RoundRobin') {
      title = lastResult ? 'BATTLE COMPLETE' : 'READY';
      subTitle = `Round ${activeData.gameNumber || 1}`;
  } else {
      const isFinal = activeData.id.startsWith('final');
      const isThird = activeData.id.startsWith('3rd-place');
      title = lastResult ? 'RESULT' : (
          isFinal ? 'CHAMPIONSHIP' : 
          isThird ? '3RD PLACE' : 'KNOCKOUT'
      );
      subTitle = `Game ${activeData.roundNumber}`;
  }

  const userWon = lastResult && lastResult.winnerId === state.userPlayerId;

  return (
    <div className="flex flex-col items-center w-full min-h-screen relative overflow-hidden">
      
      {/* Flash Effect */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Ambient Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-[var(--color-cyber-cyan)]/5 to-transparent" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-[var(--color-cyber-pink)]/5 to-transparent" />
      </div>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-4 pb-2 text-center z-10 w-full"
      >
        <span className="text-xs text-gray-500 uppercase tracking-[0.3em] block mb-1">{subTitle}</span>
        <h2 className={`text-2xl md:text-3xl font-black tracking-wider ${lastResult ? (userWon ? 'text-[var(--color-cyber-green)] glow-text-cyan' : 'text-[var(--color-cyber-red)]') : 'text-white'}`}>
          {title}
        </h2>
      </motion.div>

      {/* Battle Arena - Vertical Stack */}
      <div className="flex-1 flex flex-col items-center justify-center w-full px-4 py-4 gap-4 relative z-10">
        
        {/* Player 1 (Top) */}
        <motion.div 
          animate={isFighting ? { x: [0, -8, 8, -4, 4, 0] } : { x: 0 }}
          transition={{ repeat: isFighting ? Infinity : 0, duration: 0.15 }}
          className="w-full max-w-sm"
        >
          <FighterCard 
            player={p1} 
            wins={getWins(p1, p2)}
            isUser={p1.id === state.userPlayerId}
            isWinner={lastResult?.winnerId === p1.id}
            isLoser={!!lastResult && lastResult.winnerId !== p1.id}
            align="top"
          />
        </motion.div>

        {/* VS / Result Badge */}
        <div className="relative z-20 -my-2">
          <AnimatePresence mode="wait">
            {isFighting ? (
              <motion.div 
                key="fight"
                initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                animate={{ scale: [1, 1.2, 1], opacity: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="text-5xl md:text-6xl font-black text-[var(--color-cyber-yellow)] glow-text-yellow glitch"
              >
                ⚔️
              </motion.div>
            ) : lastResult ? (
              <motion.div 
                key="result"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={`
                  w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center
                  ${userWon 
                    ? 'bg-gradient-to-br from-[var(--color-cyber-green)] to-[var(--color-cyber-cyan)] glow-cyan' 
                    : 'bg-gradient-to-br from-[var(--color-cyber-red)] to-[var(--color-cyber-pink)] glow-pink'}
                `}
              >
                <span className="text-2xl md:text-3xl font-black text-[var(--color-void)]">
                  {userWon ? 'WIN' : 'LOSE'}
                </span>
              </motion.div>
            ) : (
              <motion.div 
                key="vs"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="relative"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 glass-panel rounded-full flex items-center justify-center border-2 border-[var(--color-cyber-cyan)]/30">
                  <span className="text-xl md:text-2xl font-black text-[var(--color-cyber-cyan)] tracking-widest">VS</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Player 2 (Bottom) */}
        <motion.div 
          animate={isFighting ? { x: [0, 8, -8, 4, -4, 0] } : { x: 0 }}
          transition={{ repeat: isFighting ? Infinity : 0, duration: 0.15 }}
          className="w-full max-w-sm"
        >
          <FighterCard 
            player={p2} 
            wins={getWins(p2, p1)}
            isUser={p2.id === state.userPlayerId}
            isWinner={lastResult?.winnerId === p2.id}
            isLoser={!!lastResult && lastResult.winnerId !== p2.id}
            align="bottom"
          />
        </motion.div>
      </div>

      {/* User Points (Pre-Fight, RR Only) */}
      {!lastResult && !isFighting && state.currentPhase === 'RoundRobin' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pb-4 text-center z-10"
        >
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Your Score</div>
          <div className="text-3xl font-black text-[var(--color-cyber-cyan)] glow-text-cyan">{user?.points}</div>
        </motion.div>
      )}

      {/* Action Buttons - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 z-40 pointer-events-none">
        <div className="flex flex-col items-center gap-3 w-full max-w-md mx-auto pointer-events-auto">
          {!lastResult && !isFighting && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              className="cyber-btn w-full text-lg pulse-glow"
            >
              START BATTLE
            </motion.button>
          )}

          {lastResult && (
            <div className="flex gap-3 w-full">
              <button
                onClick={handleLeaderboard}
                className="flex-1 py-3 px-4 glass-panel text-gray-300 font-bold uppercase tracking-wider text-sm clip-angle-tl hover:text-[var(--color-cyber-cyan)] transition-colors"
              >
                {state.currentPhase === 'RoundRobin' ? 'Standings' : 'Bracket'}
              </button>
              <button
                onClick={handleNextMatch}
                className="flex-1 cyber-btn text-sm"
              >
                Next Match
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface FighterCardProps {
  player: Player;
  wins: number;
  isUser: boolean;
  isWinner?: boolean;
  isLoser?: boolean;
  align: 'top' | 'bottom';
}

const FighterCard: React.FC<FighterCardProps> = ({ player, wins, isUser, isWinner, isLoser, align }) => {
  return (
    <motion.div 
      layout
      className={`
        relative overflow-hidden transition-all duration-500
        ${isWinner ? 'scale-105' : ''}
        ${isLoser ? 'opacity-50 grayscale' : ''}
      `}
    >
      {/* Card Container */}
      <div className={`
        relative glass-panel overflow-hidden
        ${align === 'top' ? 'clip-angle-bl clip-angle-br' : 'clip-angle-tl clip-angle-tr'}
        ${isWinner ? 'border-[var(--color-cyber-green)] glow-cyan' : ''}
        ${isUser && !isWinner ? 'border-[var(--color-cyber-cyan)]/50' : ''}
      `}>
        
        {/* Color Bar */}
        <div className={`absolute ${align === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 h-1 ${isUser ? 'bg-[var(--color-cyber-cyan)]' : 'bg-[var(--color-cyber-pink)]'}`} />
        
        <div className="flex items-center gap-4 p-3">
          {/* Avatar */}
          <div className={`relative w-16 h-16 md:w-20 md:h-20 shrink-0 overflow-hidden ${isUser ? 'holo-frame' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cyber-cyan)]/20 to-transparent" />
            <img 
              src={`/avatars/${player.id}.jpg`} 
              alt={player.name}
              className="w-full h-full object-cover object-top"
              onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${player.name}&background=0B0E14&color=00F0FF` }}
            />
            {isWinner && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-[var(--color-cyber-yellow)] rounded-full flex items-center justify-center text-xs shadow-lg"
              >
                👑
              </motion.div>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg md:text-xl font-black text-white truncate">{player.name}</h3>
              {isUser && (
                <span className="px-2 py-0.5 bg-[var(--color-cyber-cyan)]/20 border border-[var(--color-cyber-cyan)]/50 text-[var(--color-cyber-cyan)] text-[10px] font-bold uppercase rounded">
                  You
                </span>
              )}
            </div>
            
            {/* Wins Power Bar */}
            <div className="flex items-center gap-2">
              <div className="power-bar flex-1">
                <div 
                  className="power-bar-fill" 
                  style={{ width: `${Math.min(wins * 15, 100)}%` }}
                />
              </div>
              <span className={`text-sm font-bold ${wins > 0 ? 'text-[var(--color-cyber-green)]' : 'text-gray-500'}`}>
                {wins}W
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
