// ============================================================
// Doctor Jekyll — The Shapeshifter
// ============================================================
// Ability: Before making an inquiry, she must reveal her card,
// then swap her Guest card with a Mystery Guest card.
// ============================================================

import { CharacterRole } from './CharacterRole';
import { GameState } from '../models/GameState';
import { ActionResult, CharacterId } from '../types';

export class DoctorJekyll extends CharacterRole {
  readonly id = CharacterId.DOCTOR_JEKYLL;
  readonly name = 'Doctor Jekyll';
  readonly description = 'Bắt buộc phải chấp nhận mọi lời mời Khiêu vũ. Khi kết thúc lượt tiến hành của mình, bạn có quyền lật mặt nạ và bí mật tráo đổi Thẻ vai trò của mình với Khách Ẩn giữa bàn.';
  readonly backstory = '';

  /** Override: Must accept all dance invitations. */
  mustAcceptDance(): boolean {
    return true;
  }

  /**
   * Override: At the end of Doctor Jekyll's turn, she may choose to
   * reveal herself and swap her character card with the Mystery Guest.
   */
  onEndOfTurn(_gameState: GameState): ActionResult {
    return ActionResult.SWAP_MYSTERY;
  }
}
