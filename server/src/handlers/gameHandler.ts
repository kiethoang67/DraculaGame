// ============================================================
// Game Handler — In-game action events
// ============================================================

import { Server, Socket } from 'socket.io';
import { RoomManager } from '../managers/RoomManager';
import { GameManager } from '../managers/GameManager';
import {
  InquireRequestPayload,
  InquireResponsePayload,
  DanceOfferPayload,
  DanceResponsePayload,
  AccuseStartPayload,
  VanHelsingAccusePayload,
} from '../types';

export function registerGameHandler(io: Server, socket: Socket, gameManager: GameManager): void {
  const roomManager = RoomManager.getInstance();

  // Helper: Get player's room (with validation)
  function getPlayerRoom() {
    const room = roomManager.getPlayerRoom(socket.id);
    if (!room) {
      socket.emit('game-error', { message: 'You are not in a room.' });
      return null;
    }
    if (!room.gameState) {
      socket.emit('game-error', { message: 'Game has not started.' });
      return null;
    }
    return room;
  }

  // ── INQUIRE ─────────────────────────────────────────────
  socket.on('inquire-request', (data: InquireRequestPayload) => {
    const room = getPlayerRoom();
    if (!room) return;
    gameManager.handleInquireRequest(socket, room, data.targetId, data.characterGuess);
  });

  // Target responds to inquiry with Yes/No (Whisper card)
  socket.on('inquire-response', (data: InquireResponsePayload) => {
    const room = getPlayerRoom();
    if (!room) return;
    gameManager.handleInquireResponse(socket, room, data.answer);
  });

  // ── DANCE ───────────────────────────────────────────────
  socket.on('dance-offer', (data: DanceOfferPayload) => {
    const room = getPlayerRoom();
    if (!room) return;
    gameManager.handleDanceOffer(socket, room, data.targetId);
  });

  socket.on('dance-response', (data: DanceResponsePayload) => {
    const room = getPlayerRoom();
    if (!room) return;
    gameManager.handleDanceResponse(socket, room, data.accepted);
  });

  // ── ACCUSE ──────────────────────────────────────────────
  socket.on('accuse-start', (data: AccuseStartPayload) => {
    const room = getPlayerRoom();
    if (!room) return;
    gameManager.handleAccuseStart(socket, room, data.accusations);
  });

  // ── VAN HELSING SPECIAL ─────────────────────────────────
  socket.on('van-helsing-accuse', (data: VanHelsingAccusePayload) => {
    const room = getPlayerRoom();
    if (!room) return;
    gameManager.handleVanHelsingAccuse(socket, room, data.targetId);
  });
}
