export interface DebateVote {
  playerId: string;
  vote: 'traitor' | 'citizen';
  timestamp: number;
}

export interface DebateSession {
  roomCode: string;
  traitorId: string;
  debateStartTime: number;
  debateTimeLimit: number; // 2 minutes in seconds
  votes: Map<string, DebateVote>;
  skipped: boolean;
  skipVoteThreshold: number; // percentage of players needed to skip
}

export class Phase3Manager {
  private readonly DEBATE_TIME_LIMIT = 120; // 2 minutes in seconds
  private readonly SKIP_VOTE_THRESHOLD = 0.6; // 60% of players needed to skip

  initSession(
    roomCode: string,
    traitorId: string,
    playerCount: number
  ): DebateSession {
    const skipVoteThreshold = Math.ceil(playerCount * this.SKIP_VOTE_THRESHOLD);

    const session: DebateSession = {
      roomCode,
      traitorId,
      debateStartTime: Date.now(),
      debateTimeLimit: this.DEBATE_TIME_LIMIT,
      votes: new Map(),
      skipped: false,
      skipVoteThreshold,
    };

    return session;
  }

  canSubmitVote(session: DebateSession, playerId: string): boolean {
    // Prevent duplicate votes
    if (session.votes.has(playerId)) return false;

    // Prevent voting after skip was initiated
    if (session.skipped) return false;

    return true;
  }

  submitVote(
    session: DebateSession,
    playerId: string,
    vote: 'traitor' | 'citizen'
  ): { valid: boolean; updatedSession: DebateSession; skipInitiated: boolean } {
    if (!this.canSubmitVote(session, playerId)) {
      return { valid: false, updatedSession: session, skipInitiated: false };
    }

    const updatedSession = {
      ...session,
      votes: new Map(session.votes).set(playerId, { playerId, vote, timestamp: Date.now() }),
    };

    // Check if skip vote threshold is met
    const skipInitiated = this.checkSkipThreshold(updatedSession);

    if (skipInitiated) {
      updatedSession.skipped = true;
    }

    return { valid: true, updatedSession, skipInitiated };
  }

  private checkSkipThreshold(session: DebateSession): boolean {
    if (session.votes.size < session.skipVoteThreshold) return false;

    const traitorVotes = Array.from(session.votes.values()).filter(
      (v) => v.vote === 'traitor'
    ).length;

    // If majority voted traitor, or skip threshold met
    const totalVotes = session.votes.size;
    const isTraitorCorrectlyIdentified = traitorVotes > totalVotes / 2;
    const skipThresholdMet = traitorVotes >= session.skipVoteThreshold;

    return isTraitorCorrectlyIdentified || skipThresholdMet;
  }

  isTimeUp(session: DebateSession): boolean {
    const elapsed = (Date.now() - session.debateStartTime) / 1000;
    return elapsed >= session.debateTimeLimit;
  }

  getRemainingTime(session: DebateSession): number {
    const elapsed = (Date.now() - session.debateStartTime) / 1000;
    const remaining = session.debateTimeLimit - elapsed;
    return Math.max(0, remaining);
  }
}

export const phase3Manager = new Phase3Manager();