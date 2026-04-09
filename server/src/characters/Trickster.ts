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
  readonly name = 'Chuyên Gia Phông Bạt';
  readonly description = 'Chúa nói dối, ai tra hỏi cũng trả lời CÓ. Chỉ thành thật khi bị bóc phốt.';
  readonly backstory = 'Kỹ năng thì ít nhưng văn vở thì nhiều. Lên mạng mua khóa học làm giàu rồi ra sàn khiêu vũ lùa gà người khác.';

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
