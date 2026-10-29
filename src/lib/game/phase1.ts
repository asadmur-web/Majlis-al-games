export interface QuestionSet {
  id: string;
  questions: QuestionPair[];
  currentQuestionIndex: number;
  answers: Map<string, AnswerSubmission[]>;
  startTime: number;
  endTime: number;
}

export interface QuestionPair {
  citizenQuestion: string;
  traitorQuestion: string;
  category: string;
  correctAnswer?: string;
}

export interface AnswerSubmission {
  playerId: string;
  answer: string;
  timestamp: number;
  questionId: number;
}

export interface Phase1Result {
  playerId: string;
  score: number;
  citizenMatchBonus: boolean;
  matchWith?: string[];
}

export class Phase1Manager {
  private readonly QUESTION_COUNT = 3;
  private readonly POINTS_PER_ANSWER = 10;
  private readonly MATCH_BONUS = 15;
  private readonly ANSWER_TIME_LIMIT = 60; // seconds per question

  async startPhase1(
    roomCode: string,
    players: any[],
    questionGenerator: any
  ): Promise<QuestionSet> {
    const questions = await questionGenerator.generateQuestions(this.QUESTION_COUNT);
    
    const questionSet: QuestionSet = {
      id: `phase1-${roomCode}-${Date.now()}`,
      questions,
      currentQuestionIndex: 0,
      answers: new Map(),
      startTime: Date.now(),
      endTime: Date.now() + (this.QUESTION_COUNT * this.ANSWER_TIME_LIMIT * 1000),
    };

    return questionSet;
  }

  submitAnswer(
    questionSet: QuestionSet,
    playerId: string,
    answer: string,
    playerRole: 'citizen' | 'traitor'
  ): boolean {
    const questionIndex = questionSet.currentQuestionIndex;
    const questionKey = `q${questionIndex}`;
    
    if (!questionSet.answers.has(questionKey)) {
      questionSet.answers.set(questionKey, []);
    }

    // Validate answer
    if (!answer || answer.trim().length < 2) {
      return false;
    }

    // Check time limit
    if (Date.now() > questionSet.endTime) {
      return false;
    }

    const submissions = questionSet.answers.get(questionKey)!;
    
    // Prevent duplicate submissions
    if (submissions.some(s => s.playerId === playerId)) {
      return false;
    }

    submissions.push({
      playerId,
      answer: answer.trim(),
      timestamp: Date.now(),
      questionId: questionIndex,
    });

    return true;
  }

  calculateScores(
    questionSet: QuestionSet,
    players: Array<{ id: string; role: 'citizen' | 'traitor' }>,
    semanticMatcher?: any
  ): Map<string, Phase1Result> {
    const results = new Map<string, Phase1Result>();
    
    questionSet.questions.forEach((_, questionIndex) => {
      const questionKey = `q${questionIndex}`;
      const submissions = questionSet.answers.get(questionKey) || [];
      
      submissions.forEach(submission => {
        const player = players.find(p => p.id === submission.playerId);
        if (!player) return;

        const existing = results.get(submission.playerId) || {
          playerId: submission.playerId,
          score: 0,
          citizenMatchBonus: false,
          matchWith: [],
        };

        // Base points for valid submission
        existing.score += this.POINTS_PER_ANSWER;

        // Citizen match bonus (only for citizens)
        if (player.role === 'citizen') {
          const citizenAnswers = submissions.filter(s => {
            const p = players.find(pl => pl.id === s.playerId);
            return p?.role === 'citizen';
          });

          // Check for semantic matches
          citizenAnswers.forEach(otherSubmission => {
            if (otherSubmission.playerId !== submission.playerId) {
              // In production, use semantic matcher
              // For now, simple heuristic
              const similarity = this.calculateAnswerSimilarity(
                submission.answer,
                otherSubmission.answer
              );
              
              if (similarity > 0.7) {
                existing.citizenMatchBonus = true;
                existing.matchWith = existing.matchWith || [];
                if (!existing.matchWith.includes(otherSubmission.playerId)) {
                  existing.matchWith.push(otherSubmission.playerId);
                  existing.score += this.MATCH_BONUS;
                }
              }
            }
          });
        }

        results.set(submission.playerId, existing);
      });
    });

    return results;
  }

  private calculateAnswerSimilarity(answer1: string, answer2: string): number {
    // Simple similarity calculation
    // In production, use Gemini for semantic matching
    const words1 = answer1.toLowerCase().split(/\s+/);
    const words2 = answer2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(w => words2.includes(w));
    const totalWords = new Set([...words1, ...words2]).size;
    
    return totalWords > 0 ? commonWords.length / totalWords : 0;
  }

  isPhaseComplete(questionSet: QuestionSet, players: any[]): boolean {
    const expectedAnswers = questionSet.currentQuestionIndex + 1;
    const currentQuestionKey = `q${questionSet.currentQuestionIndex}`;
    const submissions = questionSet.answers.get(currentQuestionKey) || [];
    
    return submissions.length >= players.length;
  }

  nextQuestion(questionSet: QuestionSet): boolean {
    if (questionSet.currentQuestionIndex >= questionSet.questions.length - 1) {
      return false;
    }
    
    questionSet.currentQuestionIndex++;
    return true;
  }

  getCurrentQuestion(questionSet: QuestionSet): QuestionPair | null {
    return questionSet.questions[questionSet.currentQuestionIndex] || null;
  }

  getQuestionForPlayer(
    questionSet: QuestionSet,
    playerRole: 'citizen' | 'traitor'
  ): string | null {
    const question = this.getCurrentQuestion(questionSet);
    if (!question) return null;
    
    return playerRole === 'citizen' 
      ? question.citizenQuestion 
      : question.traitorQuestion;
  }
}

export const phase1Manager = new Phase1Manager();
