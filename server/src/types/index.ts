// ============================================================
// Dracula's Feast: New Blood — Shared Type Definitions
// ============================================================

// ── Character Identifiers ──────────────────────────────────
export enum CharacterId {
  DRACULA = 'dracula',
  ALUCARD = 'alucard',
  TRICKSTER = 'trickster',
  VAN_HELSING = 'van_helsing',
  GHOST = 'ghost',
  BOOGIE_MONSTER = 'boogie_monster',
  DOCTOR_JEKYLL = 'doctor_jekyll',
  SWAMP_CREATURE = 'swamp_creature',
  ZOMBIE = 'zombie',
  WITCH = 'witch',
}

// ── Game Phase State Machine ───────────────────────────────
export enum GamePhase {
  WAITING = 'WAITING',
  TURN_START = 'TURN_START',
  ACTION_SELECT = 'ACTION_SELECT',
  INQUIRE_PENDING = 'INQUIRE_PENDING',
  INQUIRE_RESPONSE = 'INQUIRE_RESPONSE',
  DANCE_PENDING = 'DANCE_PENDING',
  DANCE_RESPONSE = 'DANCE_RESPONSE',
  DANCE_REFUSED = 'DANCE_REFUSED',
  ACCUSE_PENDING = 'ACCUSE_PENDING',
  ACCUSE_RESPONSE = 'ACCUSE_RESPONSE',
  ACCUSE_RESULT = 'ACCUSE_RESULT',
  VAN_HELSING_TRIGGER = 'VAN_HELSING_TRIGGER',
  GAME_OVER = 'GAME_OVER',
}

// ── Room Status ────────────────────────────────────────────
export enum RoomStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  FINISHED = 'finished',
}

// ── Action Results (returned by character ability hooks) ───
export enum ActionResult {
  CONTINUE = 'CONTINUE',           // Normal flow continues
  END_TURN = 'END_TURN',           // End current player's turn
  RETRY_ACCUSE = 'RETRY_ACCUSE',   // Dracula's second chance
  IMMEDIATE_WIN = 'IMMEDIATE_WIN', // Alucard/VanHelsing instant win
  IMMEDIATE_ACCUSE = 'IMMEDIATE_ACCUSE', // BoogieMonster accuses after dance
  SWAP_MYSTERY = 'SWAP_MYSTERY',         // Doctor Jekyll swaps with mystery guest
  COUNTER_ACCUSE = 'COUNTER_ACCUSE',     // Ghost counter-accuses when incorrectly accused
  ZOMBIE_REVEAL_AND_ACCUSE = 'ZOMBIE_REVEAL_AND_ACCUSE', // Zombie forces refuser to reveal and then accuses
}

// ── Player Data ────────────────────────────────────────────
export interface IPlayerData {
  id: string;
  nickname: string;
  roomId: string;
  characterId: CharacterId | null;
  isRevealed: boolean;
  canDance: boolean;
  canAccuse: boolean;
  isHost: boolean;
  seatIndex: number;
  isConnected: boolean;
}

// Public player data (safe to broadcast)
export interface IPublicPlayer {
  id: string;
  nickname: string;
  isRevealed: boolean;
  canDance: boolean;
  canAccuse: boolean;
  isHost: boolean;
  seatIndex: number;
  isConnected: boolean;
  revealedCharacterId?: CharacterId; // Only set after reveal
}

// ── Room Data ──────────────────────────────────────────────
export interface IRoomData {
  id: string;
  hostId: string;
  players: IPublicPlayer[];
  status: RoomStatus;
  maxPlayers: number;
  minPlayers: number;
}

// ── Game State (public portion) ────────────────────────────
export interface IGameStatePublic {
  phase: GamePhase;
  currentTurnIndex: number;
  turnPlayerId: string;
  turnNumber: number;
  seatOrder: string[];        // Player IDs in clockwise order
  revealedPlayers: string[];  // Player IDs who are revealed
  mysteryGuestCount: number;  // Number of mystery guest cards (1 or 2)
  revealedMysteryGuests: CharacterId[]; // Revealed mystery guest cards
  turnHistory: ITurnAction[];
  danceRefusedTargetId?: string; // Player ID who refused the dance (cannot be inquired)
}

// ── Turn Actions (public log) ──────────────────────────────
export interface ITurnAction {
  turnNumber: number;
  playerId: string;
  playerNickname: string;
  action: 'inquire' | 'dance' | 'accuse';
  targetId?: string;
  targetNickname?: string;
  characterGuess?: CharacterId;
  danceAccepted?: boolean;
  accuseSuccess?: boolean;
  timestamp: number;
}

// ── Pending Actions ────────────────────────────────────────
export interface IPendingInquiry {
  type: 'inquire';
  askerId: string;
  targetId: string;
  characterGuess: CharacterId;
}

export interface IPendingDance {
  type: 'dance';
  inviterId: string;
  targetId: string;
}

export interface IPendingAccuse {
  type: 'accuse';
  accuserId: string;
  accusations: Record<string, CharacterId>; // playerId -> guessed characterId
  responses: Record<string, boolean>;       // playerId -> correct?
  pendingResponses: string[];               // player IDs not yet responded
}

export type PendingAction = IPendingInquiry | IPendingDance | IPendingAccuse;

// ── Accuse Result ──────────────────────────────────────────
export interface IAccuseResult {
  accuserId: string;
  success: boolean;
  allNos: boolean; // For Van Helsing trigger
}

// ── Socket Event Payloads ──────────────────────────────────

// Client → Server
export interface CreateRoomPayload {
  nickname: string;
}

export interface JoinRoomPayload {
  roomId: string;
  nickname: string;
}

export interface StartGamePayload {
  roomId: string;
}

export interface InquireRequestPayload {
  targetId: string;
  characterGuess: CharacterId;
}

export interface InquireResponsePayload {
  answer: boolean;
}

export interface DanceOfferPayload {
  targetId: string;
}

export interface DanceResponsePayload {
  accepted: boolean;
}

export interface AccuseStartPayload {
  accusations: Record<string, CharacterId>;
}

export interface AccuseVotePayload {
  correct: boolean;
}

export interface ChatMessagePayload {
  message: string;
}

export interface VanHelsingAccusePayload {
  targetId: string;
}

// ── Chat Message ───────────────────────────────────────────
export interface IChatMessage {
  senderId: string;
  nickname: string;
  message: string;
  timestamp: number;
  isSystem: boolean;
}
