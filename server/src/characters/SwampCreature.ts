// ============================================================
// Swamp Creature — The Neighbor Accuser
// ============================================================
// Ability: Can win by accusing only their left and right neighbors,
// but only if neither neighbor is revealed yet.
// ============================================================

import { CharacterRole } from './CharacterRole';
import { Player } from '../models/Player';
import { GameState } from '../models/GameState';
import { CharacterId } from '../types';

export class SwampCreature extends CharacterRole {
  readonly id = CharacterId.SWAMP_CREATURE;
  readonly name = 'Swamp Creature';
  readonly description = 'Bạn lập tức giành chiến thắng nếu thực hiện hành động Buộc tội chính xác duy nhất 2 người ngồi ngay sát hai bên (trái và phải) của bạn, với điều kiện cả 2 đều chưa lật bài.';
  readonly backstory = '';

  /**
   * Override: Can only accuse immediate left and right neighbors.
   */
  getAccuseTargets(allPlayers: Player[], selfIndex: number, gameState: GameState): Player[] {
    const total = gameState.seatOrder.length;
    
    // In a 2-player game, there's only 1 neighbor, but Swamp Creature needs 2 to work predictably,
    // so we handle the wrapping math safely here.
    const leftIndex = (selfIndex - 1 + total) % total;
    const rightIndex = (selfIndex + 1) % total;

    const leftPlayerId = gameState.seatOrder[leftIndex];
    const rightPlayerId = gameState.seatOrder[rightIndex];

    const leftPlayer = allPlayers.find(p => p.id === leftPlayerId);
    const rightPlayer = allPlayers.find(p => p.id === rightPlayerId);

    // Rule: "Nếu 1 trong 2 (hoặc cả 2) hàng xóm đã bị lật bài, hắn phải buộc tội tất cả mọi người như bình thường."
    if ((leftPlayer && leftPlayer.isRevealed) || (rightPlayer && rightPlayer.isRevealed)) {
      // Fallback: Must accuse EVERYONE (all unrevealed)
      return allPlayers.filter(p => !p.isRevealed && p.id !== gameState.seatOrder[selfIndex]);
    }

    // Build unique neighbor IDs
    const neighborIds = new Set<string>();
    neighborIds.add(leftPlayerId);
    neighborIds.add(rightPlayerId);
    
    // Also remove the player themselves if it's < 3 players (edge case)
    neighborIds.delete(gameState.seatOrder[selfIndex]);

    const neighbors: Player[] = [];
    for (const player of allPlayers) {
      if (neighborIds.has(player.id) && !player.isRevealed) {
        neighbors.push(player);
      }
    }

    return neighbors;
  }
}
