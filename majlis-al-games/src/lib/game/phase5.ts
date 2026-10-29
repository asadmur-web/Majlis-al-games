export interface PlayerFinalScore {
  playerId: string;
  playerName: string;
  totalScore: number;
  phaseScores: {
    phase1: number;
    phase2: number;
    phase3: number;
    phase4: number;
  };
  rank: number;
  traitorRevealed: boolean;
}

export interface CinematicRevealSession {
  roomCode: string;
  players: Map<string, PlayerFinalScore>;
  traitorId: string;
  gameCompleted: boolean;
  revealStarted: number;
  revealDuration: number; // in seconds
}

export class Phase5Manager {
  private readonly REVEAL_DURATION = 5; // 5 seconds for cinematic reveal

  initSession(
    roomCode: string,
    players: Map<string, { id: string; name: string; role: 'citizen' | 'traitor'; phaseScores: { phase1: number; phase2: number; phase3: number; phase4: number } }>,
    traitorId: string
  ): CinematicRevealSession {
    // Calculate final scores and ranks
    const playerScores: PlayerFinalScore[] = [];

    const allPlayers = players;
    let rank = 1;

    // This would normally aggregate from phase managers, here we initialize with zeros
    allPlayers.forEach((player, id) => {
      const totalScore = (player.phaseScores.phase1 ||
        player.phaseScores.phase2 ||
        player.phaseScores.phase3 ||
        player.phaseScores.phase4 || 0);

      playerScores.push({
        playerId: id,
        playerName: player.name,
        totalScore: totalScore,
        phaseScores: {
          phase1: player.phaseScores.phase1 || 0,
          phase2: player.phaseScores.phase2 || 0,
          phase3: player.phaseScores.phase3 || 0,
          phase4: player.phaseScores.phase4 || 0,
        },
        rank: rank++,
        traitorRevealed: id === traitorId,
      });
    });

    // Sort by total score descending
    playerScores.sort((a, b) => b.totalScore - a.totalScore);

    // Assign ranks
    playerScores.forEach((player, index) => {
      player.rank = index + 1;
    });

    const session: CinematicRevealSession = {
      roomCode,
      players: new Map(playerScores.map(p => [p.playerId, p])),
      traitorId,
      gameCompleted: false,
      revealStarted: 0,
      revealDuration: this.REVEAL_DURATION,
    };

    return session;
  }

  startReveal(session: CinematicRevealSession): CinematicRevealSession {
    session.revealStarted = Date.now();
    session.gameCompleted = false;
    return session;
  }

  updateRevealTimer(session: CinematicRevealSession): CinematicRevealSession {
    const elapsed = (Date.now() - session.revealStarted) / 1000;
    session.revealStarted = Date.now(); // Reset for next tick
    // In production, would track actual elapsed time

    // After revealDuration seconds, mark as completed
    // For now, just return session
    return session;
  }

  getRevealProgress(session: CinematicRevealSession): number {
    // Return progress 0-100%
    return 0; // Would calculate based on elapsed time
  }
}

export const phase5Manager = new Phase5Manager();