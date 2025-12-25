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

  // View Logic
  // 1. If there is an active match (Battle Mode), show MatchArea
  if (state.currentActiveMatch) {
      return (
        <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
             {/* If in Round Robin, show Scoreboard on side? Maybe too crowded on mobile. 
                 Let's keep it focused on the fight. */}
             <div className="w-full max-w-6xl flex flex-col items-center">
                <MatchArea />
                
                {state.currentPhase === 'RoundRobin' && (
                    <div className="mt-8">
                        <Scoreboard />
                    </div>
                )}
             </div>
             <CelebrationModal />
        </main>
      );
  }

  // 2. Round Robin Dashboard (Between matches, or if finished but not transitioned yet?)
  // Actually context handles transition immediately. 
  // If we are here in RR phase, it means no active match. 
  // This likely means we are waiting or simulating.
  if (state.currentPhase === 'RoundRobin') {
       return (
        <main className="min-h-screen bg-gray-900 text-white flex flex-col p-4 md:p-8">
            <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
                <h1 className="text-2xl font-bold text-yellow-500">Tournament Emulator</h1>
                <div className="text-sm text-gray-400">
                Phase: <span className="text-white font-bold">{state.currentPhase}</span>
                </div>
            </header>
            <div className="flex-1 flex flex-col items-center justify-center">
                 <div className="text-xl text-gray-400 animate-pulse mb-8">
                     Simulating matches...
                 </div>
                 <Scoreboard />
            </div>
            <CelebrationModal />
        </main>
       );
  }

  // 3. Knockout Bracket View
  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col p-4 md:p-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-yellow-500">Tournament Emulator</h1>
        <div className="text-sm text-gray-400">
          Phase: <span className="text-white font-bold">{state.currentPhase}</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center">
        <Bracket />
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
