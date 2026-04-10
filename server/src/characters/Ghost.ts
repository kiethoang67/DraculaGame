// ============================================================
// Ghost — The Counter-Accuser
// ============================================================
// Abilities:
// 1. Must accept all dance invitations.
// 2. Can counter-accuse immediately if someone accuses her incorrectly.
// ============================================================

import { CharacterRole } from './CharacterRole';
import { GameState } from '../models/GameState';
import { ActionResult, CharacterId } from '../types';

export class Ghost extends CharacterRole {
  readonly id = CharacterId.GHOST;
  readonly name = 'Ghost';
  readonly description = 'Bắt buộc phải nhận lời mời Khiêu vũ. Nếu có ai đó Buộc tội đúng thân thế của bạn nhưng toàn bộ vòng Buộc tội của họ lại thất bại, bạn có quyền lật bài và nhảy vào Buộc tội lại ngay lập tức.';
  readonly backstory = '';

  /** Override: Must accept all dance invitations. */
  mustAcceptDance(): boolean {
    return true;
  }

  /**
   * Override: If accused incorrectly, Ghost can counter-accuse immediately.
   */
  onAccusedIncorrectly(
    _accusedAsCharacterId: CharacterId,
    _gameState: GameState
  ): ActionResult {
    return ActionResult.COUNTER_ACCUSE;
  }
}
