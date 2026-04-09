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
  readonly name = 'Bá Tước Mỡ Máu';
  readonly description = 'Nếu phốt xịt lần đầu, bạn có quyền nháp lại và bóc phốt tiếp ngay lập tức.';
  readonly backstory = 'Vẫn đam mê tiết canh tào phớ nhưng gần đây đi khám bị mỡ máu cao, bác sĩ bắt chuyển sang bú trà kombucha ép cân.';

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
