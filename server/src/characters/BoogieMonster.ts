// ============================================================
// Boogie Monster — The Unstoppable Dancer
// ============================================================
// Abilities:
// 1. Must accept all dance requests.
// 2. May reveal to accuse immediately after ANY dance
//    (whether or not she was involved).
// 3. If she requests a dance and is rejected, she may
//    immediately accuse.
// ============================================================

import { CharacterRole } from './CharacterRole';
import { GameState } from '../models/GameState';
import { ActionResult, CharacterId } from '../types';

export class BoogieMonster extends CharacterRole {
  readonly id = CharacterId.BOOGIE_MONSTER;
  readonly name = 'Boogie Monster';
  readonly description = 'Bắt buộc phải nhận lời khi được đánh tiếng mời Khiêu vũ. Bạn có thể lật bài và thực hiện Buộc tội ngay lập tức sau khi có 2 người chơi bất kỳ Khiêu vũ thành công với nhau, hoặc khi lời mời Khiêu vũ của bạn bị từ chối.';
  readonly backstory = '';

  /** Override: Must accept all dance invitations. */
  mustAcceptDance(): boolean {
    return true;
  }

  /**
   * Override: If her dance invitation is refused,
   * she can immediately accuse.
   */
  onDanceRefused(_gameState: GameState): ActionResult {
    return ActionResult.IMMEDIATE_ACCUSE;
  }

  /**
   * Override: After any dance in the game, Boogie Monster
   * may reveal and accuse immediately.
   */
  onAnyDance(
    _dancer1Id: string,
    _dancer2Id: string,
    _gameState: GameState
  ): ActionResult {
    return ActionResult.IMMEDIATE_ACCUSE;
  }
}
