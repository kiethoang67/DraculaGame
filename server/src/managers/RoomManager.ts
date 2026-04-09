// ============================================================
// RoomManager — Singleton managing all game rooms
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import { Room } from '../models/Room';
import { Player } from '../models/Player';
import { CONFIG } from '../config';

export class RoomManager {
  private static instance: RoomManager;
  private rooms: Map<string, Room> = new Map();
  // Track which room each player (socket ID) is in
  private playerRoomMap: Map<string, string> = new Map();

  private constructor() {}

  static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  /**
   * Generate a unique 6-character room code.
   */
  private generateRoomId(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous chars (0/O, 1/I)
    let id: string;
    do {
      id = '';
      for (let i = 0; i < CONFIG.ROOM_ID_LENGTH; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(id));
    return id;
  }

  /**
   * Create a new room. Returns the room and the host player.
   */
  createRoom(hostSocketId: string, nickname: string): { room: Room; player: Player } {
    if (this.rooms.size >= CONFIG.MAX_ROOMS) {
      throw new Error('Maximum number of rooms reached. Please try again later.');
    }

    // Remove player from any existing room
    this.removePlayerFromCurrentRoom(hostSocketId);

    const roomId = this.generateRoomId();
    const room = new Room(roomId, hostSocketId);
    const player = new Player(hostSocketId, nickname, roomId, true);
    player.seatIndex = 0;

    room.addPlayer(player);
    this.rooms.set(roomId, room);
    this.playerRoomMap.set(hostSocketId, roomId);

    console.log(`[RoomManager] Room ${roomId} created by ${nickname} (${hostSocketId})`);
    return { room, player };
  }

  /**
   * Join an existing room. Returns the room and the new player.
   */
  joinRoom(socketId: string, roomId: string, nickname: string): { room: Room; player: Player } {
    const room = this.rooms.get(roomId.toUpperCase());
    if (!room) {
      throw new Error(`Room "${roomId}" not found.`);
    }
    if (room.status !== 'waiting') {
      throw new Error('Game has already started in this room.');
    }
    if (room.players.size >= room.maxPlayers) {
      throw new Error('Room is full.');
    }

    // Check for duplicate nicknames
    for (const p of room.players.values()) {
      if (p.nickname.toLowerCase() === nickname.toLowerCase()) {
        throw new Error(`Nickname "${nickname}" is already taken in this room.`);
      }
    }

    // Remove player from any existing room
    this.removePlayerFromCurrentRoom(socketId);

    const player = new Player(socketId, nickname, roomId);
    player.seatIndex = room.players.size;

    room.addPlayer(player);
    this.playerRoomMap.set(socketId, roomId);

    console.log(`[RoomManager] ${nickname} (${socketId}) joined room ${roomId}`);
    return { room, player };
  }

  /**
   * Remove a player from their current room (if any).
   * Returns the room they were in (or null).
   */
  removePlayerFromCurrentRoom(socketId: string): Room | null {
    const roomId = this.playerRoomMap.get(socketId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) {
      this.playerRoomMap.delete(socketId);
      return null;
    }

    const shouldDestroy = room.removePlayer(socketId);
    this.playerRoomMap.delete(socketId);

    if (shouldDestroy) {
      this.rooms.delete(roomId);
      console.log(`[RoomManager] Room ${roomId} destroyed (empty)`);
      return null;
    }

    // Reassign seat indices after removal
    const players = room.getPlayersArray();
    players.forEach((p, i) => { p.seatIndex = i; });

    console.log(`[RoomManager] Player ${socketId} removed from room ${roomId}`);
    return room;
  }

  /**
   * Get the room for a given player socket ID.
   */
  getPlayerRoom(socketId: string): Room | undefined {
    const roomId = this.playerRoomMap.get(socketId);
    if (!roomId) return undefined;
    return this.rooms.get(roomId);
  }

  /**
   * Get a room by its ID.
   */
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId.toUpperCase());
  }

  /**
   * Get player's room ID.
   */
  getPlayerRoomId(socketId: string): string | undefined {
    return this.playerRoomMap.get(socketId);
  }

  /**
   * Mark a player as disconnected (but keep their slot for reconnection).
   */
  markPlayerDisconnected(socketId: string): Room | null {
    const room = this.getPlayerRoom(socketId);
    if (!room) return null;

    const player = room.getPlayer(socketId);
    if (player) {
      player.isConnected = false;
    }
    return room;
  }

  /**
   * Get stats about active rooms.
   */
  getStats(): { totalRooms: number; totalPlayers: number } {
    let totalPlayers = 0;
    for (const room of this.rooms.values()) {
      totalPlayers += room.players.size;
    }
    return { totalRooms: this.rooms.size, totalPlayers };
  }
}
