// ============================================================
// Trickster — Always Says Yes
// ============================================================
// Ability: Always returns "Yes" when inquired.
//          Must answer honestly during an accusation.
// ============================================================

import { CharacterRole } from './CharacterRole';
import { GameState } from '../models/GameState';
import { CharacterId } from '../types';

export class Trickster extends CharacterRole {
  readonly id = CharacterId.TRICKSTER;
  readonly name = 'Trickster';
  readonly description = 'Always answer "Yes" when inquired. Answer honestly during accusations.';

  /**
   * Override: Always returns true (Yes) regardless of the guess.
   * This makes the Trickster incredibly deceptive during inquiries.
   * Note: During accusations, the standard truthful check is used
   * (handled separately by GameManager, not through this hook).
   */
  handleInquiry(
    _actualCharacterId: CharacterId,
    _guessedCharacterId: CharacterId,
    _askerId: string,
    _gameState: GameState
  ): boolean {
    return true; // Always "Yes"
  }
}
