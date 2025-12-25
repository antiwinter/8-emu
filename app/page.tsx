'use client';

import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { StartScreen } from './components/StartScreen';
import { Scoreboard } from './components/Scoreboard';
import { MatchArea } from './components/MatchArea';
import { Bracket } from './components/Bracket';
import { CelebrationModal } from './components/CelebrationModal';

const GameContainer = () => {
  const { state } = useGame();

  if (!state.userPlayerId) {
    return <StartScreen />;
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col p-4 md:p-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-yellow-500">Tournament Emulator</h1>
        <div className="text-sm text-gray-400">
          Phase: <span className="text-white font-bold">{state.currentPhase}</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center">
        {state.currentPhase === 'RoundRobin' ? (
          <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
            <div className="md:w-1/3 order-2 md:order-1">
              <Scoreboard />
            </div>
            <div className="md:w-2/3 order-1 md:order-2 flex justify-center">
              <MatchArea />
            </div>
          </div>
        ) : (
          <Bracket />
        )}
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
