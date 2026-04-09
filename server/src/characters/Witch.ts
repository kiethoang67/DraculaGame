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
  readonly name = 'Phù Thủy Rớt Bằng';
  readonly description = 'Bắt buộc phải nói dối (đáp ngược lại) khi bị 2 đứa ngồi ngay cạnh hỏi dò thẻ bài. Đứa ngồi xa thì trả lời thật.';
  readonly backstory = 'Thông minh sắc sảo nhưng không qua nổi bài thi thực hành bằng lái chổi. Toàn kẹt số de đâm lùi vào biển báo giao thông phường.';

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
