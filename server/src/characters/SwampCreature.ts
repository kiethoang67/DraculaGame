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
  readonly name = 'Mầm Đá Đầm Lầy';
  readonly description = 'Bạn thăng thiên win game ngay khi bóc phốt trúng phóc 2 khứa ngồi kế bên cạnh, nhưng với điều kiện 2 khứa đó chưa lộ mặt.';
  readonly backstory = 'Ba ngày chưa gội đầu nên luôn tránh xa mấy hoạt động đổ mồ hôi. Ngại giao tiếp xã hội, ai kéo ra nhảy là phản kháng tới cùng.';

  /**
   * Override: Can only accuse immediate left and right neighbors.
   */
  getAccuseTargets(allPlayers: Player[], selfIndex: number, gameState: GameState): Player[] {
    const total = gameState.seatOrder.length;
    
    // In a 2-player game, there's only 1 neighbor, but Swamp Creature needs 2 to work predictably,
    // so we handle the wrapping math safely here.
    const leftIndex = (selfIndex - 1 + total) % total;
    const rightIndex = (selfIndex + 1) % total;

    // Build unique neighbor IDs
    const neighborIds = new Set<string>();
    neighborIds.add(gameState.seatOrder[leftIndex]);
    neighborIds.add(gameState.seatOrder[rightIndex]);
    
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
