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
  readonly description = 'If your first accusation fails, you may immediately accuse again.';

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
