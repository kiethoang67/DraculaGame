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
  readonly name = 'Quái Ế Gầm Giường';
  readonly description = 'Ai rủ nhảy cũng phải đi. Được quyền tung đòn bóc phốt sau bất kỳ vụ nhảy nào trong làng, hoặc khi bị đứa khác bơ thẳng thừng màn quẩy của mình.';
  readonly backstory = 'Tướng tá 6 múi cơ bắp thế thôi chứ vừa nhát gan vừa lười bóng chuyền. Cuối tháng gom không đủ tiền trọ đành chui xuống gầm giường trốn chủ nhà.';

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
