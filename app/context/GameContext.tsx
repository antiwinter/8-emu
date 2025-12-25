'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { GameState, Player, Match, Phase, KnockoutSeries } from '../types/game';
import { PLAYERS } from '../constants/players';
import { generateRoundRobinSchedule, calculateStandings, simulateMatchWinner } from '../utils/gameLogic';

interface GameContextType {
  state: GameState;
  selectCharacter: (playerId: string) => void;
  playNextMatch: () => void;
  resetGame: () => void;
  closeCelebration: () => void;
}

const initialState: GameState = {
  currentPhase: 'RoundRobin',
  players: PLAYERS,
  userPlayerId: null,
  roundRobinMatches: [],
  currentMatchIndex: 0,
  semiFinals: [],
  final: null,
  thirdPlace: null,
  showCelebration: false,
  celebrationMessage: '',
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(initialState);

  // Initialize Round Robin matches on load
  useEffect(() => {
    if (state.roundRobinMatches.length === 0) {
      const matches = generateRoundRobinSchedule(state.players);
      setState(prev => ({ ...prev, roundRobinMatches: matches }));
    }
  }, []);

  const selectCharacter = (playerId: string) => {
    setState(prev => ({ ...prev, userPlayerId: playerId }));
  };

  const closeCelebration = () => {
    setState(prev => ({ ...prev, showCelebration: false }));
  };

  const resetGame = () => {
    const matches = generateRoundRobinSchedule(PLAYERS);
    setState({
      ...initialState,
      roundRobinMatches: matches,
    });
  };

  const playNextMatch = () => {
    if (state.currentPhase === 'RoundRobin') {
      handleRoundRobinMatch();
    } else {
      handleKnockoutMatch();
    }
  };

  const handleRoundRobinMatch = () => {
    const { roundRobinMatches, currentMatchIndex, players, userPlayerId } = state;
    
    if (currentMatchIndex >= roundRobinMatches.length) return; // Should not happen if transitions are correct

    const match = roundRobinMatches[currentMatchIndex];
    const p1 = players.find(p => p.id === match.player1Id)!;
    const p2 = players.find(p => p.id === match.player2Id)!;

    const winnerId = simulateMatchWinner(p1, p2);
    
    const updatedMatch = { ...match, winnerId, isCompleted: true };
    const updatedMatches = [...roundRobinMatches];
    updatedMatches[currentMatchIndex] = updatedMatch;

    // Update player points
    const updatedPlayers = calculateStandings(players, updatedMatches);

    // Check if Round Robin is finished
    if (currentMatchIndex === roundRobinMatches.length - 1) {
      // Transition to Semis
      transitionToSemis(updatedPlayers, userPlayerId);
    } else {
       // Just next match
       setState(prev => ({
         ...prev,
         players: updatedPlayers,
         roundRobinMatches: updatedMatches,
         currentMatchIndex: prev.currentMatchIndex + 1
       }));
    }
  };

  const transitionToSemis = (rankedPlayers: Player[], userPlayerId: string | null) => {
    // Top 4 qualify
    const top4 = rankedPlayers.slice(0, 4);
    
    // Semis: 1st vs 4th, 2nd vs 3rd
    const s1: KnockoutSeries = {
      id: 'semi-1',
      player1Id: top4[0].id,
      player2Id: top4[3].id,
      player1Wins: 0,
      player2Wins: 0,
      targetWins: 4, // Best of 7 means first to 4 wins? User said "who first win 7 round" -> Target 7
      matches: [],
    };

    const s2: KnockoutSeries = {
      id: 'semi-2',
      player1Id: top4[1].id,
      player2Id: top4[2].id,
      player1Wins: 0,
      player2Wins: 0,
      targetWins: 4, // Actually User said "who first win 7 round" explicitly. Wait, let me check the requirement again. 
      // Req: "who first win 7 round, win". 
      // Usually "first to 7" means target is 7.
      // Re-reading: "target wins 7"
      matches: [],
    };
    
    // Correcting target wins to 7 based on user prompt "first win 7 round"
    s1.targetWins = 7;
    s2.targetWins = 7;

    const userQualified = top4.some(p => p.id === userPlayerId);

    setState(prev => ({
      ...prev,
      currentPhase: 'SemiFinals',
      players: rankedPlayers,
      semiFinals: [s1, s2],
      showCelebration: userQualified,
      celebrationMessage: userQualified ? 'Congratulations! You qualified for the Semi-Finals!' : 'Round Robin Finished',
    }));
  };

  const handleKnockoutMatch = () => {
    const { currentPhase, semiFinals, final, thirdPlace, players, userPlayerId } = state;
    let newState = { ...state };
    let showCeleb = false;
    let celebMsg = '';

    if (currentPhase === 'SemiFinals') {
      // Play one game for each unfinished series
      const updatedSemis = semiFinals.map(series => {
        if (series.winnerId) return series;

        const p1 = players.find(p => p.id === series.player1Id)!;
        const p2 = players.find(p => p.id === series.player2Id)!;
        const winnerId = simulateMatchWinner(p1, p2);

        const newSeries = { ...series };
        if (winnerId === series.player1Id) newSeries.player1Wins++;
        else newSeries.player2Wins++;

        newSeries.matches.push({
          id: `${series.id}-m${series.matches.length + 1}`,
          player1Id: series.player1Id,
          player2Id: series.player2Id,
          winnerId,
          phase: 'SemiFinals',
          roundNumber: series.matches.length + 1,
          isCompleted: true
        });

        if (newSeries.player1Wins >= newSeries.targetWins) newSeries.winnerId = series.player1Id;
        if (newSeries.player2Wins >= newSeries.targetWins) newSeries.winnerId = series.player2Id;

        return newSeries;
      });

      newState.semiFinals = updatedSemis;

      // Check if both semis are done
      if (updatedSemis.every(s => s.winnerId)) {
        // Setup Finals
        const s1Winner = updatedSemis[0].winnerId!;
        const s1Loser = updatedSemis[0].winnerId === updatedSemis[0].player1Id ? updatedSemis[0].player2Id : updatedSemis[0].player1Id;
        
        const s2Winner = updatedSemis[1].winnerId!;
        const s2Loser = updatedSemis[1].winnerId === updatedSemis[1].player1Id ? updatedSemis[1].player2Id : updatedSemis[1].player1Id;

        const grandFinal: KnockoutSeries = {
            id: 'final',
            player1Id: s1Winner,
            player2Id: s2Winner,
            player1Wins: 0,
            player2Wins: 0,
            targetWins: 5, // Rule 5: first win 5 rounds
            matches: []
        };

        const thirdPlaceMatch: KnockoutSeries = {
            id: '3rd-place',
            player1Id: s1Loser,
            player2Id: s2Loser,
            player1Wins: 0,
            player2Wins: 0,
            targetWins: 5, // Rule 6: first win 5 rounds
            matches: []
        };

        newState.final = grandFinal;
        newState.thirdPlace = thirdPlaceMatch;
        newState.currentPhase = 'Finals'; // Represents both Finals and 3rd Place ongoing
        
        const userWonSemis = updatedSemis.some(s => s.winnerId === userPlayerId);
        if (userWonSemis) {
            showCeleb = true;
            celebMsg = 'Incredible! You made it to the Grand Final!';
        }
      }
    } else if (currentPhase === 'Finals') {
        // Play final and 3rd place concurrently or sequentially? "Next turn" implies one step.
        // Let's progress both series one game if not finished.
        
        if (newState.final && !newState.final.winnerId) {
             const f = newState.final;
             const p1 = players.find(p => p.id === f.player1Id)!;
             const p2 = players.find(p => p.id === f.player2Id)!;
             const winnerId = simulateMatchWinner(p1, p2);
             
             f.matches.push({
                 id: `final-m${f.matches.length + 1}`,
                 player1Id: f.player1Id, player2Id: f.player2Id, winnerId, phase: 'Finals', roundNumber: f.matches.length + 1, isCompleted: true
             });
             
             if (winnerId === f.player1Id) f.player1Wins++; else f.player2Wins++;
             if (f.player1Wins >= f.targetWins) f.winnerId = f.player1Id;
             if (f.player2Wins >= f.targetWins) f.winnerId = f.player2Id;
        }

        if (newState.thirdPlace && !newState.thirdPlace.winnerId) {
             const t = newState.thirdPlace;
             const p1 = players.find(p => p.id === t.player1Id)!;
             const p2 = players.find(p => p.id === t.player2Id)!;
             const winnerId = simulateMatchWinner(p1, p2);
             
             t.matches.push({
                 id: `3rd-m${t.matches.length + 1}`,
                 player1Id: t.player1Id, player2Id: t.player2Id, winnerId, phase: 'ThirdPlace', roundNumber: t.matches.length + 1, isCompleted: true
             });
             
             if (winnerId === t.player1Id) t.player1Wins++; else t.player2Wins++;
             if (t.player1Wins >= t.targetWins) t.winnerId = t.player1Id;
             if (t.player2Wins >= t.targetWins) t.winnerId = t.player2Id;
        }

        // Check for Champion
        if (newState.final?.winnerId && !state.final?.winnerId) {
             if (newState.final.winnerId === userPlayerId) {
                 showCeleb = true;
                 celebMsg = 'CHAMPION! You have won the tournament!';
             } else {
                 showCeleb = true;
                 const winnerName = players.find(p => p.id === newState.final?.winnerId)?.name;
                 celebMsg = `Tournament Over. ${winnerName} is the Champion.`;
             }
        }
    }

    if (showCeleb) {
        newState.showCelebration = true;
        newState.celebrationMessage = celebMsg;
    }

    setState(newState);
  };

  return (
    <GameContext.Provider value={{ state, selectCharacter, playNextMatch, resetGame, closeCelebration }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

