// ============================================================
// CharacterRole — Interface & Abstract Base Class
// ============================================================
// This is the core of the OOP polymorphism system.
// Each character extends CharacterRole and overrides specific
// hooks to implement their unique abilities.
// ============================================================

import { Player } from '../models/Player';
import { GameState } from '../models/GameState';
import { ActionResult, CharacterId } from '../types';

/**
 * Interface defining all hooks a character can override.
 * The game engine calls these hooks at specific points in the
 * turn lifecycle, enabling polymorphic behavior.
 */
export interface ICharacterRole {
  readonly id: CharacterId;
  readonly name: string;
  readonly description: string;

  // ── Inquiry Hooks ─────────────────────────────────────
  /**
   * Called when this character is asked "Are you [X]?"
   * @returns The answer to give (true = Yes, false = No).
   *          Default: truthful answer. Overridden by Trickster, Alucard, Witch.
   */
  handleInquiry(
    actualCharacterId: CharacterId,
    guessedCharacterId: CharacterId,
    askerId: string,
    gameState: GameState
  ): boolean;

  // ── Dance Hooks ───────────────────────────────────────
  /** Whether this character must accept all dance invitations. */
  mustAcceptDance(): boolean;

  /** Whether this character can initiate a dance. */
  canInitiateDance(): boolean;

  /**
   * Called when a dance is accepted. Can trigger special effects.
   * @returns ActionResult indicating what happens next.
   */
  onDanceAccepted(
    thisPlayerId: string,
    partnerId: string,
    partnerCharacterId: CharacterId,
    gameState: GameState
  ): ActionResult;

  /**
   * Called when this character's dance invitation is refused.
   * @returns ActionResult (e.g., BoogieMonster can accuse immediately).
   */
  onDanceRefused(gameState: GameState): ActionResult;

  // ── Accuse Hooks ──────────────────────────────────────
  /**
   * Called when this character's accusation fails.
   * @returns ActionResult (e.g., Dracula gets RETRY_ACCUSE).
   */
  onAccuseFail(gameState: GameState): ActionResult;

  /**
   * Called when another player accuses this character as a specific role.
   * @returns ActionResult (e.g., Alucard wins if accused as Dracula).
   */
  onAccusedAs(
    accusedAsCharacterId: CharacterId,
    actualCharacterId: CharacterId,
    gameState: GameState
  ): ActionResult;

  /**
   * Get valid accuse targets. Default: all unrevealed players.
   * Zombie overrides to only target neighbors.
   */
  getAccuseTargets(allPlayers: Player[], selfIndex: number, gameState: GameState): Player[];

  // ── Observer Hooks (triggered by other players' actions) ──
  /**
   * Called after ANY player's accusation resolves.
   * Van Helsing watches for all-No results.
   */
  onAnyAccuseResult(
    accuserId: string,
    success: boolean,
    allNos: boolean,
    gameState: GameState
  ): ActionResult;

  /**
   * Called when ANY dance occurs in the game.
   * BoogieMonster may accuse after any dance.
   */
  onAnyDance(
    dancer1Id: string,
    dancer2Id: string,
    gameState: GameState
  ): ActionResult;

  /**
   * Called when this character is accused incorrectly
   * Ghost can immediately counter-accuse
   */
  onAccusedIncorrectly(
    accusedAsCharacterId: CharacterId,
    gameState: GameState
  ): ActionResult;

  /**
   * Called at the end of this player's turn.
   * Doctor Jekyll can choose to swap with mystery guest here instead of forced before inquire.
   */
  onEndOfTurn(gameState: GameState): ActionResult;

  /**
   * Determines if this character IS FORCED to dance this turn.
   * Zombie is forced to dance if the previous player danced.
   */
  mustDanceThisTurn(gameState: GameState): boolean;

  /**
   * Called before this character performs an inquiry.
   * Doctor Jekyll must reveal and swap with mystery guest first.
   */
  beforeInquire(gameState: GameState): ActionResult;
}

/**
 * Abstract base class providing default (standard) behavior
 * for all character hooks. Specific characters override only
 * the methods where their abilities differ from the default.
 *
 * This is the Template Method pattern — the game engine calls
 * the hooks, and each character provides its own implementation.
 */
export abstract class CharacterRole implements ICharacterRole {
  abstract readonly id: CharacterId;
  abstract readonly name: string;
  abstract readonly description: string;

  /**
   * Default: Answer truthfully.
   * "Are you X?" → Yes if actualCharacterId === guessedCharacterId
   */
  handleInquiry(
    actualCharacterId: CharacterId,
    guessedCharacterId: CharacterId,
    _askerId: string,
    _gameState: GameState
  ): boolean {
    return actualCharacterId === guessedCharacterId;
  }

  /** Default: Can choose to accept or refuse. */
  mustAcceptDance(): boolean {
    return false;
  }

  /** Default: Can initiate a dance. */
  canInitiateDance(): boolean {
    return true;
  }

  /** Default: Normal dance, no special effect. */
  onDanceAccepted(
    _thisPlayerId: string,
    _partnerId: string,
    _partnerCharacterId: CharacterId,
    _gameState: GameState
  ): ActionResult {
    return ActionResult.CONTINUE;
  }

  /** Default: Dance refused, active player must inquire someone else. */
  onDanceRefused(_gameState: GameState): ActionResult {
    return ActionResult.CONTINUE;
  }

  /** Default: Accusation fails, turn ends. */
  onAccuseFail(_gameState: GameState): ActionResult {
    return ActionResult.END_TURN;
  }

  /** Default: No special effect when accused. */
  onAccusedAs(
    _accusedAsCharacterId: CharacterId,
    _actualCharacterId: CharacterId,
    _gameState: GameState
  ): ActionResult {
    return ActionResult.CONTINUE;
  }

  /** Default: Can accuse all unrevealed players. */
  getAccuseTargets(allPlayers: Player[], _selfIndex: number, _gameState: GameState): Player[] {
    return allPlayers.filter(p => !p.isRevealed);
  }

  /** Default: No reaction to other players' accusations. */
  onAnyAccuseResult(
    _accuserId: string,
    _success: boolean,
    _allNos: boolean,
    _gameState: GameState
  ): ActionResult {
    return ActionResult.CONTINUE;
  }

  /** Default: No reaction to dances. */
  onAnyDance(
    _dancer1Id: string,
    _dancer2Id: string,
    _gameState: GameState
  ): ActionResult {
    return ActionResult.CONTINUE;
  }

  /** Default: No reaction to being incorrectly accused. */
  onAccusedIncorrectly(
    _accusedAsCharacterId: CharacterId,
    _gameState: GameState
  ): ActionResult {
    return ActionResult.CONTINUE;
  }

  /** Default: No special end of turn action. */
  onEndOfTurn(_gameState: GameState): ActionResult {
    return ActionResult.CONTINUE;
  }

  /** Default: Not forced to dance. */
  mustDanceThisTurn(_gameState: GameState): boolean {
    return false;
  }

  /** Default: No pre-inquiry requirement. */
  beforeInquire(_gameState: GameState): ActionResult {
    return ActionResult.CONTINUE;
  }
}
