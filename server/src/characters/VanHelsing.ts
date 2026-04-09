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
  readonly name = 'Thợ Săn Mù Đường';
  readonly description = 'Nếu có vụ bóc phốt xịt 100%, bạn được quyền lật mặt nạ và đoán xem ai là bá tước Dracula. Đoán đúng là bạn lụm lúa.';
  readonly backstory = 'Mua skin xịn chớp nháy nhưng vào trận toàn bấm lộn nút xả skill. Ra đường toàn săn hụt con mồi do mù bản đồ google maps.';

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
