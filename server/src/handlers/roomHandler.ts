// ============================================================
// Room Handler — Create, join, leave room events
// ============================================================

import { Server, Socket } from 'socket.io';
import { RoomManager } from '../managers/RoomManager';
import { GameManager } from '../managers/GameManager';
import { CreateRoomPayload, JoinRoomPayload, StartGamePayload } from '../types';

export function registerRoomHandler(io: Server, socket: Socket, gameManager: GameManager): void {
  const roomManager = RoomManager.getInstance();

  // ── Create Room ─────────────────────────────────────────
  socket.on('create-room', (data: CreateRoomPayload) => {
    try {
      const nickname = data.nickname?.trim();
      if (!nickname || nickname.length < 1 || nickname.length > 20) {
        socket.emit('room-error', { message: 'Nickname must be 1-20 characters.' });
        return;
      }

      const { room, player } = roomManager.createRoom(socket.id, nickname);
      socket.join(room.id);

      socket.emit('room-created', {
        room: room.toPublic(),
        player: player.toPublic(),
      });

      console.log(`[Room] Created: ${room.id} by ${nickname}`);
    } catch (err: any) {
      socket.emit('room-error', { message: err.message });
    }
  });

  // ── Join Room ───────────────────────────────────────────
  socket.on('join-room', (data: JoinRoomPayload) => {
    try {
      const nickname = data.nickname?.trim();
      const roomId = data.roomId?.trim().toUpperCase();

      if (!nickname || nickname.length < 1 || nickname.length > 20) {
        socket.emit('room-error', { message: 'Nickname must be 1-20 characters.' });
        return;
      }
      if (!roomId) {
        socket.emit('room-error', { message: 'Room ID is required.' });
        return;
      }

      const { room, player } = roomManager.joinRoom(socket.id, roomId, nickname);
      socket.join(room.id);

      // Tell the joining player about the room
      socket.emit('room-joined', {
        room: room.toPublic(),
        player: player.toPublic(),
      });

      // Tell everyone else a new player joined
      socket.to(room.id).emit('player-joined', {
        player: player.toPublic(),
        room: room.toPublic(),
      });

      console.log(`[Room] ${nickname} joined ${room.id}`);
    } catch (err: any) {
      socket.emit('room-error', { message: err.message });
    }
  });

  // ── Leave Room ──────────────────────────────────────────
  socket.on('leave-room', () => {
    const room = roomManager.removePlayerFromCurrentRoom(socket.id);
    if (room) {
      socket.leave(room.id);
      io.to(room.id).emit('room-updated', {
        room: room.toPublic(),
      });
    }
    socket.emit('room-left', {});
  });

  // ── Start Game ──────────────────────────────────────────
  socket.on('start-game', (_data: StartGamePayload) => {
    try {
      const room = roomManager.getPlayerRoom(socket.id);
      if (!room) {
        socket.emit('game-error', { message: 'You are not in a room.' });
        return;
      }
      if (room.hostId !== socket.id) {
        socket.emit('game-error', { message: 'Only the host can start the game.' });
        return;
      }
      if (!room.canStart()) {
        socket.emit('game-error', {
          message: `Need ${room.minPlayers}-${room.maxPlayers} players. Currently: ${room.players.size}`,
        });
        return;
      }

      gameManager.startGame(room);
    } catch (err: any) {
      socket.emit('game-error', { message: err.message });
    }
  });
}
