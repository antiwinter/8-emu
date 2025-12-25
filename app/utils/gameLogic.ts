import { Match, Player, Phase } from '../types/game';

// Simulate a match winner based on strength
// Higher strength has higher probability to win
// Formula: P(A wins) = StrengthA / (StrengthA + StrengthB)
export const simulateMatchWinner = (player1: Player, player2: Player): string => {
  const totalStrength = player1.strength + player2.strength;
  const p1Chance = player1.strength / totalStrength;
  const random = Math.random();
  
  return random < p1Chance ? player1.id : player2.id;
};

// Fixed Schedule Pattern based on the provided image/rules
// R1: 1-2, 3-4, 5-6 (7 Bye)
// R2: 1-3, 2-4, 5-7 (6 Bye)
// R3: 1-4, 2-3, 6-7 (5 Bye)
// R4: 1-5, 2-6, 4-7 (3 Bye)
// R5: 1-6, 2-5, 3-7 (4 Bye)
// R6: 1-7, 3-6, 4-5 (2 Bye)
// R7: 2-7, 3-5, 4-6 (1 Bye)
const SCHEDULE_ROUNDS = [
  [['1', '2'], ['3', '4'], ['5', '6']], 
  [['1', '3'], ['2', '4'], ['5', '7']], 
  [['1', '4'], ['2', '3'], ['6', '7']], 
  [['1', '5'], ['2', '6'], ['4', '7']], 
  [['1', '6'], ['2', '5'], ['3', '7']], 
  [['1', '7'], ['3', '6'], ['4', '5']], 
  [['2', '7'], ['3', '5'], ['4', '6']]
];

// Generate Round Robin Schedule
// Each pair plays 2 rounds
export const generateRoundRobinSchedule = (players: Player[]): Match[] => {
  const matches: Match[] = [];
  let matchIdCounter = 1;

  SCHEDULE_ROUNDS.forEach((roundPairs, roundIndex) => {
      const roundNum = roundIndex + 1;
      
      roundPairs.forEach(pair => {
          const [id1, id2] = pair;
          
          // Ensure players exist (sanity check)
          const p1 = players.find(p => p.id === id1);
          const p2 = players.find(p => p.id === id2);
          
          if (p1 && p2) {
              // Game 1
              matches.push({
                id: `rr-${matchIdCounter++}`,
                player1Id: id1,
                player2Id: id2,
                phase: 'RoundRobin',
                roundNumber: roundNum,
                gameNumber: 1,
                isCompleted: false,
              });

              // Game 2
              matches.push({
                id: `rr-${matchIdCounter++}`,
                player1Id: id2, // Swap home/away visually if needed, but technically same pair
                player2Id: id1,
                phase: 'RoundRobin',
                roundNumber: roundNum,
                gameNumber: 2,
                isCompleted: false,
              });
          }
      });
  });

  return matches;
};

// Calculate Standings
export const calculateStandings = (players: Player[], matches: Match[]): Player[] => {
  // Reset points
  const playersWithPoints = players.map(p => ({ ...p, points: 0 }));
  
  matches.filter(m => m.isCompleted && m.winnerId).forEach(match => {
    const winner = playersWithPoints.find(p => p.id === match.winnerId);
    if (winner) {
      winner.points += 1;
    }
  });

  // Sort by points (descending)
  return playersWithPoints.sort((a, b) => b.points - a.points);
};
