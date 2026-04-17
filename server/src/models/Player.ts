// ============================================================
// Player Model — Represents a connected player in a room
// ============================================================

import { CharacterId, IPlayerData, IPublicPlayer } from '../types';

export class Player implements IPlayerData {
  public id: string;
  public nickname: string;
  public roomId: string;
  public characterId: CharacterId | null;
  public isRevealed: boolean;
  public canDance: boolean;
  public canAccuse: boolean;
  public isHost: boolean;
  public seatIndex: number;
  public isConnected: boolean;

  constructor(id: string, nickname: string, roomId: string, isHost: boolean = false) {
    this.id = id;
    this.nickname = nickname;
    this.roomId = roomId;
    this.characterId = null;
    this.isRevealed = false;
    this.canDance = true;
    this.canAccuse = true;
    this.isHost = isHost;
    this.seatIndex = -1;
    this.isConnected = true;
  }

  /**
   * Returns only the public-safe player data (no secret role info).
   * This is what gets broadcast to the room.
   */
  toPublic(): IPublicPlayer {
    return {
      id: this.id,
      nickname: this.nickname,
      isRevealed: this.isRevealed,
      canDance: this.canDance,
      canAccuse: this.canAccuse,
      isHost: this.isHost,
      seatIndex: this.seatIndex,
      isConnected: this.isConnected,
      // Only include character if revealed
      ...(this.isRevealed && this.characterId ? { revealedCharacterId: this.characterId } : {}),
    };
  }

  /**
   * Reveal this player's character to the room.
   * Called on failed accuse or voluntary reveal.
   */
  reveal(): void {
    this.isRevealed = true;
    this.canDance = false; // Một khi lật bài là không thể dance nữa theo luật New Blood
  }

  /**
   * Called when a player's accusation fails.
   * They lose the ability to dance but remain in the game.
   */
  onAccuseFailed(): void {
    this.reveal();
  }

  /**
   * Reset player state for a new game (same room).
   */
  reset(): void {
    this.characterId = null;
    this.isRevealed = false;
    this.canDance = true;
    this.canAccuse = true;
  }
}
