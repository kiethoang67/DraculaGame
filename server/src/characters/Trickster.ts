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
  readonly description = 'Khi người chơi khác dùng hành động Hỏi (Inquire) với bạn, bạn luôn phải đưa lại thẻ Yes bất kể sự thật là gì. Chỉ buộc phải nói thật khi đối mặt với hành động Buộc tội (Accuse).';
  readonly backstory = '';

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
