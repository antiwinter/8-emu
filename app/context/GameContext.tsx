'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GameState, Player, Match, Phase, KnockoutSeries } from '../types/game';
import { PLAYERS } from '../constants/players';
import { generateRoundRobinSchedule, calculateStandings, simulateMatchWinner } from '../utils/gameLogic';

interface GameContextType {
  state: GameState;
  selectCharacter: (playerId: string) => void;
  playNextMatch: () => void; // Used for "Start Battle" in MatchArea
  startKnockoutBattle: (seriesId: string) => void; // Used to enter Battle Mode from Bracket
  simulateNextKnockoutStep: () => void; // Used for Spectator Mode
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
  currentActiveMatch: null,
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
    // When selecting character, we also want to fast-forward to their first match
    setState(prev => {
      const matches = [...prev.roundRobinMatches];
      
      let index = 0;
      while (index < matches.length) {
        const match = matches[index];
        if (match.player1Id === playerId || match.player2Id === playerId) {
            break;
        }
        // Simulate
        const p1 = prev.players.find(p => p.id === match.player1Id)!;
        const p2 = prev.players.find(p => p.id === match.player2Id)!;
        const winnerId = simulateMatchWinner(p1, p2);
        matches[index] = { ...match, winnerId, isCompleted: true };
        index++;
      }
      
      const updatedPlayers = calculateStandings(prev.players, matches);
      const activeMatch = index < matches.length ? matches[index] : null;

      return {
        ...prev,
        userPlayerId: playerId,
        roundRobinMatches: matches,
        currentMatchIndex: index,
        players: updatedPlayers,
        currentActiveMatch: activeMatch
      };
    });
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

  // Called when "Start Battle" is clicked in MatchArea
  const playNextMatch = () => {
    if (state.currentPhase === 'RoundRobin') {
      resolveRoundRobinMatch();
    } else {
      resolveKnockoutBattle();
    }
  };

  const resolveRoundRobinMatch = () => {
    const { roundRobinMatches, currentMatchIndex, players, userPlayerId } = state;
    
    // 1. Resolve Current User Match
    if (!state.currentActiveMatch) return; 

    const match = state.currentActiveMatch;
    const p1 = players.find(p => p.id === match.player1Id)!;
    const p2 = players.find(p => p.id === match.player2Id)!;
    const winnerId = simulateMatchWinner(p1, p2);
    
    const completedMatch = { ...match, winnerId, isCompleted: true };
    const updatedMatches = [...roundRobinMatches];
    updatedMatches[currentMatchIndex] = completedMatch;

    // 2. Scan forward to next user match
    const nextStartIndex = currentMatchIndex + 1;
    let index = nextStartIndex;
    
    while (index < updatedMatches.length) {
      const m = updatedMatches[index];
      if (userPlayerId && (m.player1Id === userPlayerId || m.player2Id === userPlayerId)) {
        break; // Found next user match
      }
      // Simulate CPU match
      const cp1 = players.find(p => p.id === m.player1Id)!;
      const cp2 = players.find(p => p.id === m.player2Id)!;
      const wId = simulateMatchWinner(cp1, cp2);
      updatedMatches[index] = { ...m, winnerId: wId, isCompleted: true };
      index++;
    }

    const updatedPlayers = calculateStandings(players, updatedMatches);

    // Check if RR finished
    if (index >= updatedMatches.length) {
       // Transition
       transitionToSemis(updatedPlayers, userPlayerId, updatedMatches);
    } else {
       setState(prev => ({
         ...prev,
         players: updatedPlayers,
         roundRobinMatches: updatedMatches,
         currentMatchIndex: index,
         currentActiveMatch: updatedMatches[index]
       }));
    }
  };

  const transitionToSemis = (rankedPlayers: Player[], userPlayerId: string | null, finalMatches: Match[]) => {
    const top4 = rankedPlayers.slice(0, 4);
    
    const s1: KnockoutSeries = {
      id: 'semi-1',
      player1Id: top4[0].id,
      player2Id: top4[3].id,
      player1Wins: 0,
      player2Wins: 0,
      targetWins: 7,
      matches: [],
    };

    const s2: KnockoutSeries = {
      id: 'semi-2',
      player1Id: top4[1].id,
      player2Id: top4[2].id,
      player1Wins: 0,
      player2Wins: 0,
      targetWins: 7,
      matches: [],
    };

    const userQualified = top4.some(p => p.id === userPlayerId);

    setState(prev => ({
      ...prev,
      currentPhase: 'SemiFinals',
      players: rankedPlayers,
      roundRobinMatches: finalMatches,
      currentActiveMatch: null, // Clear active match
      semiFinals: [s1, s2],
      showCelebration: userQualified,
      celebrationMessage: userQualified ? 'Congratulations! You qualified for the Semi-Finals!' : 'Round Robin Finished',
    }));
  };

  // Triggered from Bracket View when user wants to play their series game
  const startKnockoutBattle = (seriesId: string) => {
    const series = [...state.semiFinals, state.final, state.thirdPlace].find(s => s && s.id === seriesId);
    if (!series) return;
    if (series.winnerId) return; // Prevent playing if already won/lost

    // Create a new match object for this game
    const matchId = `${series.id}-m${series.matches.length + 1}`;
    const match: Match = {
        id: matchId,
        player1Id: series.player1Id,
        player2Id: series.player2Id,
        phase: state.currentPhase,
        roundNumber: series.matches.length + 1,
        isCompleted: false
    };

    setState(prev => ({ ...prev, currentActiveMatch: match }));
  };

  const resolveKnockoutBattle = () => {
    const { currentActiveMatch, players, userPlayerId } = state;
    if (!currentActiveMatch) return;

    // 1. Simulate result of User's active match
    const p1 = players.find(p => p.id === currentActiveMatch.player1Id)!;
    const p2 = players.find(p => p.id === currentActiveMatch.player2Id)!;
    const winnerId = simulateMatchWinner(p1, p2);
    
    const completedMatch = { ...currentActiveMatch, winnerId, isCompleted: true };
    const simulatedMatches = [completedMatch];

    // 2. Simulate 1 game for OTHER active series in same phase
    if (state.currentPhase === 'SemiFinals') {
        const otherSeries = state.semiFinals.find(s => !currentActiveMatch.id.startsWith(s.id));
        if (otherSeries && !otherSeries.winnerId) {
             const op1 = players.find(p => p.id === otherSeries.player1Id)!;
             const op2 = players.find(p => p.id === otherSeries.player2Id)!;
             const owId = simulateMatchWinner(op1, op2);
             simulatedMatches.push({
                 id: `${otherSeries.id}-m${otherSeries.matches.length + 1}`,
                 player1Id: otherSeries.player1Id, player2Id: otherSeries.player2Id, phase: 'SemiFinals', roundNumber: otherSeries.matches.length + 1, isCompleted: true, winnerId: owId
             });
        }
    } else if (state.currentPhase === 'Finals') {
        // If playing Final, simulate 3rd Place (and vice versa)
        const isFinal = currentActiveMatch.id.startsWith('final');
        const otherSeries = isFinal ? state.thirdPlace : state.final;
        
        // Note: state.final or state.thirdPlace might be null during transition or if types are loose, but logic guarantees they exist in Finals phase.
        if (otherSeries && !otherSeries.winnerId) {
             const op1 = players.find(p => p.id === otherSeries.player1Id)!;
             const op2 = players.find(p => p.id === otherSeries.player2Id)!;
             const owId = simulateMatchWinner(op1, op2);
             simulatedMatches.push({
                 id: `${otherSeries.id}-m${otherSeries.matches.length + 1}`,
                 player1Id: otherSeries.player1Id, player2Id: otherSeries.player2Id, phase: state.currentPhase === 'Finals' ? (isFinal ? 'ThirdPlace' : 'Finals') : 'Finals', roundNumber: otherSeries.matches.length + 1, isCompleted: true, winnerId: owId
             });
        }
    }

    // Update Series State with all new matches
    updateKnockoutState(null, simulatedMatches);
  };

  const simulateNextKnockoutStep = () => {
    // For spectator mode: Advance all incomplete series by 1 game
    const { semiFinals, final, thirdPlace, players } = state;
    
    // Determine which series to simulate
    // Prioritize Semis if active, then Finals
    let seriesToSimulate: KnockoutSeries[] = [];
    if (state.currentPhase === 'SemiFinals') {
        seriesToSimulate = semiFinals.filter(s => !s.winnerId);
    } else {
        if (final && !final.winnerId) seriesToSimulate.push(final);
        if (thirdPlace && !thirdPlace.winnerId) seriesToSimulate.push(thirdPlace);
    }

    if (seriesToSimulate.length === 0) return;

    // Simulate 1 game for each active series
    const simulatedMatches: Match[] = [];
    
    seriesToSimulate.forEach(s => {
         const p1 = players.find(p => p.id === s.player1Id)!;
         const p2 = players.find(p => p.id === s.player2Id)!;
         const winnerId = simulateMatchWinner(p1, p2);
         simulatedMatches.push({
             id: `${s.id}-m${s.matches.length + 1}`,
             player1Id: s.player1Id, player2Id: s.player2Id, phase: state.currentPhase, roundNumber: s.matches.length + 1, isCompleted: true, winnerId
         });
    });

    // Batch update
    updateKnockoutState(null, simulatedMatches);
  };

  const updateKnockoutState = (singleCompletedMatch: Match | null, batchMatches: Match[] = []) => {
      setState(prev => {
          let newState = { ...prev, currentActiveMatch: null };
          const matchesToProcess = singleCompletedMatch ? [singleCompletedMatch] : batchMatches;

          // Helper to update a series
          const updateSeries = (series: KnockoutSeries) => {
              const matchForSeries = matchesToProcess.find(m => m.id.startsWith(series.id));
              if (!matchForSeries) return series;

              const newSeries = { ...series };
              newSeries.matches = [...series.matches, matchForSeries];
              if (matchForSeries.winnerId === series.player1Id) newSeries.player1Wins++;
              else newSeries.player2Wins++;

              if (newSeries.player1Wins >= newSeries.targetWins) newSeries.winnerId = series.player1Id;
              if (newSeries.player2Wins >= newSeries.targetWins) newSeries.winnerId = series.player2Id;
              
              return newSeries;
          };

          // Update Semis
          if (newState.currentPhase === 'SemiFinals') {
              newState.semiFinals = newState.semiFinals.map(updateSeries);
              
              // Check transition to Finals
              if (newState.semiFinals.every(s => s.winnerId)) {
                  const s1 = newState.semiFinals[0];
                  const s2 = newState.semiFinals[1];
                  const s1Winner = s1.winnerId!;
                  const s1Loser = s1.winnerId === s1.player1Id ? s1.player2Id : s1.player1Id;
                  const s2Winner = s2.winnerId!;
                  const s2Loser = s2.winnerId === s2.player1Id ? s2.player2Id : s2.player1Id;

                  newState.final = { id: 'final', player1Id: s1Winner, player2Id: s2Winner, player1Wins: 0, player2Wins: 0, targetWins: 5, matches: [] };
                  newState.thirdPlace = { id: '3rd-place', player1Id: s1Loser, player2Id: s2Loser, player1Wins: 0, player2Wins: 0, targetWins: 5, matches: [] };
                  newState.currentPhase = 'Finals';
                  
                  const userWonSemis = newState.semiFinals.some(s => s.winnerId === newState.userPlayerId);
                  if (userWonSemis) {
                      newState.showCelebration = true;
                      newState.celebrationMessage = 'Incredible! You made it to the Grand Final!';
                  }
              }
          } else {
              // Update Finals/3rd Place
              if (newState.final) newState.final = updateSeries(newState.final);
              if (newState.thirdPlace) newState.thirdPlace = updateSeries(newState.thirdPlace);

              // Check Champion
              if (newState.final?.winnerId && !prev.final?.winnerId) {
                   if (newState.final.winnerId === newState.userPlayerId) {
                       newState.showCelebration = true;
                       newState.celebrationMessage = 'CHAMPION! You have won the tournament!';
                   } else {
                       const winnerName = newState.players.find(p => p.id === newState.final?.winnerId)?.name;
                       newState.showCelebration = true;
                       newState.celebrationMessage = `Tournament Over. ${winnerName} is the Champion.`;
                   }
              }
          }

          return newState;
      });
  };

  return (
    <GameContext.Provider value={{ state, selectCharacter, playNextMatch, startKnockoutBattle, simulateNextKnockoutStep, resetGame, closeCelebration }}>
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
