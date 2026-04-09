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
  readonly name = 'Tiến Sĩ Chập Mạch';
  readonly description = 'Ai rủ nhảy cũng phải nhận lời. Cuối lượt, bạn có quyền lật bài để tráo thân phận với thẻ Khách Mời Bí Ẩn đang úp ở giữa bàn.';
  readonly backstory = 'Hôm qua đang chế thuốc thì vấp phải dây điện nguồn máy chủ. Từ đó phần cứng lâu lâu bị chập phát sinh ra đa nhân cách lúc này lúc nọ.';

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
