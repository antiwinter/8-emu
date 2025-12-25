'use client';

import React from 'react';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';

export const Leaderboard: React.FC = () => {
  const { state, setView } = useGame();

  const handleBack = () => {
      if (state.currentPhase === 'RoundRobin') {
          setView('match');
      } else {
          setView('bracket');
      }
  };

  const sortedPlayers = [...state.players].sort((a, b) => b.points - a.points);
  const isTournamentOver = !!state.final?.winnerId;
  const isKnockout = state.currentPhase !== 'RoundRobin';

  const matchHistory = [
      ...state.roundRobinMatches,
      ...(state.semiFinals.flatMap(s => s.matches) || []),
      ...(state.final?.matches || []),
      ...(state.thirdPlace?.matches || [])
  ].filter(m => m.isCompleted);

  const getPlayerName = (id: string) => state.players.find(p => p.id === id)?.name || id;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="flex flex-col w-full min-h-screen p-4 pb-32 relative">
      
      {/* Ambient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[var(--color-cyber-yellow)] opacity-5 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6 z-10"
      >
        <h2 className="text-2xl font-black text-[var(--color-cyber-yellow)] glow-text-yellow tracking-wider">
          STANDINGS
        </h2>
        <button 
          onClick={handleBack}
          className="px-4 py-2 glass-panel text-gray-400 hover:text-[var(--color-cyber-cyan)] text-sm font-bold uppercase tracking-wider transition-colors clip-angle-tr"
        >
          Continue
        </button>
      </motion.div>

      <div className="space-y-6 z-10 max-w-lg mx-auto w-full">
        
        {/* Champion Podium */}
        {isTournamentOver && state.final?.winnerId && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative glass-panel rounded-2xl p-6 overflow-hidden border border-[var(--color-cyber-yellow)]/30"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-cyber-yellow)]/10 to-transparent pointer-events-none" />
            
            <h3 className="text-xs font-bold text-[var(--color-cyber-yellow)] uppercase tracking-[0.3em] text-center mb-6">
              CHAMPIONS
            </h3>
            
            <div className="flex justify-center items-end gap-4 h-44 relative">
              {/* 2nd Place */}
              <div className="flex flex-col items-center z-10">
                <div className="w-12 h-12 rounded-lg overflow-hidden mb-2 ring-2 ring-gray-500">
                  <img src={`/avatars/${state.final.winnerId === state.final.player1Id ? state.final.player2Id : state.final.player1Id}.jpg`} className="w-full h-full object-cover"/>
                </div>
                <span className="text-[10px] text-gray-400 mb-1 truncate max-w-[60px]">
                  {getPlayerName(state.final.winnerId === state.final.player1Id ? state.final.player2Id : state.final.player1Id)}
                </span>
                <div className="w-16 h-20 bg-gradient-to-t from-gray-700 to-gray-600 rounded-t-lg flex items-center justify-center">
                  <span className="text-2xl font-black text-gray-400">2</span>
                </div>
              </div>
              
              {/* 1st Place */}
              <div className="flex flex-col items-center z-10">
                <div className="text-3xl mb-1">👑</div>
                <div className="w-14 h-14 rounded-lg overflow-hidden mb-2 ring-2 ring-[var(--color-cyber-yellow)] shadow-[0_0_20px_rgba(255,215,0,0.5)]">
                  <img src={`/avatars/${state.final.winnerId}.jpg`} className="w-full h-full object-cover"/>
                </div>
                <span className="text-xs text-[var(--color-cyber-yellow)] font-bold mb-1 truncate max-w-[70px]">
                  {getPlayerName(state.final.winnerId)}
                </span>
                <div className="w-20 h-28 bg-gradient-to-t from-[var(--color-cyber-yellow)] to-yellow-500 rounded-t-lg flex items-center justify-center shadow-lg">
                  <span className="text-4xl font-black text-[var(--color-void)]">1</span>
                </div>
              </div>
              
              {/* 3rd Place */}
              {state.thirdPlace?.winnerId && (
                <div className="flex flex-col items-center z-10">
                  <div className="w-12 h-12 rounded-lg overflow-hidden mb-2 ring-2 ring-orange-600">
                    <img src={`/avatars/${state.thirdPlace.winnerId}.jpg`} className="w-full h-full object-cover"/>
                  </div>
                  <span className="text-[10px] text-gray-400 mb-1 truncate max-w-[60px]">
                    {getPlayerName(state.thirdPlace.winnerId)}
                  </span>
                  <div className="w-16 h-14 bg-gradient-to-t from-orange-800 to-orange-700 rounded-t-lg flex items-center justify-center">
                    <span className="text-xl font-black text-orange-300">3</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Top 4 Qualifiers */}
        {isKnockout && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-panel rounded-xl p-4"
          >
            <h3 className="text-xs font-bold text-[var(--color-cyber-cyan)] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-6 h-[1px] bg-[var(--color-cyber-cyan)]/50" />
              Top 4 Qualifiers
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {sortedPlayers.slice(0, 4).map((p, i) => (
                <div key={p.id} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <span className="text-xs font-bold text-[var(--color-cyber-cyan)] w-4">#{i+1}</span>
                  <img src={`/avatars/${p.id}.jpg`} className="w-6 h-6 rounded object-cover" />
                  <span className="text-sm font-bold text-white truncate flex-1">{p.name}</span>
                  <span className="text-xs font-mono text-gray-400">{p.points}pts</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Full Standings */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-xl p-4"
        >
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <span className="w-6 h-[1px] bg-gray-600" />
            All Players
          </h3>
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-1">
            {sortedPlayers.map((player, index) => (
              <motion.div 
                key={player.id}
                variants={item}
                className={`
                  grid grid-cols-[24px_32px_1fr_48px] gap-2 items-center p-2 rounded-lg transition-colors
                  ${player.id === state.userPlayerId ? 'bg-[var(--color-cyber-cyan)]/10 border border-[var(--color-cyber-cyan)]/30' : 'hover:bg-white/5'}
                `}
              >
                <span className={`text-xs font-mono font-bold text-center ${index < 4 ? 'text-[var(--color-cyber-green)]' : 'text-gray-600'}`}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <img src={`/avatars/${player.id}.jpg`} className="w-7 h-7 rounded object-cover" />
                <span className="text-sm font-bold text-white truncate">
                  {player.name}
                  {player.id === state.userPlayerId && <span className="ml-1 text-[10px] text-[var(--color-cyber-cyan)]">(YOU)</span>}
                </span>
                <span className="text-sm font-mono font-bold text-[var(--color-cyber-yellow)] text-right">{player.points}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Match History */}
        {matchHistory.length > 0 && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-panel rounded-xl p-4"
          >
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-6 h-[1px] bg-gray-600" />
              Match Log
            </h3>
            <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
              {matchHistory.slice().reverse().slice(0, 20).map((m) => {
                const p1Name = getPlayerName(m.player1Id);
                const p2Name = getPlayerName(m.player2Id);
                const isUserInvolved = m.player1Id === state.userPlayerId || m.player2Id === state.userPlayerId;
                const userWon = isUserInvolved && m.winnerId === state.userPlayerId;
                
                return (
                  <div 
                    key={m.id} 
                    className={`
                      flex items-center gap-2 p-2 rounded text-xs
                      ${isUserInvolved ? (userWon ? 'bg-[var(--color-cyber-green)]/10' : 'bg-[var(--color-cyber-red)]/10') : 'bg-white/5'}
                    `}
                  >
                    <span className="font-mono text-[10px] text-gray-600 w-14 shrink-0">{m.phase.slice(0, 2)}-R{m.roundNumber}</span>
                    <span className={m.winnerId === m.player1Id ? 'text-[var(--color-cyber-green)] font-bold' : 'text-gray-500'}>{p1Name}</span>
                    <span className="text-gray-700 text-[10px]">vs</span>
                    <span className={m.winnerId === m.player2Id ? 'text-[var(--color-cyber-green)] font-bold' : 'text-gray-500'}>{p2Name}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
