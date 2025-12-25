'use client';

import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { StartScreen } from './components/StartScreen';
import { MatchArea } from './components/MatchArea';
import { Bracket } from './components/Bracket';
import { Leaderboard } from './components/Leaderboard';
import { CelebrationModal } from './components/CelebrationModal';

const GameContainer = () => {
  const { state } = useGame();

  if (!state.userPlayerId) {
    return <StartScreen />;
  }

  const renderContent = () => {
      switch (state.uiView) {
          case 'match':
              return <MatchArea />;
          case 'leaderboard':
              return <Leaderboard />;
          case 'bracket':
              return <Bracket />;
          default:
              return <MatchArea />;
      }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col p-4 md:p-8">
      {/* Header (Visible on all pages except StartScreen) */}
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-yellow-500">Tournament Emulator</h1>
        <div className="flex flex-col items-end text-sm text-gray-400">
          <div>Phase: <span className="text-white font-bold">{state.currentPhase}</span></div>
          {state.uiView === 'match' && state.currentPhase === 'RoundRobin' && state.roundRobinMatches.length > 0 && (
             <div>Progress: {Math.min(state.currentMatchIndex + 1, state.roundRobinMatches.length)} / {state.roundRobinMatches.length}</div>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center w-full">
         {renderContent()}
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
