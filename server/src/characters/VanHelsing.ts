// ============================================================
// Van Helsing — The Monster Hunter
// ============================================================
// Ability (Observer Pattern):
// If ANY player's Accuse results in ALL "No"s (total failure),
// Van Helsing can immediately reveal herself and accuse exactly
// ONE player of being Dracula. If correct, she wins.
// ============================================================

import { CharacterRole } from './CharacterRole';
import { GameState } from '../models/GameState';
import { ActionResult, CharacterId } from '../types';

export class VanHelsing extends CharacterRole {
  readonly id = CharacterId.VAN_HELSING;
  readonly name = 'Van Helsing';
  readonly description = 'If any accusation results in all "No" answers, you may reveal and accuse one player of being Dracula. If correct, you win.';

  /**
   * Override (Observer): React to ANY player's accusation result.
   * If all responses were "No" (total failure), Van Helsing
   * gets a chance to identify Dracula.
   */
  onAnyAccuseResult(
    _accuserId: string,
    _success: boolean,
    allNos: boolean,
    _gameState: GameState
  ): ActionResult {
    if (allNos) {
      // Trigger Van Helsing's special accusation phase
      return ActionResult.IMMEDIATE_WIN; // Signals VH trigger to GameManager
    }
    return ActionResult.CONTINUE;
  }
}
