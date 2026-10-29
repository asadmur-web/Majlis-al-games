export interface InterrogationSession {
  roomCode: string;
  activeInterrogations: Map<string, { targetId: string; question: string; answer?: string }>;
  revealedInterrogations: Array<{
    question: string;
    answer: string;
    answererName: string;
    timestamp: number;
  }>;
  submissionLimits: Map<string, number>; // playerId -> count
}

export class Phase2Manager {
  private sessions = new Map<string, InterrogationSession>();
  private readonly MAX_QUESTIONS_PER_TARGET = 2;

  initSession(roomCode: string, players: string[]): InterrogationSession {
    const session: InterrogationSession = {
      roomCode,
      activeInterrogations: new Map(),
      revealedInterrogations: [],
      submissionLimits: new Map(players.map(id => [id, 0])),
    };
    this.sessions.set(roomCode, session);
    return session;
  }

  canTarget(session: InterrogationSession, playerId: string, targetId: string): boolean {
    if (playerId === targetId) return false;
    
    const count = session.submissionLimits.get(targetId) || 0;
    return count < this.MAX_QUESTIONS_PER_TARGET;
  }

  submitQuestion(
    session: InterrogationSession,
    playerId: string,
    targetId: string,
    question: string
  ): boolean {
    if (!this.canTarget(session, playerId, targetId)) return false;

    session.activeInterrogations.set(playerId, { targetId, question });
    session.submissionLimits.set(targetId, (session.submissionLimits.get(targetId) || 0) + 1);
    
    return true;
  }

  async submitAnswer(
    session: InterrogationSession,
    targetId: string,
    answer: string,
    answererName: string
  ): Promise<string> {
    // Find who asked this target
    let interrogatorId = '';
    for (const [askerId, data] of session.activeInterrogations.entries()) {
      if (data.targetId === targetId && !data.answer) {
        interrogatorId = askerId;
        data.answer = answer;
        break;
      }
    }

    if (!interrogatorId) throw new Error('No active interrogation found');

    // Add to revealed (for public screen)
    session.revealedInterrogations.push({
      question: session.activeInterrogations.get(interrogatorId)!.question,
      answer,
      answererName,
      timestamp: Date.now(),
    });

    return interrogatorId; // Return to socket to emit private reveal
  }
}

export const phase2Manager = new Phase2Manager();
