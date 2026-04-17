// ============================================================
// Zombie — The Neighbor Accuser
// ============================================================
// Abilities:
// 1. Must accept all dance requests.
// 2. Cannot initiate a dance.
// 3. When accusing, can only target immediate left and right
//    neighbors. If both neighbors are revealed, must accuse all.
// ============================================================

import { CharacterRole } from './CharacterRole';
import { Player } from '../models/Player';
import { GameState } from '../models/GameState';
import { ActionResult, CharacterId } from '../types';

export class Zombie extends CharacterRole {
  readonly id = CharacterId.ZOMBIE;
  readonly name = 'Zombie';
  readonly description = 'Bắt buộc phải chấp nhận mọi lời mời Khiêu vũ. Nếu người chơi liền trước bạn thực hiện Khiêu vũ, lượt này bạn BẮT BUỘC phải thực hiện hành động Khiêu vũ. Nếu người bạn mời từ chối, bạn có thể Buộc tội ngay lập tức.';
  readonly backstory = '';

  /** Override: Must accept all dance invitations. */
  mustAcceptDance(): boolean {
    return true;
  }

  /**
   * Override: If the previous player in turn order danced, Zombie is forced to dance.
   */
  mustDanceThisTurn(gameState: GameState): boolean {
    // Check if the action of the previous turn was 'dance'
    // Turn history is naturally sorted by timestamp/turnNumber
    // but let's just check the last recorded actions
    if (gameState.turnHistory.length === 0) return false;
    
    // Find the last turn's action before this one
    // currentTurnIndex is the seat index, but turnNumber tracks overall turns.
    // The previous turn is turnNumber - 1.
    const currentTurn = gameState.turnNumber;
    if (currentTurn <= 1) return false;

    // Look for actions in the previous turn
    const lastTurnActions = gameState.turnHistory.filter(a => a.turnNumber === currentTurn - 1);
    
    // Rule: Zombie ONLY forced to dance if previous player's dance was SUCCESSFUL (accepted)
    return lastTurnActions.some(a => a.action === 'dance' && a.danceAccepted === true);
  }

  /**
   * Override: If Zombie's dance invitation is refused,
   * they can force the refuser to reveal their card and then must immediately accuse.
   */
  onDanceRefused(_gameState: GameState): ActionResult {
    return ActionResult.ZOMBIE_REVEAL_AND_ACCUSE;
  }
}
