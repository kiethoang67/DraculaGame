// ============================================================
// Dracula — The Host of the Feast
// ============================================================
// Ability: If his first Accuse fails, he gets a second
// consecutive Accuse action (second chance).
// ============================================================

import { CharacterRole } from './CharacterRole';
import { GameState } from '../models/GameState';
import { ActionResult, CharacterId } from '../types';

export class Dracula extends CharacterRole {
  readonly id = CharacterId.DRACULA;
  readonly name = 'Dracula';
  readonly description = 'Nếu bạn Buộc tội (Accuse) sai trong lượt của mình, bạn được quyền ưu tiên thực hiện thêm một hành động Buộc tội lần thứ 2 ngay lập tức.';
  readonly backstory = '';

  /**
   * Override: When Dracula's accusation fails, he gets a second chance
   * if he hasn't used it yet this game.
   */
  onAccuseFail(gameState: GameState): ActionResult {
    if (!gameState.draculaSecondChance) {
      // First failure: grant second chance
      gameState.draculaSecondChance = true;
      return ActionResult.RETRY_ACCUSE;
    }
    // Second failure: normal end turn
    return ActionResult.END_TURN;
  }
}
