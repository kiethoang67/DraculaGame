// ============================================================
// GameState Model — Turn-based state machine for the game
// ============================================================

import {
  GamePhase,
  IGameStatePublic,
  ITurnAction,
  PendingAction,
  CharacterId,
} from '../types';

export class GameState {
  public phase: GamePhase;
  public currentTurnIndex: number;
  public turnPlayerId: string;
  public turnNumber: number;
  public seatOrder: string[];                    // Player IDs in clockwise order
  public characterAssignments: Map<string, CharacterId>; // SERVER-ONLY: playerId -> characterId
  public mysteryGuests: CharacterId[];           // Unused cards face-down
  public revealedMysteryGuests: CharacterId[];   // Cards explicitly swapped and discarded (e.g. Dr Jekyll)
  public revealedPlayers: Set<string>;           // Player IDs who are revealed
  public turnHistory: ITurnAction[];
  public pendingAction: PendingAction | null;
  public draculaSecondChance: boolean;
  public ghostCounterAccuseOption: boolean;      // True if Ghost was incorrectly accused and can interrupt
  public failedAccusersThisTurn: Set<string>;    // Track failed accusers for Van Helsing
  public danceRefusedTargetId: string | null;    // Track who refused dance (can't be inquired)

  constructor(seatOrder: string[]) {
    this.phase = GamePhase.TURN_START;
    this.currentTurnIndex = 0;
    this.turnPlayerId = seatOrder[0];
    this.turnNumber = 1;
    this.seatOrder = seatOrder;
    this.characterAssignments = new Map();
    this.mysteryGuests = [];
    this.revealedMysteryGuests = [];
    this.revealedPlayers = new Set();
    this.turnHistory = [];
    this.pendingAction = null;
    this.draculaSecondChance = false;
    this.ghostCounterAccuseOption = false;
    this.failedAccusersThisTurn = new Set();
    this.danceRefusedTargetId = null;
  }

  /**
   * Advance to the next player's turn (clockwise).
   * Revealed players still get turns (they can Inquire/Accuse, just not Dance).
   */
  advanceTurn(): void {
    const playerCount = this.seatOrder.length;
    const nextIndex = (this.currentTurnIndex + 1) % playerCount;

    this.currentTurnIndex = nextIndex;
    this.turnPlayerId = this.seatOrder[nextIndex];
    this.turnNumber++;
    this.phase = GamePhase.TURN_START;
    this.pendingAction = null;
    this.draculaSecondChance = false;
    this.danceRefusedTargetId = null;
  }

  /**
   * Get the character assigned to a player.
   * SERVER-ONLY — never expose this directly to clients.
   */
  getPlayerCharacter(playerId: string): CharacterId | undefined {
    return this.characterAssignments.get(playerId);
  }

  /**
   * Set a player's character assignment.
   */
  setPlayerCharacter(playerId: string, characterId: CharacterId): void {
    this.characterAssignments.set(playerId, characterId);
  }

  /**
   * Swap two players' character cards (Dance mechanic).
   */
  swapCharacters(player1Id: string, player2Id: string): void {
    const char1 = this.characterAssignments.get(player1Id);
    const char2 = this.characterAssignments.get(player2Id);
    if (char1 && char2) {
      this.characterAssignments.set(player1Id, char2);
      this.characterAssignments.set(player2Id, char1);
    }
  }

  /**
   * Add a turn action to the public history log.
   */
  addTurnAction(action: ITurnAction): void {
    this.turnHistory.push(action);
  }

  /**
   * Get the seat index of a player.
   */
  getSeatIndex(playerId: string): number {
    return this.seatOrder.indexOf(playerId);
  }

  /**
   * Check if two players are neighbors (adjacent seats).
   */
  areNeighbors(player1Id: string, player2Id: string): boolean {
    const idx1 = this.getSeatIndex(player1Id);
    const idx2 = this.getSeatIndex(player2Id);
    const total = this.seatOrder.length;
    const diff = Math.abs(idx1 - idx2);
    return diff === 1 || diff === total - 1;
  }

  /**
   * Get the public-safe game state (no secret assignments).
   */
  toPublic(): IGameStatePublic {
    return {
      phase: this.phase,
      currentTurnIndex: this.currentTurnIndex,
      turnPlayerId: this.turnPlayerId,
      turnNumber: this.turnNumber,
      seatOrder: this.seatOrder,
      revealedPlayers: Array.from(this.revealedPlayers),
      mysteryGuestCount: this.mysteryGuests.length,
      revealedMysteryGuests: this.revealedMysteryGuests,
      turnHistory: this.turnHistory,
      danceRefusedTargetId: this.danceRefusedTargetId ?? undefined,
    };
  }
}
