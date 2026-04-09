// ============================================================
// Connection Handler — Socket connect/disconnect management
// ============================================================

import { Server, Socket } from 'socket.io';
import { RoomManager } from '../managers/RoomManager';

export function registerConnectionHandler(io: Server, socket: Socket): void {
  const roomManager = RoomManager.getInstance();

  console.log(`[Connection] Client connected: ${socket.id}`);

  socket.on('disconnect', (reason) => {
    console.log(`[Connection] Client disconnected: ${socket.id} (${reason})`);

    const room = roomManager.markPlayerDisconnected(socket.id);
    if (room) {
      io.to(room.id).emit('player-disconnected', {
        playerId: socket.id,
        players: room.getPlayersArray().map(p => p.toPublic()),
      });

      // If game hasn't started, remove them fully
      if (room.status === 'waiting') {
        const updatedRoom = roomManager.removePlayerFromCurrentRoom(socket.id);
        if (updatedRoom) {
          io.to(updatedRoom.id).emit('room-updated', {
            room: updatedRoom.toPublic(),
          });
        }
      }
    }
  });
}
