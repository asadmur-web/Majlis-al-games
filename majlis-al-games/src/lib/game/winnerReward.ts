import { QuestionPair } from '../ai/questionGenerator';

export interface WinnerReward {
  winnerId: string;
  winnerName: string;
  hint: string;
  timestamp: number;
}

export class WinnerRewardManager {
  private winnerRewards = new Map<string, WinnerReward>(); // roomCode -> reward

  calculateWinnerAndGrantHint(
    roomCode: string,
    playerScores: Map<string, number>,
    playerNames: Map<string, string>,
    nextGameQuestion: QuestionPair
  ): WinnerReward | null {
    if (playerScores.size === 0) return null;

    // Find player with highest score
    let highestScore = -1;
    let winnerId = '';

    playerScores.forEach((score, id) => {
      if (score > highestScore) {
        highestScore = score;
        winnerId = id;
      }
    });

    if (!winnerId) return null;

    const winnerName = playerNames.get(winnerId) || 'اللاعب الفائز';

    // Generate hint from traitor question (e.g. first word or category)
    const hint = `تلميح الجيم القادم: التصنيف هو (${nextGameQuestion.category}) وإجابة الدخيل تبدأ بـ "${nextGameQuestion.traitorQuestion.slice(0, 10)}..."`;

    const reward: WinnerReward = {
      winnerId,
      winnerName,
      hint,
      timestamp: Date.now(),
    };

    this.winnerRewards.set(roomCode, reward);
    return reward;
  }

  getWinnerReward(roomCode: string): WinnerReward | undefined {
    return this.winnerRewards.get(roomCode);
  }

  clearReward(roomCode: string): void {
    this.winnerRewards.delete(roomCode);
  }
}

export const winnerRewardManager = new WinnerRewardManager();