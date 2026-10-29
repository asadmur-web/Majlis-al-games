import { phase1Manager } from './phase1';

export interface Phase1Session {
  roomCode: string;
  playerRoles: Map<string, 'citizen' | 'traitor'>;
  questionSet: any;
  answers: Map<string, Map<string, string>>;
  scores: Map<string, number>;
  currentQuestionIndex: number;
  startTime: number;
  status: 'waiting' | 'active' | 'completed';
}

export class Phase1Server {
  private sessions = new Map<string, Phase1Session>();
  private timerIntervals = new Map<string, NodeJS.Timeout>();

  async startPhase1(roomCode: string, players: any[], questionGenerator: any): Promise<boolean> {
    try {
      const questionSet = await questionGenerator.generateQuestions(3);
      
      const session: Phase1Session = {
        roomCode,
        playerRoles: new Map(),
        questionSet,
        answers: new Map(),
        scores: new Map(),
        currentQuestionIndex: 0,
        startTime: Date.now(),
        status: 'active',
      };

      // Initialize scores
      players.forEach(player => {
        session.scores.set(player.id, 0);
        session.playerRoles.set(player.id, player.role);
        session.answers.set(player.id, new Map());
      });

      this.sessions.set(roomCode, session);

      // Start timer for first question
      this.startQuestionTimer(roomCode, 60);

      return true;
    } catch (error) {
      console.error('Failed to start Phase 1:', error);
      return false;
    }
  }

  submitAnswer(roomCode: string, playerId: string, answer: string): boolean {
    const session = this.sessions.get(roomCode);
    if (!session || session.status !== 'active') return false;

    const questionKey = `q${session.currentQuestionIndex}`;
    
    if (!session.answers.has(playerId)) {
      session.answers.set(playerId, new Map());
    }

    const playerAnswers = session.answers.get(playerId)!;
    if (playerAnswers.has(questionKey)) {
      return false; // Already submitted
    }

    if (!answer || answer.trim().length < 2) {
      return false;
    }

    playerAnswers.set(questionKey, answer.trim());
    
    // Check if all players answered
    const allAnswered = Array.from(session.playerRoles.keys()).every(
      id => session.answers.get(id)?.has(questionKey)
    );

    if (allAnswered) {
      this.calculateQuestionScores(roomCode);
      this.nextQuestion(roomCode);
    }

    return true;
  }

  private calculateQuestionScores(roomCode: string): void {
    const session = this.sessions.get(roomCode);
    if (!session) return;

    const questionIndex = session.currentQuestionIndex;
    const questionKey = `q${questionIndex}`;

    // Award 10 points for each submitted answer
    session.playerRoles.forEach((_, playerId) => {
      const answers = session.answers.get(playerId);
      if (answers?.has(questionKey)) {
        const currentScore = session.scores.get(playerId) || 0;
        session.scores.set(playerId, currentScore + 10);
      }
    });

    // Calculate citizen match bonuses
    this.calculateCitizenBonuses(roomCode, questionIndex);
  }

  private calculateCitizenBonuses(roomCode: string, questionIndex: number): void {
    const session = this.sessions.get(roomCode);
    if (!session) return;

    const questionKey = `q${questionIndex}`;
    const citizenAnswers: Array<{ playerId: string; answer: string }> = [];

    session.playerRoles.forEach((role, playerId) => {
      if (role === 'citizen') {
        const answers = session.answers.get(playerId);
        if (answers?.has(questionKey)) {
          citizenAnswers.push({
            playerId,
            answer: answers.get(questionKey)!,
          });
        }
      }
    });

    // Check for semantic matches between citizens
    for (let i = 0; i < citizenAnswers.length; i++) {
      for (let j = i + 1; j < citizenAnswers.length; j++) {
        if (this.areAnswersSimilar(citizenAnswers[i].answer, citizenAnswers[j].answer)) {
          const score1 = session.scores.get(citizenAnswers[i].playerId) || 0;
          const score2 = session.scores.get(citizenAnswers[j].playerId) || 0;
          
          session.scores.set(citizenAnswers[i].playerId, score1 + 15);
          session.scores.set(citizenAnswers[j].playerId, score2 + 15);
        }
      }
    }
  }

  private areAnswersSimilar(answer1: string, answer2: string): boolean {
    const words1 = answer1.toLowerCase().split(/\s+/);
    const words2 = answer2.toLowerCase().split(/\s+/);
    
    const common = words1.filter(w => words2.includes(w));
    const similarity = common.length / Math.max(words1.length, words2.length);
    
    return similarity > 0.3;
  }

  private nextQuestion(roomCode: string): void {
    const session = this.sessions.get(roomCode);
    if (!session) return;

    session.currentQuestionIndex++;

    if (session.currentQuestionIndex >= 3) {
      this.completePhase(roomCode);
      return;
    }

    // Reset timer for next question
    this.startQuestionTimer(roomCode, 60);
  }

  private startQuestionTimer(roomCode: string, seconds: number): void {
    const interval = setInterval(() => {
      const session = this.sessions.get(roomCode);
      if (!session) {
        clearInterval(interval);
        return;
      }

      // Timer logic would be here
    }, 1000);

    this.timerIntervals.set(roomCode, interval);
  }

  private completePhase(roomCode: string): void {
    const session = this.sessions.get(roomCode);
    if (!session) return;

    session.status = 'completed';
    
    const interval = this.timerIntervals.get(roomCode);
    if (interval) {
      clearInterval(interval);
      this.timerIntervals.delete(roomCode);
    }
  }

  getSession(roomCode: string): Phase1Session | undefined {
    return this.sessions.get(roomCode);
  }

  getPlayerScores(roomCode: string): Map<string, number> {
    const session = this.sessions.get(roomCode);
    return session?.scores || new Map();
  }
}

export const phase1Server = new Phase1Server();
