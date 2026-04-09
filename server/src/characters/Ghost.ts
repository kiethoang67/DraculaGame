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
  readonly name = 'Hồn Ma Bú Fame';
  readonly description = 'Ai rủ quẩy cũng phải gật. Ai nhắm mắt vu khống xịt là bạn có quyền đứng lên sờ gáy họ lại ngay tập lập tức.';
  readonly backstory = 'Mắc chứng sợ bị cho ra rìa. Thấy nhà ai có drama cãi lộn xập xình là hóng hớt, rủ rê cái gì cũng hùa theo cho bằng được.';

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
