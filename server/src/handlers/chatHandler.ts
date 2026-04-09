// ============================================================
// Chat Handler — Real-time chat within a room
// ============================================================

import { Server, Socket } from 'socket.io';
import { RoomManager } from '../managers/RoomManager';
import { ChatMessagePayload, IChatMessage } from '../types';

export function registerChatHandler(io: Server, socket: Socket): void {
  const roomManager = RoomManager.getInstance();

  socket.on('chat-message', (data: ChatMessagePayload) => {
    const room = roomManager.getPlayerRoom(socket.id);
    if (!room) return;

    const player = room.getPlayer(socket.id);
    if (!player) return;

    const message = data.message?.trim();
    if (!message || message.length === 0 || message.length > 500) return;

    const chatMessage: IChatMessage = {
      senderId: socket.id,
      nickname: player.nickname,
      message,
      timestamp: Date.now(),
      isSystem: false,
    };

    // Broadcast to entire room (including sender)
    io.to(room.id).emit('chat-broadcast', chatMessage);
  });
}

/**
 * Helper to send a system message to a room.
 */
export function sendSystemMessage(io: Server, roomId: string, message: string): void {
  const chatMessage: IChatMessage = {
    senderId: 'system',
    nickname: 'System',
    message,
    timestamp: Date.now(),
    isSystem: true,
  };
  io.to(roomId).emit('chat-broadcast', chatMessage);
}
