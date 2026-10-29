export interface DefenseSubmission {
  playerId: string;
  answer: string;
  timestamp: number;
}

export interface VoteResult {
  playerId: string;
  vote: 'traitor' | 'citizen';
  isCorrect: boolean;
  pointsAwarded: number;
}

export interface Phase4Session {
  roomCode: string;
  traitorId: string;
  defenseStartTime: number;
  defenseTimeLimit: number; // 30 seconds in seconds
  votes: Map<string, VoteResult>;
  tied: boolean;
  tieBreaker: boolean;
  traitorEliminated: boolean;
  finalResult: 'traitor_eliminated' | 'traitor_survives';
}

export class Phase4Manager {
  private readonly DEFENSE_TIME_LIMIT = 30; // 30 seconds in seconds
  private readonly TIE_BREAKER_THRESHOLD = 0.5; // 50% for tie breaker

  initSession(
    roomCode: string,
    traitorId: string,
    playerCount: number
  ): Phase4Session {
    const session: Phase4Session = {
      roomCode,
      traitorId,
      defenseStartTime: Date.now(),
      defenseTimeLimit: this.DEFENSE_TIME_LIMIT,
      votes: new Map(),
      tied: false,
      tieBreaker: false,
      traitorEliminated: false,
      finalResult: 'traitor_survives',
    };

    return session;
  }

  canSubmitDefense(session: Phase4Session, playerId: string): boolean {
    // Prevent duplicate defenses
    if (session.votes.has(playerId)) return false;

    // Prevent defense after time up
    const elapsed = (Date.now() - session.defenseStartTime) / 1000;
    return elapsed < this.DEFENSE_TIME_LIMIT;
  }

  submitDefense(
    session: Phase4Session,
    playerId: string,
    answer: string
  ): { valid: boolean; updatedSession: Phase4Session; timeUp: boolean } {
    if (!this.canSubmitDefense(session, playerId)) {
      const timeUp = (Date.now() - session.defenseStartTime) / 1000 >= this.DEFENSE_TIME_LIMIT;
      return { valid: false, updatedSession: session, timeUp };
    }

    const pointsAwarded = this.calculateDefensePoints(session, playerId, answer);
    const updatedSession = {
      ...session,
      votes: new Map(session.votes).set(playerId, {
        playerId,
        vote: answer.toLowerCase().includes('traitor') || answer.toLowerCase().includes('w') ? 'traitor' : 'citizen',
        isCorrect: false,
        pointsAwarded,
      }),
    };

    return { valid: true, updatedSession, timeUp: false };
  }

  private calculateDefensePoints(
    session: Phase4Session,
    playerId: string,
    answer: string
  ): number {
    // Base points for participating in defense
    let basePoints = 5;

    // If traitor and correctly identified during defense, +10
    // If citizen and correctly defends, +5
    const lowerAnswer = answer.toLowerCase();
    const mentionsTraitor = lowerAnswer.includes('traitor') || lowerAnswer.includes('w');

    // Simple heuristic: if answer mentions traitor concepts, award extra
    if (mentionsTraitor) {
      return basePoints + 10;
    }
    return basePoints;
  }

  checkTieBreaker(session: Phase4Session): boolean {
    const voteCount = session.votes.size;
    if (voteCount < 2) return false;

    const traitorVotes = Array.from(session.votes.values()).filter(
      (v) => v.vote === 'traitor'
    ).length;

    const isTie = traitorVotes === voteCount - traitorVotes;
    return isTie && !session.tied;
  }

  resolveTieBreaker(session: Phase4Session): Phase4Session {
    // In case of tie, random or additional voting
    session.tied = true;
    session.tieBreaker = true;
    // For now, traitor survives on tie
    session.finalResult = 'traitor_survives';
    return session;
  }

  determineFinalResult(session: Phase4Session): Phase4Session {
    const totalVotes = session.votes.size;
    const traitorVotes = Array.from(session.votes.values()).filter(
      (v) => v.vote === 'traitor'
    ).length;
    const citizenVotes = totalVotes - traitorVotes;

    // Tie breaker check
    if (traitorVotes === citizenVotes) {
      return this.resolveTieBreaker(session);
    }

    // Traitor eliminated if more citizens voted than traitor votes
    if (citizenVotes > traitorVotes) {
      session.traitorEliminated = true;
      session.finalResult = 'traitor_eliminated';
    } else {
      // Traitor survives if traitor votes >= citizen votes
      session.traitorEliminated = false;
      session.finalResult = 'traitor_survives';
    }

    return session;
  }

  isTimeUp(session: Phase4Session): boolean {
    const elapsed = (Date.now() - session.defenseStartTime) / 1000;
    return elapsed >= session.defenseTimeLimit;
  }

  getRemainingTime(session: Phase4Session): number {
    const elapsed = (Date.now() - session.defenseStartTime) / 1000;
    const remaining = this.DEFENSE_TIME_LIMIT - elapsed;
    return Math.max(0, remaining);
  }
}

export const phase4Manager = new Phase4Manager();