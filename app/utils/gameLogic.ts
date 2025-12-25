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

// Generate Round Robin Schedule
// Each pair plays 2 rounds
export const generateRoundRobinSchedule = (players: Player[]): Match[] => {
  const matches: Match[] = [];
  let matchIdCounter = 1;

  // Round 1: Everyone plays everyone once
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      matches.push({
        id: `rr-${matchIdCounter++}`,
        player1Id: players[i].id,
        player2Id: players[j].id,
        phase: 'RoundRobin',
        roundNumber: 1, // First encounter
        isCompleted: false,
      });
    }
  }

  // Round 2: Everyone plays everyone again
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      matches.push({
        id: `rr-${matchIdCounter++}`,
        player1Id: players[j].id, // Swap home/away if desired, though logic is symmetric
        player2Id: players[i].id,
        phase: 'RoundRobin',
        roundNumber: 2, // Second encounter
        isCompleted: false,
      });
    }
  }

  // Shuffle matches slightly or keep them ordered? 
  // For better UX, maybe shuffle them so the same player doesn't play back-to-back too often
  // But for simplicity, we'll simple shuffle array
  return matches.sort(() => Math.random() - 0.5);
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

