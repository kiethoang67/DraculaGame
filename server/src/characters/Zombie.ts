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
  readonly description = 'Must accept all dances. If the previous player danced, you must dance. If your dance is refused, you may immediately accuse.';

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
    
    // If ANY action in the previous turn was 'dance', the Zombie must dance
    return lastTurnActions.some(a => a.action === 'dance');
  }

  /**
   * Override: If Zombie's dance invitation is refused,
   * they can immediately flip the refuser's card to accuse.
   * We use the IMMEDIATE_ACCUSE action result to signal the game manager.
   */
  onDanceRefused(_gameState: GameState): ActionResult {
    return ActionResult.IMMEDIATE_ACCUSE;
  }
}
