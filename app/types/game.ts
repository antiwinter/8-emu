export type Phase = 'RoundRobin' | 'SemiFinals' | 'Finals' | 'ThirdPlace';

export interface Player {
  id: string;
  name: string;
  strength: number; // 0-100, affects win probability
  points: number; // For Round Robin
  avatar?: string;
}

export interface Match {
  id: string;
  player1Id: string;
  player2Id: string;
  winnerId?: string;
  phase: Phase;
  roundNumber: number; // 1-7 for RoundRobin, or series game number for Knockout
  gameNumber?: number; // 1 or 2 (Round Robin only, to denote 1st/2nd game vs same opponent)
  isCompleted: boolean;
}

export interface KnockoutSeries {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Wins: number;
  player2Wins: number;
  targetWins: number; // 7 for Semis, 5 for Finals
  winnerId?: string;
  matches: Match[];
}

export interface GameState {
  currentPhase: Phase;
  players: Player[];
  userPlayerId: string | null;
  
  // Round Robin State
  roundRobinMatches: Match[];
  currentMatchIndex: number;
  
  // Knockout State
  semiFinals: KnockoutSeries[]; // 2 series
  final: KnockoutSeries | null;
  thirdPlace: KnockoutSeries | null;
  
  // Active Match (for Battle View)
  currentActiveMatch: Match | null; // If set, show MatchArea
  
  // UI State
  showCelebration: boolean;
  celebrationMessage: string;
}
