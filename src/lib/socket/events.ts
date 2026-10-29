export const SocketEvents = {
  // Room management
  CREATE_ROOM: 'create-room',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  ROOM_UPDATED: 'room-updated',
  
  // Game flow
  START_GAME: 'start-game',
  GAME_STARTED: 'game-started',
  
  // Phase 1: Three Question Trap
  PHASE1_START: 'phase1-start',
  PHASE1_QUESTION: 'phase1-question',
  PHASE1_SUBMIT_ANSWER: 'phase1-submit-answer',
  PHASE1_ANSWER_RECEIVED: 'phase1-answer-received',
  PHASE1_NEXT_QUESTION: 'phase1-next-question',
  PHASE1_COMPLETE: 'phase1-complete',
  PHASE1_SCORES: 'phase1-scores',
  
  // Phase 2-5 would be added similarly
  PHASE2_START: 'phase2-start',
  PHASE3_START: 'phase3-start',
  PHASE4_START: 'phase4-start',
  PHASE5_START: 'phase5-start',
  
  // Errors and status
  ERROR: 'error',
  PING: 'ping',
  PONG: 'pong',
} as const;

export type SocketEvent = typeof SocketEvents[keyof typeof SocketEvents];

export interface Phase1QuestionPayload {
  roomCode: string;
  questionIndex: number;
  question: string;
  category: string;
  timeLimit: number;
  playerRole: 'citizen' | 'traitor';
}

export interface Phase1AnswerPayload {
  roomCode: string;
  playerId: string;
  questionIndex: number;
  answer: string;
  timestamp: number;
}

export interface Phase1ScoresPayload {
  roomCode: string;
  scores: Array<{
    playerId: string;
    score: number;
    role: 'citizen' | 'traitor';
  }>;
}

export interface Phase2StartPayload {
  roomCode: string;
  players: Array<{ id: string; name: string; role: 'citizen' | 'traitor' }>;
}

export interface Phase2TargetSelectPayload {
  roomCode: string;
  askerId: string;
  targetId: string;
  question: string;
}

export interface Phase2RevealPrivatePayload {
  roomCode: string;
  askerId: string;
  question: string;
  answer: string;
  answererName: string;
}

export interface Phase2BroadcastPublicPayload {
  roomCode: string;
  question: string;
  answer: string;
  answererName: string;
}

export interface Phase2ScoresPayload {
  roomCode: string;
  scores: Array<{
    playerId: string;
    score: number;
    role: 'citizen' | 'traitor';
  }>;
  revealedCount: number;
}

export interface Phase3StartPayload {
  roomCode: string;
  traitorId: string;
  playerCount: number;
}

export interface Phase3VotePayload {
  roomCode: string;
  playerId: string;
  vote: 'traitor' | 'citizen';
}

export interface Phase3SkipVotePayload {
  roomCode: string;
}

export interface Phase3ScoresPayload {
  roomCode: string;
  scores: Array<{
    playerId: string;
    score: number;
    role: 'citizen' | 'traitor';
  }>;
  traitorId: string;
  debateResult: 'traitor_identified' | 'citizen_win' | 'skipped';
}

export interface Phase4StartPayload {
  roomCode: string;
  traitorId: string;
  playerCount: number;
}

export interface Phase4DefensePayload {
  roomCode: string;
  playerId: string;
  answer: string;
}

export interface Phase4ScoresPayload {
  roomCode: string;
  scores: Array<{
    playerId: string;
    score: number;
    role: 'citizen' | 'traitor';
  }>;
  traitorId: string;
  traitorEliminated: boolean;
  finalResult: 'traitor_eliminated' | 'traitor_survives';
  pointsAwarded: number;
}
