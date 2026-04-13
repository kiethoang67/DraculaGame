// ============================================================
// Room Handler — Create, join, leave room events
// ============================================================

import { Server, Socket } from 'socket.io';
import { RoomManager } from '../managers/RoomManager';
import { GameManager } from '../managers/GameManager';
import { CharacterFactory } from '../characters/CharacterFactory';
import { CreateRoomPayload, JoinRoomPayload, StartGamePayload, RoomStatus } from '../types';

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
        socket.emit('room-error', { message: 'Tên phải từ 1-20 ký tự.' });
        return;
      }
      if (!roomId) {
        socket.emit('room-error', { message: 'Mã phòng là bắt buộc.' });
        return;
      }

      let result;
      try {
        result = roomManager.joinRoom(socket.id, roomId, nickname);
      } catch (err: any) {
        if (err.message === 'REJOIN_REQUIRED') {
          console.log(`[RoomHandler] Tên trùng nhưng offline -> Kích hoạt REJOIN cho ${nickname} tại phòng ${roomId}`);
          const rejoinResult = roomManager.rejoinRoom(socket.id, roomId, nickname);
          if (rejoinResult) {
            const { room, player, gameInProgress } = rejoinResult;
            socket.join(room.id);
            if (gameInProgress && room.gameState) {
              const charInfo = player.characterId ? CharacterFactory.create(player.characterId) : null;
              socket.emit('rejoin-success', {
                room: room.toPublic(),
                player: player.toPublic(),
                gameInProgress: true,
                characterId: player.characterId,
                characterName: charInfo?.name || 'Vô danh',
                characterDescription: charInfo?.description || '',
                gameState: room.gameState.toPublic(),
                isMyTurn: room.gameState.turnPlayerId === socket.id,
              });
            } else {
              socket.emit('rejoin-success', {
                room: room.toPublic(),
                player: player.toPublic(),
                gameInProgress: false,
              });
            }
            io.to(room.id).emit('player-reconnected', {
              playerId: socket.id,
              nickname: player.nickname,
              players: room.getPlayersArray().map(p => p.toPublic()),
              gameState: room.gameState ? room.gameState.toPublic() : undefined,
            });
            return;
          }
        }
        socket.emit('room-error', { message: err.message });
        return;
      }

      const { room, player } = result;
      socket.join(room.id);

      // If game is in progress, join as spectator
      if (room.status === RoomStatus.PLAYING && room.gameState) {
        socket.emit('rejoin-success', {
          room: room.toPublic(),
          player: player.toPublic(),
          gameInProgress: true,
          characterId: null,
          characterName: 'Khách',
          characterDescription: 'Bạn đang theo dõi ván đấu đang diễn ra. Chúc bạn vui vẻ!',
          gameState: room.gameState.toPublic(),
          isMyTurn: false,
        });
      } else {
        socket.emit('room-joined', {
          room: room.toPublic(),
          player: player.toPublic(),
        });
      }

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

  // ── Rejoin Room (after page reload) ─────────────────────
  socket.on('rejoin-room', (data: { roomId: string; nickname: string }) => {
    try {
      const roomId = data.roomId?.trim().toUpperCase();
      const nickname = data.nickname?.trim();
      if (!roomId || !nickname) {
        socket.emit('rejoin-failed', { message: 'Missing room ID or nickname.' });
        return;
      }

      const result = roomManager.rejoinRoom(socket.id, roomId, nickname);
      if (!result) {
        socket.emit('rejoin-failed', { message: 'Cannot rejoin. Room may no longer exist or you were not in it.' });
        return;
      }

      const { room, player, gameInProgress } = result;
      socket.join(room.id);

      if (gameInProgress && room.gameState) {
        // Game is running — send them back into the game
        const characterId = player.characterId;
        const charInfo = characterId
          ? CharacterFactory.create(characterId)
          : null;

        socket.emit('rejoin-success', {
          room: room.toPublic(),
          player: player.toPublic(),
          gameInProgress: true,
          characterId: characterId,
          characterName: charInfo?.name || 'Unknown',
          characterDescription: charInfo?.description || '',
          gameState: room.gameState.toPublic(),
          isMyTurn: room.gameState.turnPlayerId === socket.id,
        });
      } else {
        // Game hasn't started — just rejoin the lobby
        socket.emit('rejoin-success', {
          room: room.toPublic(),
          player: player.toPublic(),
          gameInProgress: false,
        });
      }

      // Notify others
      io.to(room.id).emit('player-reconnected', {
        playerId: socket.id,
        nickname: player.nickname,
        players: room.getPlayersArray().map(p => p.toPublic()),
        gameState: room.gameState ? room.gameState.toPublic() : undefined,
      });

      console.log(`[Room] ${nickname} rejoined ${room.id} (gameInProgress: ${gameInProgress})`);
    } catch (err: any) {
      socket.emit('rejoin-failed', { message: err.message });
    }
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
