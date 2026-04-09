// ============================================================
// Witch — The Lying Neighbor
// ============================================================
// Ability: Must lie about her identity if queried by a neighbor
// (adjacent seat). Answers truthfully to non-neighbors.
// ============================================================

import { CharacterRole } from './CharacterRole';
import { GameState } from '../models/GameState';
import { CharacterId } from '../types';

export class Witch extends CharacterRole {
  readonly id = CharacterId.WITCH;
  readonly name = 'Witch';
  readonly description = 'Must lie about your identity when queried by a neighbor.';

  /**
   * Override: If the asker is a neighbor (adjacent seat),
   * the Witch must lie — invert her truthful answer.
   * If asked by a non-neighbor, she answers truthfully.
   */
  handleInquiry(
    actualCharacterId: CharacterId,
    guessedCharacterId: CharacterId,
    askerId: string,
    gameState: GameState
  ): boolean {
    const truthfulAnswer = actualCharacterId === guessedCharacterId;

    // Check if the asker is a neighbor
    // We need to find the player who has this character to get their seat
    // The askerId is the socket ID of the asker
    const witchPlayerId = this.findPlayerIdByCharacter(actualCharacterId, gameState);
    if (witchPlayerId && gameState.areNeighbors(askerId, witchPlayerId)) {
      // Lie to neighbors
      return !truthfulAnswer;
    }

    return truthfulAnswer;
  }

  /**
   * Helper: Find the player ID who currently holds a given character.
   */
  private findPlayerIdByCharacter(characterId: CharacterId, gameState: GameState): string | undefined {
    for (const [playerId, charId] of gameState.characterAssignments) {
      if (charId === characterId) return playerId;
    }
    return undefined;
  }
}
