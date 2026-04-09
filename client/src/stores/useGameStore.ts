// ============================================================
// Game Store — Zustand state management for the game
// ============================================================

import { create } from 'zustand';
import socket from '../socket';

// ── Types ─────────────────────────────────────────────────
interface PublicPlayer {
  id: string;
  nickname: string;
  isRevealed: boolean;
  canDance: boolean;
  canAccuse: boolean;
  isHost: boolean;
  seatIndex: number;
  isConnected: boolean;
  revealedCharacterId?: string;
}

interface RoomData {
  id: string;
  hostId: string;
  players: PublicPlayer[];
  status: string;
  maxPlayers: number;
  minPlayers: number;
}

interface TurnAction {
  turnNumber: number;
  playerId: string;
  playerNickname: string;
  action: string;
  targetId?: string;
  targetNickname?: string;
  characterGuess?: string;
  danceAccepted?: boolean;
  accuseSuccess?: boolean;
  timestamp: number;
}

interface GameStatePublic {
  phase: string;
  currentTurnIndex: number;
  turnPlayerId: string;
  turnNumber: number;
  seatOrder: string[];
  revealedPlayers: string[];
  mysteryGuestCount: number;
  turnHistory: TurnAction[];
}

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'error' | 'success';
}

interface GameOverData {
  winnerId: string;
  winnerNickname: string;
  reason: string;
  allRoles: Record<string, { characterId: string; characterName: string }>;
  mysteryGuests?: Array<{ characterId: string; characterName: string }>;
}

// ── Store ─────────────────────────────────────────────────
interface GameStore {
  // Connection
  isConnected: boolean;
  playerId: string | null;
  nickname: string;

  // Room
  room: RoomData | null;
  
  // Game
  gameState: GameStatePublic | null;
  myCharacterId: string | null;
  myCharacterName: string | null;
  myCharacterDescription: string | null;
  isMyTurn: boolean;
  
  // UI
  screen: 'lobby' | 'room' | 'game';
  toasts: Toast[];
  pendingDance: { fromId: string; fromNickname: string } | null;
  pendingInquiry: { fromId: string; fromNickname: string; characterGuess: string; suggestedAnswer: boolean } | null;
  inquiryWaiting: { targetId: string; targetNickname: string; characterGuess: string } | null;
  inquiryResult: { targetId: string; targetNickname: string; characterGuess: string; answer: boolean } | null;
  danceResult: { partnerId: string; partnerCharacterName: string; newCharacterName: string; newCharacterDescription: string; newCharacterId: string} | null;
  gameOver: GameOverData | null;
  
  // Actions
  setNickname: (n: string) => void;
  addToast: (message: string, type?: 'info' | 'error' | 'success') => void;
  removeToast: (id: string) => void;
  clearInquiryResult: () => void;
  clearInquiryWaiting: () => void;
  clearDanceResult: () => void;
  initSocketListeners: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  isConnected: false,
  playerId: null,
  nickname: '',
  room: null,
  gameState: null,
  myCharacterId: null,
  myCharacterName: null,
  myCharacterDescription: null,
  isMyTurn: false,
  screen: 'lobby',
  toasts: [],
  pendingDance: null,
  pendingInquiry: null,
  inquiryWaiting: null,
  inquiryResult: null,
  danceResult: null,
  gameOver: null,

  setNickname: (n) => set({ nickname: n }),

  addToast: (message, type = 'info') => {
    const id = Date.now().toString();
    set(state => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 4000);
  },

  removeToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },

  clearInquiryResult: () => set({ inquiryResult: null }),
  clearInquiryWaiting: () => set({ inquiryWaiting: null }),
  clearDanceResult: () => set({ danceResult: null }),

  resetGame: () => set({
    room: null,
    gameState: null,
    myCharacterId: null,
    myCharacterName: null,
    myCharacterDescription: null,
    isMyTurn: false,
    screen: 'lobby',
    pendingDance: null,
    pendingInquiry: null,
    inquiryWaiting: null,
    inquiryResult: null,
    danceResult: null,
    gameOver: null,
  }),

  initSocketListeners: () => {
    // Connection events
    socket.on('connect', () => {
      set({ isConnected: true, playerId: socket.id || null });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    // Room events
    socket.on('room-created', (data: { room: RoomData; player: PublicPlayer }) => {
      set({ room: data.room, screen: 'room' });
      get().addToast(`Room ${data.room.id} created!`, 'success');
    });

    socket.on('room-joined', (data: { room: RoomData; player: PublicPlayer }) => {
      set({ room: data.room, screen: 'room' });
      get().addToast(`Joined room ${data.room.id}!`, 'success');
    });

    socket.on('player-joined', (data: { player: PublicPlayer; room: RoomData }) => {
      set({ room: data.room });
      get().addToast(`${data.player.nickname} joined the room`);
    });

    socket.on('room-updated', (data: { room: RoomData }) => {
      set({ room: data.room });
    });

    socket.on('room-left', () => {
      get().resetGame();
    });

    socket.on('room-error', (data: { message: string }) => {
      get().addToast(data.message, 'error');
    });

    socket.on('game-error', (data: { message: string }) => {
      get().addToast(data.message, 'error');
    });

    socket.on('player-disconnected', (data: { playerId: string; players: PublicPlayer[] }) => {
      const room = get().room;
      if (room) {
        set({ room: { ...room, players: data.players } });
      }
    });

    // Game events
    socket.on('game-started', (data: {
      characterId: string;
      characterInfo: string;
      characterName: string;
      players: PublicPlayer[];
      seatOrder: string[];
      gameState: GameStatePublic;
    }) => {
      const room = get().room;
      set({
        myCharacterId: data.characterId,
        myCharacterName: data.characterName,
        myCharacterDescription: data.characterInfo,
        gameState: data.gameState,
        screen: 'game',
        room: room ? { ...room, players: data.players, status: 'playing' } : null,
        isMyTurn: data.gameState.turnPlayerId === socket.id,
      });
    });

    socket.on('turn-start', (data: {
      turnPlayerId: string;
      turnNumber: number;
      phase: string;
      gameState: GameStatePublic;
    }) => {
      set({
        gameState: data.gameState,
        isMyTurn: data.turnPlayerId === socket.id,
        pendingDance: null,
      });
    });

    // Inquiry events — Two-Phase Flow

    // Phase 1a: Target receives the inquiry question + suggested answer
    socket.on('inquire-incoming', (data: {
      fromId: string;
      fromNickname: string;
      characterGuess: string;
      suggestedAnswer: boolean;
      characterName: string;
    }) => {
      set({ pendingInquiry: data });
    });

    // Phase 1b: Asker is notified they're waiting for target's response
    socket.on('inquire-waiting', (data: {
      targetId: string;
      targetNickname: string;
      characterGuess: string;
    }) => {
      set({ inquiryWaiting: data });
    });

    // Phase 2: Asker receives the target's Whisper card answer
    socket.on('inquire-result', (data: {
      targetId: string;
      targetNickname: string;
      characterGuess: string;
      answer: boolean;
    }) => {
      set({ inquiryResult: data, inquiryWaiting: null });
    });

    // Target gets confirmation their response was sent
    socket.on('inquire-response-sent', () => {
      set({ pendingInquiry: null });
    });

    socket.on('inquire-public', () => {
      // Public log — handled by gameState turnHistory update
    });

    // Dance events
    socket.on('dance-incoming', (data: { fromId: string; fromNickname: string }) => {
      set({ pendingDance: data });
    });

    socket.on('dance-result', (data: {
      partnerId: string;
      partnerCharacterId: string;
      partnerCharacterName: string;
      newCharacterId: string;
      newCharacterName: string;
      newCharacterDescription: string;
    }) => {
      set({
        danceResult: {
          partnerId: data.partnerId,
          partnerCharacterName: data.partnerCharacterName,
          newCharacterName: data.newCharacterName,
          newCharacterDescription: data.newCharacterDescription,
          newCharacterId: data.newCharacterId,
        },
        myCharacterId: data.newCharacterId,
        myCharacterName: data.newCharacterName,
        myCharacterDescription: data.newCharacterDescription,
        pendingDance: null,
      });
    });

    socket.on('dance-refused', () => {
      get().addToast('Dance was refused. You must inquire a different player.', 'info');
      set({ pendingDance: null });
    });

    socket.on('dance-public', (data: {
      inviterNickname: string;
      targetNickname: string;
      accepted: boolean;
    }) => {
      const msg = data.accepted
        ? `${data.inviterNickname} and ${data.targetNickname} danced together!`
        : `${data.targetNickname} refused to dance with ${data.inviterNickname}`;
      get().addToast(msg);
    });

    // Accuse events
    socket.on('accuse-reveal', (data: {
      accuserNickname: string;
      accuserCharacterName: string;
    }) => {
      get().addToast(
        `${data.accuserNickname} reveals as ${data.accuserCharacterName} and accuses!`,
        'info'
      );
    });

    socket.on('accuse-result', (data: {
      accuserNickname: string;
      success: boolean;
    }) => {
      if (!data.success) {
        get().addToast(`${data.accuserNickname}'s accusation failed!`, 'error');
      }
    });

    // Special character events
    socket.on('dracula-second-chance', (data: { message: string }) => {
      get().addToast(data.message, 'info');
      set({ isMyTurn: true });
    });

    socket.on('van-helsing-trigger', (data: { message: string }) => {
      get().addToast(data.message, 'info');
    });

    socket.on('character-swapped', (data: {
      newCharacterId: string;
      newCharacterName: string;
      newCharacterDescription: string;
    }) => {
      set({
        myCharacterId: data.newCharacterId,
        myCharacterName: data.newCharacterName,
        myCharacterDescription: data.newCharacterDescription,
      });
      get().addToast(`Your character changed to ${data.newCharacterName}!`, 'info');
    });

    // Game over
    socket.on('game-over', (data: GameOverData) => {
      set({ gameOver: data });
    });
  },
}));
