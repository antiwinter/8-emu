'use client';

import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { StartScreen } from './components/StartScreen';
import { MatchArea } from './components/MatchArea';
import { Bracket } from './components/Bracket';
import { Leaderboard } from './components/Leaderboard';
import { CelebrationModal } from './components/CelebrationModal';
import { motion, AnimatePresence } from 'framer-motion';

const GameContainer = () => {
  const { state } = useGame();

  if (!state.userPlayerId) {
    return <StartScreen />;
  }

  const renderContent = () => {
      switch (state.uiView) {
          case 'match':
              return <MatchArea key="match" />;
          case 'leaderboard':
              return <Leaderboard key="leaderboard" />;
          case 'bracket':
              return <Bracket key="bracket" />;
          default:
              return <MatchArea key="default" />;
      }
  };

  const getPhaseLabel = () => {
    switch (state.currentPhase) {
      case 'RoundRobin': return 'ROUND ROBIN';
      case 'SemiFinals': return 'SEMI FINALS';
      case 'Finals': return 'FINALS';
      default: return state.currentPhase;
    }
  };

  return (
    <main className="min-h-screen min-h-[100dvh] w-full flex flex-col relative overflow-hidden">
      
      {/* Top Nav Bar */}
      <header className="flex justify-between items-center px-4 py-3 glass-panel z-50 sticky top-0 border-b border-[var(--color-glass-border)]">
        <h1 className="text-lg font-black text-[var(--color-cyber-cyan)] tracking-widest">
          ARENA
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-gray-500">Phase</span>
          <span className="px-2 py-1 bg-[var(--color-cyber-cyan)]/10 border border-[var(--color-cyber-cyan)]/30 rounded text-xs font-bold text-[var(--color-cyber-cyan)]">
            {getPhaseLabel()}
          </span>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 flex flex-col w-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.uiView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex-1 flex flex-col"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <CelebrationModal />
    </main>
  );
};

export default function Home() {
  return (
    <GameProvider>
      <GameContainer />
    </GameProvider>
  );
}
