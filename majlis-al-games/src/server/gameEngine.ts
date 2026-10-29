import { assignRoles } from '../lib/game/roleAssignment';

interface GamePhase {
  id: number;
  name: string;
  duration?: number;
  completed: boolean;
}

interface GameSession {
  roomCode: string;
  players: any[];
  currentPhase: number;
  phases: GamePhase[];
  scores: Map<string, number>;
  traitorIds: string[];
  startedAt: number;
}

class GameEngine {
  private sessions = new Map<string, GameSession>();
  
  startGame(roomCode: string, players: any[]): GameSession {
    console.log(`Starting game for room ${roomCode} with ${players.length} players`);
    
    // Assign roles
    const playersWithRoles = assignRoles(players);
    const traitorIds = playersWithRoles
      .filter(p => p.isTraitor)
      .map(p => p.id);
    
    const session: GameSession = {
      roomCode,
      players: playersWithRoles,
      currentPhase: 0,
      phases: [
        { id: 1, name: 'فخ الأسئلة الثلاثة', duration: 60, completed: false },
        { id: 2, name: 'الاستجواب السري', duration: 90, completed: false },
        { id: 3, name: 'دقيقة المحاكمة', duration: 120, completed: false },
        { id: 4, name: 'التصويت النهائي', duration: 60, completed: false },
        { id: 5, name: 'كشف المستور', duration: 0, completed: false },
      ],
      scores: new Map(),
      traitorIds,
      startedAt: Date.now(),
    };
    
    // Initialize scores
    players.forEach(p => session.scores.set(p.id, 0));
    
    this.sessions.set(roomCode, session);
    return session;
  }
  
  getSession(roomCode: string): GameSession | undefined {
    return this.sessions.get(roomCode);
  }
  
  advancePhase(roomCode: string): GamePhase | null {
    const session = this.sessions.get(roomCode);
    if (!session) return null;
    
    const currentPhase = session.phases[session.currentPhase];
    if (currentPhase) {
      currentPhase.completed = true;
    }
    
    session.currentPhase++;
    
    if (session.currentPhase >= session.phases.length) {
      // Game ended
      this.endGame(roomCode);
      return null;
    }
    
    return session.phases[session.currentPhase];
  }
  
  updateScore(roomCode: string, playerId: string, points: number): void {
    const session = this.sessions.get(roomCode);
    if (!session) return;
    
    const currentScore = session.scores.get(playerId) || 0;
    session.scores.set(playerId, currentScore + points);
  }
  
  endGame(roomCode: string): void {
    const session = this.sessions.get(roomCode);
    if (!session) return;
    
    console.log(`Game ended for room ${roomCode}`);
    console.log('Final scores:', Object.fromEntries(session.scores));
    console.log('Traitors:', session.traitorIds);
    
    // Keep session for results viewing
    session.phases.forEach(p => p.completed = true);
  }
  
  getLeaderboard(roomCode: string): Array<{playerId: string, score: number}> {
    const session = this.sessions.get(roomCode);
    if (!session) return [];
    
    return Array.from(session.scores.entries())
      .map(([playerId, score]) => ({ playerId, score }))
      .sort((a, b) => b.score - a.score);
  }
}

export const gameEngine = new GameEngine();
export type { GameSession, GamePhase };
