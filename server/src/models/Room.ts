// ============================================================
// Room Model — A game lobby with players and state
// ============================================================

import { RoomStatus, IRoomData } from '../types';
import { Player } from './Player';
import { GameState } from './GameState';
import { CONFIG } from '../config';

export class Room {
  public id: string;
  public hostId: string;
  public players: Map<string, Player>;
  public gameState: GameState | null;
  public status: RoomStatus;
  public maxPlayers: number;
  public minPlayers: number;
  public createdAt: number;

  constructor(id: string, hostId: string) {
    this.id = id;
    this.hostId = hostId;
    this.players = new Map();
    this.gameState = null;
    this.status = RoomStatus.WAITING;
    this.maxPlayers = CONFIG.MAX_PLAYERS;
    this.minPlayers = CONFIG.MIN_PLAYERS;
    this.createdAt = Date.now();
  }

  /**
   * Add a player to the room.
   */
  addPlayer(player: Player): boolean {
    if (this.players.size >= this.maxPlayers) return false;
    // Allow joining even if status is not WAITING (Spectator support)
    this.players.set(player.id, player);
    return true;
  }

  /**
   * Remove a player from the room.
   * Returns true if room should be destroyed (empty).
   */
  removePlayer(playerId: string): boolean {
    this.players.delete(playerId);

    // If room is empty, mark for destruction
    if (this.players.size === 0) return true;

    // If host left, assign new host
    if (this.hostId === playerId) {
      const nextPlayer = this.players.values().next().value;
      if (nextPlayer) {
        this.hostId = nextPlayer.id;
        nextPlayer.isHost = true;
      }
    }

    return false;
  }

  /**
   * Get a player by socket ID.
   */
  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  /**
   * Check if enough players to start.
   */
  canStart(): boolean {
    return (
      this.status === RoomStatus.WAITING &&
      this.players.size >= this.minPlayers &&
      this.players.size <= this.maxPlayers
    );
  }

  /**
   * Get players as an array, sorted by seat index.
   */
  getPlayersArray(): Player[] {
    return Array.from(this.players.values()).sort((a, b) => a.seatIndex - b.seatIndex);
  }

  /**
   * Get public room data (safe to send to clients).
   */
  toPublic(): IRoomData {
    return {
      id: this.id,
      hostId: this.hostId,
      players: this.getPlayersArray().map(p => p.toPublic()),
      status: this.status,
      maxPlayers: this.maxPlayers,
      minPlayers: this.minPlayers,
    };
  }
}
