export interface Scores {
  phase1: number;
  phase2: number;
  phase3: number;
  phase4: number;
  total: number;
}

export interface PlayerScore {
  playerId: string;
  scores: Scores;
  bonus?: number;
}

export function calculatePhase1Score(
  answersSubmitted: boolean[],
  citizenMatches: Map<string, string[]>
): number {
  let score = 0;
  
  // +10 per valid submission
  answersSubmitted.forEach(submitted => {
    if (submitted) score += 10;
  });
  
  // +15 per citizen match
  citizenMatches.forEach((matches, playerId) => {
    if (matches.length > 0) {
      score += matches.length * 15;
    }
  });
  
  return score;
}

export function calculatePhase2Score(
  questionsSent: number,
  correctInterrogations: number
): number {
  return questionsSent * 5 + correctInterrogations * 30;
}

export function calculatePhase4Score(
  isTraitor: boolean,
  votedCorrectly: boolean,
  traitorVotedOut: boolean,
  totalPlayers: number,
  wrongVotesOnTraitor: number
): number {
  if (isTraitor) {
    // Traitor survival bonus
    if (!traitorVotedOut) {
      return 150;
    }
    // Traitor unmasked compensation
    return Math.min(wrongVotesOnTraitor * 10, 70);
  }
  
  // Citizen scoring
  let score = 0;
  if (votedCorrectly && traitorVotedOut) {
    score += 100;
  }
  
  return score;
}

export function calculateTotalScore(scores: Scores): number {
  return scores.phase1 + scores.phase2 + scores.phase3 + scores.phase4;
}

export function getLeaderboard(players: PlayerScore[]): PlayerScore[] {
  return [...players].sort((a, b) => 
    calculateTotalScore(b.scores) - calculateTotalScore(a.scores)
  );
}
