// ============================================================
// Alucard — Pretends to be Dracula
// ============================================================
// Abilities:
// 1. If queried "Are you Dracula?", must answer "Yes."
// 2. If assigned "Dracula" during an accusation, Alucard
//    immediately wins.
// 3. Wins if he Dances with Dracula.
// ============================================================

import { CharacterRole } from './CharacterRole';
import { GameState } from '../models/GameState';
import { ActionResult, CharacterId } from '../types';

export class Alucard extends CharacterRole {
  readonly id = CharacterId.ALUCARD;
  readonly name = 'Báo Thủ Ăn Ké';
  readonly description = 'Làm nũng đòi làm Dracula. Trả lời Yes khi bị hỏi có phải Dracula. Thắng ngay nếu bị tố hoặc múa chung với Dracula.';
  readonly backstory = 'Nghề nghiệp chính là "con trai của Dracula". Không có tài cán gì ngoài việc mượn oai bố đi khè thiên hạ và ăn trực.';

  /**
   * Override: Must answer "Yes" when asked "Are you Dracula?"
   * Otherwise answers truthfully.
   */
  handleInquiry(
    actualCharacterId: CharacterId,
    guessedCharacterId: CharacterId,
    _askerId: string,
    _gameState: GameState
  ): boolean {
    // If asked "Are you Dracula?", always say Yes
    if (guessedCharacterId === CharacterId.DRACULA) {
      return true;
    }
    // Otherwise answer truthfully
    return actualCharacterId === guessedCharacterId;
  }

  /**
   * Override: If accused as Dracula during another player's accusation,
   * Alucard immediately wins.
   */
  onAccusedAs(
    accusedAsCharacterId: CharacterId,
    _actualCharacterId: CharacterId,
    _gameState: GameState
  ): ActionResult {
    if (accusedAsCharacterId === CharacterId.DRACULA) {
      return ActionResult.IMMEDIATE_WIN;
    }
    return ActionResult.CONTINUE;
  }

  /**
   * Override: If Alucard dances with Dracula, Alucard wins immediately.
   */
  onDanceAccepted(
    _thisPlayerId: string,
    _partnerId: string,
    partnerCharacterId: CharacterId,
    _gameState: GameState
  ): ActionResult {
    if (partnerCharacterId === CharacterId.DRACULA) {
      return ActionResult.IMMEDIATE_WIN;
    }
    return ActionResult.CONTINUE;
  }
}
