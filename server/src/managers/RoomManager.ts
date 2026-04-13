// ============================================================
// RoomManager — Singleton managing all game rooms
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import { Room } from '../models/Room';
import { Player } from '../models/Player';
import { CONFIG } from '../config';
import { saveRoom, deleteRoom, loadAllRooms } from '../persistence/RedisStore';

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
    let id: string;
    do {
      id = Math.floor(100000 + Math.random() * 900000).toString();
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

    saveRoom(room);
    console.log(`[RoomManager] Room ${roomId} created by ${nickname} (${hostSocketId})`);
    return { room, player };
  }

  /**
   * Join an existing room. Returns the room and the new player.
   */
  joinRoom(socketId: string, roomId: string, nickname: string): { room: Room; player: Player } {
    const room = this.rooms.get(roomId.toUpperCase());
    if (!room) {
      throw new Error(`Không tìm thấy phòng "${roomId}".`);
    }
    
    // Check for duplicate nicknames
    for (const p of room.players.values()) {
      if (p.nickname.toLowerCase() === nickname.toLowerCase()) {
        if (p.isConnected) {
          throw new Error(`Tên "${nickname}" đã có người sử dụng trong phòng này.`);
        } else {
          // If the player is disconnected, we should tell the handler to try rejoining
          // instead of joining as a new player.
          throw new Error('REJOIN_REQUIRED');
        }
      }
    }

    if (room.players.size >= room.maxPlayers) {
      throw new Error('Phòng đã đầy.');
    }

    // Remove player from any existing room
    this.removePlayerFromCurrentRoom(socketId);

    const player = new Player(socketId, nickname, roomId);
    player.seatIndex = room.players.size;

    room.addPlayer(player);
    this.playerRoomMap.set(socketId, roomId);

    saveRoom(room);
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
      deleteRoom(roomId);
      console.log(`[RoomManager] Room ${roomId} destroyed (empty)`);
      return null;
    }

    // Reassign seat indices after removal
    const players = room.getPlayersArray();
    players.forEach((p, i) => { p.seatIndex = i; });

    saveRoom(room);
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
   * Rejoin a room after disconnect. Swaps old socket ID with new one.
   * Returns the room, player, and whether the game is in progress.
   */
  rejoinRoom(newSocketId: string, roomId: string, nickname: string): { room: Room; player: Player; gameInProgress: boolean } | null {
    const room = this.rooms.get(roomId.toUpperCase());
    if (!room) return null;

    // Find the disconnected player by nickname
    let oldPlayer: Player | undefined;
    let oldSocketId: string | undefined;
    for (const [id, p] of room.players.entries()) {
      if (p.nickname.toLowerCase() === nickname.toLowerCase() && !p.isConnected) {
        oldPlayer = p;
        oldSocketId = id;
        break;
      }
    }

    if (!oldPlayer || !oldSocketId) return null;

    // Remove any existing mapping for the new socket
    this.removePlayerFromCurrentRoom(newSocketId);

    // Swap socket IDs in the room's players map
    room.players.delete(oldSocketId);
    oldPlayer.id = newSocketId;
    oldPlayer.isConnected = true;
    room.players.set(newSocketId, oldPlayer);

    // Update playerRoomMap
    this.playerRoomMap.delete(oldSocketId);
    this.playerRoomMap.set(newSocketId, room.id);

    // If host, update hostId
    if (room.hostId === oldSocketId) {
      room.hostId = newSocketId;
    }

    // Update gameState references (seatOrder, characterAssignments, etc.)
    if (room.gameState) {
      const gs = room.gameState;
      // Update seatOrder
      const seatIdx = gs.seatOrder.indexOf(oldSocketId);
      if (seatIdx !== -1) {
        gs.seatOrder[seatIdx] = newSocketId;
      }
      // Update characterAssignments
      const charId = gs.characterAssignments.get(oldSocketId);
      if (charId !== undefined) {
        gs.characterAssignments.delete(oldSocketId);
        gs.characterAssignments.set(newSocketId, charId);
      }
      // Update turnPlayerId if it was this player
      if (gs.turnPlayerId === oldSocketId) {
        gs.turnPlayerId = newSocketId;
      }
      // Update revealedPlayers
      if (gs.revealedPlayers.has(oldSocketId)) {
        gs.revealedPlayers.delete(oldSocketId);
        gs.revealedPlayers.add(newSocketId);
      }
      // Update failedAccusersThisTurn
      if (gs.failedAccusersThisTurn.has(oldSocketId)) {
        gs.failedAccusersThisTurn.delete(oldSocketId);
        gs.failedAccusersThisTurn.add(newSocketId);
      }
    }

    const gameInProgress = room.status === 'playing' && room.gameState !== null;
    saveRoom(room);
    console.log(`[RoomManager] ${nickname} rejoined room ${room.id} (${oldSocketId} -> ${newSocketId}), gameInProgress: ${gameInProgress}`);
    return { room, player: oldPlayer, gameInProgress };
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
      saveRoom(room);
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

  /**
   * Restore all rooms from Redis on server startup.
   */
  async restoreFromRedis(): Promise<void> {
    const { rooms, playerRoomMap } = await loadAllRooms();
    for (const [id, room] of rooms.entries()) {
      this.rooms.set(id, room);
    }
    for (const [playerId, roomId] of playerRoomMap.entries()) {
      this.playerRoomMap.set(playerId, roomId);
    }
    console.log(`[RoomManager] Restored ${rooms.size} rooms from Redis.`);
  }

  /**
   * Persist a room to Redis (called by external code like GameManager).
   */
  persistRoom(room: Room): void {
    saveRoom(room);
  }
}
