// ============================================================
// GameManager — Core Game Logic & Turn Processing
// ============================================================
// Handles the state machine transitions, action validation,
// and character ability dispatch via polymorphism.
// ============================================================

import { Server, Socket } from 'socket.io';
import { Room } from '../models/Room';
import { Player } from '../models/Player';
import { GameState } from '../models/GameState';
import { DeckManager } from './DeckManager';
import { RoomManager } from './RoomManager';
import { CharacterFactory } from '../characters/CharacterFactory';
import {
  GamePhase,
  ActionResult,
  CharacterId,
  RoomStatus,
  IPendingInquiry,
  IPendingDance,
  IPendingAccuse,
  ITurnAction,
} from '../types';

export class GameManager {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  // ── Game Start ──────────────────────────────────────────

  /**
   * Initialize and start a new game in a room.
   * Deals cards, assigns characters, and sends each player
   * ONLY their own character via private socket emission.
   */
  startGame(room: Room): void {
    const players = room.getPlayersArray();
    const playerCount = players.length;

    // Build deck and deal
    const { dealt, mysteryGuests } = DeckManager.buildAndDeal(playerCount);

    // Create seat order (player IDs in order)
    const seatOrder = players.map(p => p.id);

    // Initialize game state
    const gameState = new GameState(seatOrder);
    gameState.mysteryGuests = mysteryGuests;

    // Assign characters to players (SERVER-ONLY)
    players.forEach((player, index) => {
      player.characterId = dealt[index];
      player.reset();
      player.characterId = dealt[index]; // re-set after reset
      gameState.setPlayerCharacter(player.id, dealt[index]);
    });

    room.gameState = gameState;
    room.status = RoomStatus.PLAYING;

    // ═══ CRITICAL SECURITY ═══
    // Send each player ONLY their own character via private emission
    players.forEach(player => {
      this.io.to(player.id).emit('game-started', {
        characterId: player.characterId,
        characterInfo: CharacterFactory.create(player.characterId!).description,
        characterName: CharacterFactory.create(player.characterId!).name,
        players: players.map(p => p.toPublic()),
        seatOrder,
        gameState: gameState.toPublic(),
      });
    });

    // Announce first turn
    this.emitTurnStart(room);

    // Persist to Redis
    RoomManager.getInstance().persistRoom(room);

    console.log(`[GameManager] Game started in room ${room.id} with ${playerCount} players`);
  }

  // ── Turn Management ─────────────────────────────────────

  /**
   * Emit turn start to the room.
   */
  private emitTurnStart(room: Room): void {
    if (!room.gameState) return;
    room.gameState.phase = GamePhase.ACTION_SELECT;

    this.io.to(room.id).emit('turn-start', {
      turnPlayerId: room.gameState.turnPlayerId,
      turnNumber: room.gameState.turnNumber,
      phase: room.gameState.phase,
      gameState: room.gameState.toPublic(),
    });

    // Persist to Redis after every turn change
    RoomManager.getInstance().persistRoom(room);
  }

  /**
   * Advance to the next turn and emit.
   */
  private advanceTurn(room: Room): void {
    if (!room.gameState) return;

    // Check end-of-turn hooks before advancing (e.g., Doctor Jekyll's swap)
    const currentTurnPlayerId = room.gameState.turnPlayerId;
    const currentCharId = room.gameState.getPlayerCharacter(currentTurnPlayerId);
    if (currentCharId) {
      const char = CharacterFactory.create(currentCharId);
      const endOfTurnResult = char.onEndOfTurn(room.gameState);
      
      const player = room.getPlayer(currentTurnPlayerId);
      if (endOfTurnResult === ActionResult.SWAP_MYSTERY && player && !player.isRevealed) {
        // Automatically swap with mystery guest if not revealed
        this.handleDoctorJekyllSwap(room, player);
      }
    }

    room.gameState.advanceTurn();
    this.emitTurnStart(room);
  }

  // ── INQUIRE Action (Two-Phase: Request → Target Responds) ──

  /**
   * Phase 1: Active player sends an inquiry request.
   * Server validates, sets pending state, and asks the target
   * to manually respond with a Whisper card (Yes/No).
   * 
   * The target's character ability computes a "suggested answer"
   * which is shown to the target as guidance, but the target
   * ultimately chooses which Whisper card to hand over.
   */
  handleInquireRequest(
    socket: Socket,
    room: Room,
    targetId: string,
    characterGuess: CharacterId
  ): void {
    const gameState = room.gameState;
    if (!gameState) return;

    const askerId = socket.id;
    const asker = room.getPlayer(askerId);
    const target = room.getPlayer(targetId);

    // Validate
    if (!asker || !target) return;
    if (gameState.turnPlayerId !== askerId) {
      socket.emit('game-error', { message: 'Chưa đến lượt của bạn.' });
      return;
    }
    if (gameState.phase !== GamePhase.ACTION_SELECT && gameState.phase !== GamePhase.DANCE_REFUSED) {
      socket.emit('game-error', { message: 'Hành động không hợp lệ trong giai đoạn này.' });
      return;
    }

    // Check if player is forced to dance (e.g., Zombie)
    let askerCharacterId = gameState.getPlayerCharacter(askerId);
    if (askerCharacterId) {
      const askerChar = CharacterFactory.create(askerCharacterId);
      if (askerChar.mustDanceThisTurn(gameState)) {
        socket.emit('game-error', { message: 'Lượt này bạn bắt buộc phải Khiêu vũ!' });
        return;
      }
    }
    if (target.isRevealed) {
      socket.emit('game-error', { message: 'Không thể hỏi người đã lật bài.' });
      return;
    }
    if (targetId === askerId) {
      socket.emit('game-error', { message: 'Không thể tự hỏi chính mình.' });
      return;
    }
    // Block inquiring the person who refused your dance
    if (gameState.danceRefusedTargetId && targetId === gameState.danceRefusedTargetId) {
      socket.emit('game-error', { message: 'Không thể hỏi người vừa từ chối khiêu vũ. Vui lòng chọn người khác.' });
      return;
    }

    // Check Doctor Jekyll's beforeInquire hook
    askerCharacterId = gameState.getPlayerCharacter(askerId);
    if (askerCharacterId) {
      const askerChar = CharacterFactory.create(askerCharacterId);
      const beforeResult = askerChar.beforeInquire(gameState);
      if (beforeResult === ActionResult.SWAP_MYSTERY) {
        // Doctor Jekyll: reveal and swap with mystery guest
        this.handleDoctorJekyllSwap(room, asker);
      }
    }

    // Compute the suggested answer via the target's character ability
    // This is what the character's ability recommends, but the target chooses
    const targetCharacterId = gameState.getPlayerCharacter(targetId);
    if (!targetCharacterId) return;

    const targetChar = CharacterFactory.create(targetCharacterId);
    const suggestedAnswer = targetChar.handleInquiry(targetCharacterId, characterGuess, askerId, gameState);

    // Set pending inquiry — wait for target's manual response
    gameState.phase = GamePhase.INQUIRE_PENDING;
    gameState.pendingAction = {
      type: 'inquire',
      askerId,
      targetId,
      characterGuess,
    } as IPendingInquiry;

    // Send the question to the TARGET with suggested answer
    // The target sees what their ability recommends and chooses
    this.io.to(targetId).emit('inquire-incoming', {
      fromId: askerId,
      fromNickname: asker.nickname,
      characterGuess,
      suggestedAnswer, // What your ability recommends
      characterName: targetChar.name,
    });

    // Broadcast public info (who asked whom about what — NOT the answer)
    this.io.to(room.id).emit('inquire-public', {
      askerId,
      askerNickname: asker.nickname,
      targetId,
      targetNickname: target.nickname,
      characterGuess,
    });

    // Notify the asker that we're waiting for the target's response
    socket.emit('inquire-waiting', {
      targetId,
      targetNickname: target.nickname,
      characterGuess,
    });
  }

  /**
   * Phase 2: Target player manually responds with Yes or No (Whisper card).
   * The server forwards the answer ONLY to the asker.
   */
  handleInquireResponse(
    socket: Socket,
    room: Room,
    answer: boolean
  ): void {
    const gameState = room.gameState;
    if (!gameState || !gameState.pendingAction) return;
    if (gameState.pendingAction.type !== 'inquire') return;

    const pending = gameState.pendingAction as IPendingInquiry;

    // Validate: only the target can respond
    if (socket.id !== pending.targetId) {
      socket.emit('game-error', { message: 'Bạn không phải là người được hỏi.' });
      return;
    }

    const asker = room.getPlayer(pending.askerId);
    const target = room.getPlayer(pending.targetId);
    if (!asker || !target) return;

    // Send the answer ONLY to the asker (private — like handing a Whisper card)
    this.io.to(pending.askerId).emit('inquire-result', {
      targetId: pending.targetId,
      targetNickname: target.nickname,
      characterGuess: pending.characterGuess,
      answer,
    });

    // Confirm to the target that their response was sent
    socket.emit('inquire-response-sent', {
      answer,
      characterGuess: pending.characterGuess,
    });

    // Log the action
    gameState.addTurnAction({
      turnNumber: gameState.turnNumber,
      playerId: pending.askerId,
      playerNickname: asker.nickname,
      action: 'inquire',
      targetId: pending.targetId,
      targetNickname: target.nickname,
      characterGuess: pending.characterGuess,
      timestamp: Date.now(),
    });

    // Clear pending and advance turn
    gameState.pendingAction = null;
    this.advanceTurn(room);
  }

  // ── DANCE Action ────────────────────────────────────────

  /**
   * Process a dance offer from the active player.
   */
  handleDanceOffer(socket: Socket, room: Room, targetId: string): void {
    const gameState = room.gameState;
    if (!gameState) return;

    const inviterId = socket.id;
    const inviter = room.getPlayer(inviterId);
    const target = room.getPlayer(targetId);

    // Validate
    if (!inviter || !target) return;
    if (gameState.turnPlayerId !== inviterId) {
      socket.emit('game-error', { message: 'Chưa đến lượt của bạn.' });
      return;
    }
    if (gameState.phase !== GamePhase.ACTION_SELECT) {
      socket.emit('game-error', { message: 'Hành động không hợp lệ trong giai đoạn này.' });
      return;
    }
    if (!inviter.canDance) {
      socket.emit('game-error', { message: 'Bạn không thể khiêu vũ (đã buộc tội thất bại).' });
      return;
    }
    if (target.isRevealed) {
      socket.emit('game-error', { message: 'Không thể khiêu vũ với người đã lật bài.' });
      return;
    }

    // Check if inviter's character can initiate dance (Zombie cannot)
    const inviterCharId = gameState.getPlayerCharacter(inviterId);
    if (inviterCharId) {
      const inviterChar = CharacterFactory.create(inviterCharId);
      if (!inviterChar.canInitiateDance()) {
        socket.emit('game-error', { message: 'Nhân vật của bạn không thể mời khiêu vũ.' });
        return;
      }
    }

    // Check if target must accept (Werewolf, Zombie, BoogieMonster)
    const targetCharId = gameState.getPlayerCharacter(targetId);
    if (targetCharId) {
      const targetChar = CharacterFactory.create(targetCharId);
      if (targetChar.mustAcceptDance()) {
        // Auto-accept
        this.processDanceAccepted(room, inviterId, targetId);
        return;
      }
    }

    // Set pending dance and wait for target's response
    gameState.phase = GamePhase.DANCE_PENDING;
    gameState.pendingAction = {
      type: 'dance',
      inviterId,
      targetId,
    } as IPendingDance;

    // Notify the target of the dance invitation
    this.io.to(targetId).emit('dance-incoming', {
      fromId: inviterId,
      fromNickname: inviter.nickname,
    });

    // Broadcast public info
    this.io.to(room.id).emit('dance-public-offer', {
      inviterId,
      inviterNickname: inviter.nickname,
      targetId,
      targetNickname: target.nickname,
    });
  }

  /**
   * Process the target's response to a dance invitation.
   */
  handleDanceResponse(socket: Socket, room: Room, accepted: boolean): void {
    const gameState = room.gameState;
    if (!gameState || !gameState.pendingAction) return;
    if (gameState.pendingAction.type !== 'dance') return;

    const pending = gameState.pendingAction as IPendingDance;
    if (socket.id !== pending.targetId) {
      socket.emit('game-error', { message: 'Bạn không phải là người được mời khiêu vũ.' });
      return;
    }

    if (accepted) {
      this.processDanceAccepted(room, pending.inviterId, pending.targetId);
    } else {
      this.processDanceRefused(room, pending.inviterId, pending.targetId);
    }
  }

  /**
   * Process an accepted dance — swap characters (per user spec).
   */
  private processDanceAccepted(room: Room, inviterId: string, targetId: string): void {
    const gameState = room.gameState;
    if (!gameState) return;

    const inviterCharId = gameState.getPlayerCharacter(inviterId);
    const targetCharId = gameState.getPlayerCharacter(targetId);
    if (!inviterCharId || !targetCharId) return;

    // Check Alucard's win condition BEFORE swap
    let alucardWin: { winnerId: string } | null = null;

    const inviterChar = CharacterFactory.create(inviterCharId);
    const inviterDanceResult = inviterChar.onDanceAccepted(inviterId, targetId, targetCharId, gameState);
    if (inviterDanceResult === ActionResult.IMMEDIATE_WIN) {
      alucardWin = { winnerId: inviterId };
    }

    const targetChar = CharacterFactory.create(targetCharId);
    const targetDanceResult = targetChar.onDanceAccepted(targetId, inviterId, inviterCharId, gameState);
    if (targetDanceResult === ActionResult.IMMEDIATE_WIN) {
      alucardWin = { winnerId: targetId };
    }

    // Swap characters (per user spec — dance swaps identities)
    gameState.swapCharacters(inviterId, targetId);

    // Update player models
    const inviter = room.getPlayer(inviterId);
    const target = room.getPlayer(targetId);
    if (inviter) inviter.characterId = gameState.getPlayerCharacter(inviterId) ?? null;
    if (target) target.characterId = gameState.getPlayerCharacter(targetId) ?? null;

    // Send each dancer ONLY their partner's (pre-swap) character
    this.io.to(inviterId).emit('dance-result', {
      partnerId: targetId,
      partnerCharacterId: targetCharId, // What the target WAS before swap
      partnerCharacterName: CharacterFactory.create(targetCharId).name,
      newCharacterId: targetCharId, // Your new character after swap
      newCharacterName: CharacterFactory.create(targetCharId).name,
      newCharacterDescription: CharacterFactory.create(targetCharId).description,
    });

    this.io.to(targetId).emit('dance-result', {
      partnerId: inviterId,
      partnerCharacterId: inviterCharId,
      partnerCharacterName: CharacterFactory.create(inviterCharId).name,
      newCharacterId: inviterCharId,
      newCharacterName: CharacterFactory.create(inviterCharId).name,
      newCharacterDescription: CharacterFactory.create(inviterCharId).description,
    });

    // Broadcast that dance happened (no character info!)
    this.io.to(room.id).emit('dance-public', {
      inviterId,
      inviterNickname: inviter?.nickname,
      targetId,
      targetNickname: target?.nickname,
      accepted: true,
    });

    // Log the action
    gameState.addTurnAction({
      turnNumber: gameState.turnNumber,
      playerId: inviterId,
      playerNickname: inviter?.nickname || 'Unknown',
      action: 'dance',
      targetId,
      targetNickname: target?.nickname,
      danceAccepted: true,
      timestamp: Date.now(),
    });

    // Check Alucard instant win
    if (alucardWin) {
      this.handleGameOver(room, alucardWin.winnerId, 'Alucard đã khiêu vũ với Dracula!');
      return;
    }

    // Check BoogieMonster observer — any non-revealed BoogieMonster can trigger
    this.checkBoogieMonsterDanceTrigger(room, inviterId, targetId);

    // Clear pending and advance
    gameState.pendingAction = null;
    this.advanceTurn(room);
  }

  /**
   * Process a refused dance — inviter must now inquire someone else.
   */
  private processDanceRefused(room: Room, inviterId: string, targetId: string): void {
    const gameState = room.gameState;
    if (!gameState) return;

    const inviter = room.getPlayer(inviterId);
    const target = room.getPlayer(targetId);

    // Check BoogieMonster's onDanceRefused (can accuse immediately)
    const inviterCharId = gameState.getPlayerCharacter(inviterId);
    if (inviterCharId) {
      const inviterChar = CharacterFactory.create(inviterCharId);
      const refuseResult = inviterChar.onDanceRefused(gameState);
      if (refuseResult === ActionResult.IMMEDIATE_ACCUSE) {
        // BoogieMonster can accuse immediately
        this.io.to(inviterId).emit('boogie-monster-accuse-option', {
          message: 'Lời mời bị từ chối! Bạn có thể lật bài và buộc tội ngay lập tức.',
        });
      }
    }

    // Notify room
    this.io.to(room.id).emit('dance-public', {
      inviterId,
      inviterNickname: inviter?.nickname,
      targetId,
      targetNickname: target?.nickname,
      accepted: false,
    });

    // Force the active player into an inquiry on a DIFFERENT player
    gameState.phase = GamePhase.DANCE_REFUSED;
    gameState.danceRefusedTargetId = targetId;
    gameState.pendingAction = null;

    this.io.to(inviterId).emit('dance-refused', {
      message: 'Khiêu vũ bị từ chối. Bạn phải chuyển sang hỏi một người chơi khác.',
      targetId,
      gameState: gameState.toPublic(),
    });

    // Log
    gameState.addTurnAction({
      turnNumber: gameState.turnNumber,
      playerId: inviterId,
      playerNickname: inviter?.nickname || 'Unknown',
      action: 'dance',
      targetId,
      targetNickname: target?.nickname,
      danceAccepted: false,
      timestamp: Date.now(),
    });
  }

  // ── ACCUSE Action ───────────────────────────────────────

  /**
   * Process an accusation from the active player.
   */
  handleAccuseStart(
    socket: Socket,
    room: Room,
    accusations: Record<string, CharacterId>
  ): void {
    const gameState = room.gameState;
    if (!gameState) return;

    const accuserId = socket.id;
    const accuser = room.getPlayer(accuserId);

    // Validate
    if (!accuser) return;
    if (gameState.turnPlayerId !== accuserId && !gameState.draculaSecondChance) {
      socket.emit('game-error', { message: 'Chưa đến lượt của bạn.' });
      return;
    }
    if (!accuser.canAccuse) {
      socket.emit('game-error', { message: 'Bạn không thể buộc tội nữa.' });
      return;
    }

    // Check if player is forced to dance (e.g., Zombie)
    let accuserCharId = gameState.getPlayerCharacter(accuserId);
    if (accuserCharId) {
      const accuserChar = CharacterFactory.create(accuserCharId);
      if (accuserChar.mustDanceThisTurn(gameState)) {
        socket.emit('game-error', { message: 'Lượt này bạn bắt buộc phải Khiêu vũ!' });
        return;
      }
    }

    // Set phase
    gameState.phase = GamePhase.ACCUSE_PENDING;

    // Reveal the accuser's character to the room
    accuser.reveal();
    accuserCharId = gameState.getPlayerCharacter(accuserId);

    // Broadcast accuser's reveal
    this.io.to(room.id).emit('accuse-reveal', {
      accuserId,
      accuserNickname: accuser.nickname,
      accuserCharacterId: accuserCharId,
      accuserCharacterName: accuserCharId ? CharacterFactory.create(accuserCharId).name : 'Unknown',
      accusations,
      players: room.getPlayersArray().map(p => p.toPublic()),
      gameState: gameState.toPublic(),
    });

    // Check each accusation for correctness
    const results: Record<string, boolean> = {};
    let allCorrect = true;
    let allIncorrect = true;
    let alucardWinnerId: string | null = null;

    for (const [playerId, guessedCharId] of Object.entries(accusations)) {
      const actualCharId = gameState.getPlayerCharacter(playerId);
      if (!actualCharId) {
        results[playerId] = false;
        allCorrect = false;
        continue;
      }

      const isCorrect = actualCharId === guessedCharId;
      results[playerId] = isCorrect;

      if (!isCorrect) allCorrect = false;
      if (isCorrect) allIncorrect = false;

      // Check Ghost's ability — if accused incorrectly, get counter-accuse option
      const targetChar = CharacterFactory.create(actualCharId);
      if (!isCorrect) {
        const accuseResult = targetChar.onAccusedIncorrectly(guessedCharId, gameState);
        if (accuseResult === ActionResult.COUNTER_ACCUSE) {
          // Ghost gets option to reveal and counter-accuse
          this.io.to(playerId).emit('ghost-counter-accuse-option', {
            message: 'Bạn bị buộc tội sai! Bạn có thể lật bài và buộc tội ngược lại ngay.',
          });
        }
      }

      // Check Alucard's ability — if accused as Dracula, Alucard wins
      const accuseResult = targetChar.onAccusedAs(guessedCharId, actualCharId, gameState);
      if (accuseResult === ActionResult.IMMEDIATE_WIN) {
        alucardWinnerId = playerId;
      }
    }

    // Check Swamp Creature win condition (if accuser is Swamp Creature and only accused neighbors and all were correct)
    let swampCreatureWinnerId: string | null = null;
    if (accuserCharId === CharacterId.SWAMP_CREATURE && allCorrect) {
      const numAccused = Object.keys(accusations).length;
      // Swamp creature usually targets exactly 2 neighbors (or fewer in edge cases)
      // Since `allCorrect` is true, if they accused at least 1 neighbor, let's treat it as a win.
      // The frontend getAccuseTargets restricts who they can select anyway.
      if (numAccused > 0) {
        swampCreatureWinnerId = accuserId;
      }
    }

    // Check Alucard instant win first
    if (alucardWinnerId) {
      this.handleGameOver(room, alucardWinnerId, 'Alucard đã bị buộc tội là Dracula!');
      return;
    }

    if (swampCreatureWinnerId) {
      this.handleGameOver(room, swampCreatureWinnerId, 'Swamp Creature đã buộc tội đúng cả hai hàng xóm!');
      return;
    }

    // Process result
    if (allCorrect) {
      // ACCUSATION SUCCEEDS — accuser wins!
      this.handleGameOver(room, accuserId, `${accuser.nickname} đã đoán đúng tất cả người chơi!`);
    } else {
      // ACCUSATION FAILS
      accuser.onAccuseFailed();

      // Log
      gameState.addTurnAction({
        turnNumber: gameState.turnNumber,
        playerId: accuserId,
        playerNickname: accuser.nickname,
        action: 'accuse',
        accuseSuccess: false,
        timestamp: Date.now(),
      });

      // Broadcast failure with updated player data
      this.io.to(room.id).emit('accuse-result', {
        accuserId,
        accuserNickname: accuser.nickname,
        success: false,
        players: room.getPlayersArray().map(p => p.toPublic()),
        gameState: gameState.toPublic(),
      });

      // Check Dracula's second chance
      if (accuserCharId) {
        const accuserChar = CharacterFactory.create(accuserCharId);
        const failResult = accuserChar.onAccuseFail(gameState);
        if (failResult === ActionResult.RETRY_ACCUSE) {
          // Dracula gets another chance
          gameState.phase = GamePhase.ACTION_SELECT;
          socket.emit('dracula-second-chance', {
            message: 'Buộc tội thất bại, nhưng với tư cách Dracula, bạn được buộc tội lần nữa!',
          });
          return;
        }
      }

      // Check Van Helsing trigger (all-No accusation)
      if (allIncorrect) {
        this.checkVanHelsingTrigger(room, accuserId);
      }

      // Advance turn
      this.advanceTurn(room);
    }
  }

  // ── Van Helsing Special ─────────────────────────────────

  /**
   * Check if Van Helsing should be triggered (all-No accusation).
   */
  private checkVanHelsingTrigger(room: Room, accuserId: string): void {
    const gameState = room.gameState;
    if (!gameState) return;

    // Find if any unrevealed player is Van Helsing
    for (const [playerId, charId] of gameState.characterAssignments) {
      if (charId === CharacterId.VAN_HELSING) {
        const player = room.getPlayer(playerId);
        if (player && !player.isRevealed) {
          const vhChar = CharacterFactory.create(charId);
          const result = vhChar.onAnyAccuseResult(accuserId, false, true, gameState);
          if (result === ActionResult.IMMEDIATE_WIN) {
            // Van Helsing gets to accuse one player as Dracula
            gameState.phase = GamePhase.VAN_HELSING_TRIGGER;
            this.io.to(playerId).emit('van-helsing-trigger', {
              message: 'Buộc tội hoàn toàn thất bại! Bạn có thể lật bài và buộc tội một người là Dracula.',
            });
            this.io.to(room.id).emit('van-helsing-activated', {
              message: 'Van Helsing đã được kích hoạt!',
            });
          }
        }
      }
    }
  }

  /**
   * Handle Van Helsing's Dracula accusation.
   */
  handleVanHelsingAccuse(socket: Socket, room: Room, targetId: string): void {
    const gameState = room.gameState;
    if (!gameState) return;

    const vhId = socket.id;
    const vhPlayer = room.getPlayer(vhId);
    const target = room.getPlayer(targetId);

    if (!vhPlayer || !target) return;

    // Verify this player IS Van Helsing
    const vhCharId = gameState.getPlayerCharacter(vhId);
    if (vhCharId !== CharacterId.VAN_HELSING) {
      socket.emit('game-error', { message: 'Bạn không phải là Van Helsing.' });
      return;
    }

    // Reveal Van Helsing
    vhPlayer.reveal();

    // Check if target is Dracula
    const targetCharId = gameState.getPlayerCharacter(targetId);
    if (targetCharId === CharacterId.DRACULA) {
      this.handleGameOver(room, vhId, 'Van Helsing đã tìm ra Dracula!');
    } else {
      // Failed
      vhPlayer.onAccuseFailed();
      this.io.to(room.id).emit('van-helsing-result', {
        success: false,
        vhNickname: vhPlayer.nickname,
        targetNickname: target.nickname,
      });
      this.advanceTurn(room);
    }
  }

  // ── Doctor Jekyll Special ───────────────────────────────

  /**
   * Handle Doctor Jekyll's reveal-and-swap with Mystery Guest.
   */
  private handleDoctorJekyllSwap(room: Room, player: Player): void {
    const gameState = room.gameState;
    if (!gameState || !player.characterId) return;

    try {
      const { newCharacterId, updatedMysteryGuests } = DeckManager.swapWithMysteryGuest(
        player.characterId,
        gameState.mysteryGuests
      );

      // Update assignments
      gameState.mysteryGuests = updatedMysteryGuests;
      gameState.setPlayerCharacter(player.id, newCharacterId);
      player.characterId = newCharacterId;
      player.reveal(); // Jekyll must reveal

      // Notify the player of their new character (private)
      this.io.to(player.id).emit('character-swapped', {
        newCharacterId,
        newCharacterName: CharacterFactory.create(newCharacterId).name,
        newCharacterDescription: CharacterFactory.create(newCharacterId).description,
      });

      // Broadcast that Jekyll revealed
      this.io.to(room.id).emit('jekyll-revealed', {
        playerId: player.id,
        playerNickname: player.nickname,
        characterId: CharacterId.DOCTOR_JEKYLL,
        characterName: 'Doctor Jekyll',
      });
    } catch (err) {
      console.error('[GameManager] Jekyll swap error:', err);
    }
  }

  // ── BoogieMonster Observer ──────────────────────────────

  /**
   * Check if BoogieMonster should trigger after any dance.
   */
  private checkBoogieMonsterDanceTrigger(room: Room, dancer1Id: string, dancer2Id: string): void {
    const gameState = room.gameState;
    if (!gameState) return;

    for (const [playerId, charId] of gameState.characterAssignments) {
      if (charId === CharacterId.BOOGIE_MONSTER) {
        const player = room.getPlayer(playerId);
        if (player && !player.isRevealed) {
          const bmChar = CharacterFactory.create(charId);
          const result = bmChar.onAnyDance(dancer1Id, dancer2Id, gameState);
          if (result === ActionResult.IMMEDIATE_ACCUSE) {
            this.io.to(playerId).emit('boogie-monster-dance-trigger', {
              message: 'Có người vừa khiêu vũ! Bạn có thể lật bài và buộc tội ngay lập tức.',
            });
          }
        }
      }
    }
  }

  // ── Game Over ───────────────────────────────────────────

  /**
   * Handle game over — reveal all roles and announce winner.
   */
  private handleGameOver(room: Room, winnerId: string, reason: string): void {
    const gameState = room.gameState;
    if (!gameState) return;

    gameState.phase = GamePhase.GAME_OVER;
    room.status = RoomStatus.FINISHED;

    const winner = room.getPlayer(winnerId);

    // Reveal ALL roles to everyone
    const allRoles: Record<string, { characterId: CharacterId; characterName: string }> = {};
    for (const [playerId, charId] of gameState.characterAssignments) {
      allRoles[playerId] = {
        characterId: charId,
        characterName: CharacterFactory.create(charId).name,
      };
    }

    this.io.to(room.id).emit('game-over', {
      winnerId,
      winnerNickname: winner?.nickname || 'Unknown',
      reason,
      allRoles,
      mysteryGuests: gameState.mysteryGuests.map((id: CharacterId) => ({
        characterId: id,
        characterName: CharacterFactory.create(id).name,
      })),
    });

    console.log(`[GameManager] Game over in room ${room.id}. Winner: ${winner?.nickname}. Reason: ${reason}`);
  }

  // ── Helpers ──────────────────────────────────────────────

  /**
   * Get the game state for a room (public only).
   */
  getPublicGameState(room: Room): any {
    return room.gameState?.toPublic() || null;
  }
}
