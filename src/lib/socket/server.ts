import { Server, Socket } from 'socket.io';
import { generateUniqueRoomCode, validateRoomCode } from '../utils/roomCode';
import { phase2Manager, type InterrogationSession } from '../game/phase2';
import { phase3Manager } from '../game/phase3';
import { phase4Manager } from '../game/phase4';

interface Room {
  code: string;
  players: Map<string, Player>;
  hostId: string;
  gameState: GameState;
  createdAt: number;
}

interface Player {
  id: string;
  name: string;
  avatar: string;
  socketId: string;
  score: number;
  isReady: boolean;
  role: 'citizen' | 'traitor';
}

interface GameState {
  phase: 'lobby' | 'phase1' | 'phase2' | 'phase3' | 'phase4' | 'phase5';
  startedAt?: number;
  currentRound: number;
}

class RoomManager {
  private rooms = new Map<string, Room>();

  createRoom(hostId: string, hostPlayer: Player): Room {
    const code = generateUniqueRoomCode();
    const room: Room = {
      code,
      players: new Map([[hostId, hostPlayer]]),
      hostId,
      gameState: { phase: 'lobby', currentRound: 1 },
      createdAt: Date.now(),
    };
    this.rooms.set(code, room);
    return room;
  }

  joinRoom(code: string, player: Player): Room | null {
    if (!validateRoomCode(code)) return null;

    const room = this.rooms.get(code);
    if (!room) return null;

    if (room.players.size >= 12) return null;

    room.players.set(player.id, player);
    return room;
  }

  leaveRoom(code: string, playerId: string): void {
    const room = this.rooms.get(code);
    if (!room) return;

    room.players.delete(playerId);

    if (room.players.size === 0) {
      this.rooms.delete(code);
    } else if (room.hostId === playerId) {
      const playersArray = Array.from(room.players.values());
      if (playersArray.length > 0) {
        room.hostId = playersArray[0].id;
      }
    }
  }

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code);
  }

  listRooms(): Room[] {
    return Array.from(this.rooms.values());
  }
}

// Store phase2 session data per room code
const phase2Sessions = new Map<string, InterrogationSession>();

// Store phase3 session data per room code
const phase3Sessions = new Map<string, any>();

// Store phase4 session data per room code
const phase4Sessions = new Map<string, any>();

export function setupPhase2Handlers(io: Server) {
  io.sockets.on('connection', (socket: Socket) => {
    // ... existing Phase 2 handlers
    socket.on('disconnect', () => {
      // Clean up would be handled by room management
    });
  });
}

export function setupPhase3Handlers(io: Server) {
  io.sockets.on('connection', (socket: Socket) => {
    socket.on('phase3-start', (data: { traitorId: string; playerCount: number }) => {
      try {
        const session = phase3Manager.initSession(
          socket.handshakeshake.query?.roomCode as string,
          data.traitorId,
          data.playerCount
        );
        phase3Sessions.set(socket.handshakeshake.query?.roomCode as string, session);

        socket.to(socket.handshakeshake.query?.roomCode as string).emit('phase3-started', {
          roomCode: socket.handshakeshake.query?.roomCode as string,
          traitorId: data.traitorId,
          playerCount: data.playerCount,
          timeLimit: 120,
        });
      } catch (error) {
        console.error('Failed to start Phase 3:', error);
        socket.emit('error', { message: 'Failed to start Phase 3' });
      }
    });

    socket.on('phase3-vote', (data: { vote: 'traitor' | 'citizen' }) => {
      const roomCode = socket.handshakeshake.query?.roomCode as string;
      const session = phase3Sessions.get(roomCode);
      if (!session) {
        socket.emit('error', { message: 'Phase 3 session not initialized' });
        return;
      }

      const result = phase3Manager.submitVote(session, socket.id, data.vote);

      // Update session in storage
      phase3Sessions.set(roomCode, result.updatedSession);

      io.to(roomCode).emit('phase3-vote-cast', {
        roomCode,
        playerId: socket.id,
        vote: data.vote,
        totalVotes: result.updatedSession.votes.size,
        skipInitiated: result.skipInitiated,
      });

      if (result.skipInitiated) {
        setTimeout(() => {
          io.to(roomCode).emit('phase3-skip-initiated', {
            roomCode,
            message: 'تم استيفاء شروط التصويت للتخطي',
          });
        }, 500);
      }
    });

    socket.on('phase3-skip-vote', () => {
      const roomCode = socket.handshakeshakeshake.query?.roomCode as string;
      const session = phase3Sessions.get(roomCode);
      if (!session) return;

      setTimeout(() => {
        io.to(roomCode).emit('phase3-skip-confirmed', {
          roomCode,
        });
      }, 300);
    });

    socket.on('disconnect', () => {
      // Clean up would be handled by room management
    });
  });
}

export function setupPhase4Handlers(io: Server) {
  io.sockets.on('connection', (socket: Socket) => {
    socket.on('phase4-start', (data: { traitorId: string; playerCount: number }) => {
      try {
        const session = phase4Manager.initSession(
          socket.handshake.query?.roomCode as string,
          data.traitorId,
          data.playerCount
        );
        phase4Sessions.set(socket.handshake.query?.roomCode as string, session);

        socket.to(socket.handshake.query?.roomCode as string).emit('phase4-started', {
          roomCode: socket.handshake.query?.roomCode as string,
          traitorId: data.traitorId,
          playerCount: data.playerCount,
          defenseTimeLimit: 30,
        });
      } catch (error) {
        console.error('Failed to start Phase 4:', error);
        socket.emit('error', { message: 'Failed to start Phase 4' });
      }
    });

    socket.on('phase4-defense', (data: { answer: string }) => {
      const roomCode = socket.handshake.query?.roomCode as string;
      const session = phase4Sessions.get(roomCode);
      if (!session) {
        socket.emit('error', { message: 'Phase 4 session not initialized' });
        return;
      }

      try {
        const result = phase4Manager.submitDefense(session, socket.id, data.answer);

        // Update session in storage
        phase4Sessions.set(roomCode, result.updatedSession);

        io.to(roomCode).emit('phase4-defense-submitted', {
          roomCode,
          playerId: socket.id,
          answer: data.answer,
          pointsAwarded: result.updatedSession.votes.get(socket.id)?.pointsAwarded || 0,
          timeUp: result.timeUp,
        });

        if (result.timeUp) {
          setTimeout(() => {
            io.to(roomCode).emit('phase4-time-up', {
              roomCode,
            });
          }, 300);
        }
      } catch (error) {
        console.error('Failed to submit Phase 4 defense:', error);
        socket.emit('error', { message: 'Failed to submit defense' });
      }
    });

    socket.on('phase4-determine-result', () => {
      const roomCode = socket.handshake.query?.roomCode as string;
      const session = phase4Sessions.get(roomCode);
      if (!session) return;

      const resolved = phase4Manager.determineFinalResult(session);
      phase4Sessions.set(roomCode, resolved);

      io.to(roomCode).emit('phase4-result-determined', {
        roomCode,
        traitorEliminated: resolved.traitorEliminated,
        finalResult: resolved.finalResult,
      });
    });

    socket.on('disconnect', () => {
      // Clean up would be handled by room management
    });
  });
}