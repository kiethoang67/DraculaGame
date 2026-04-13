// ============================================================
// RedisStore — Persist room state to Upstash Redis
// ============================================================

import Redis from 'ioredis';
import { Room } from '../models/Room';
import { Player } from '../models/Player';
import { GameState } from '../models/GameState';
import { CharacterId, RoomStatus } from '../types';

let redis: Redis | null = null;

/**
 * Initialize Redis connection. Returns true if connected.
 */
export function initRedis(redisUrl?: string): boolean {
  if (!redisUrl) {
    console.log('[RedisStore] No REDIS_URL configured. Persistence disabled.');
    return false;
  }
  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      tls: redisUrl.startsWith('rediss://') ? {} : undefined,
    });
    redis.connect().then(() => {
      console.log('[RedisStore] Connected to Redis.');
    }).catch((err) => {
      console.error('[RedisStore] Failed to connect:', err.message);
      redis = null;
    });
    return true;
  } catch (err: any) {
    console.error('[RedisStore] Init error:', err.message);
    return false;
  }
}

// ── Serialization Helpers ─────────────────────────────────

interface SerializedPlayer {
  id: string;
  nickname: string;
  roomId: string;
  characterId: string | null;
  isRevealed: boolean;
  canDance: boolean;
  canAccuse: boolean;
  isHost: boolean;
  seatIndex: number;
  isConnected: boolean;
}

interface SerializedGameState {
  phase: string;
  currentTurnIndex: number;
  turnPlayerId: string;
  turnNumber: number;
  seatOrder: string[];
  characterAssignments: Record<string, string>;
  mysteryGuests: string[];
  revealedPlayers: string[];
  turnHistory: any[];
  pendingAction: any | null;
  draculaSecondChance: boolean;
  failedAccusersThisTurn: string[];
}

interface SerializedRoom {
  id: string;
  hostId: string;
  players: SerializedPlayer[];
  gameState: SerializedGameState | null;
  status: string;
  maxPlayers: number;
  minPlayers: number;
  createdAt: number;
}

function serializePlayer(p: Player): SerializedPlayer {
  return {
    id: p.id,
    nickname: p.nickname,
    roomId: p.roomId,
    characterId: p.characterId,
    isRevealed: p.isRevealed,
    canDance: p.canDance,
    canAccuse: p.canAccuse,
    isHost: p.isHost,
    seatIndex: p.seatIndex,
    isConnected: p.isConnected,
  };
}

function deserializePlayer(data: SerializedPlayer): Player {
  const p = new Player(data.id, data.nickname, data.roomId, data.isHost);
  p.characterId = data.characterId as CharacterId | null;
  p.isRevealed = data.isRevealed;
  p.canDance = data.canDance;
  p.canAccuse = data.canAccuse;
  p.seatIndex = data.seatIndex;
  p.isConnected = data.isConnected;
  return p;
}

function serializeGameState(gs: GameState): SerializedGameState {
  const charAssignments: Record<string, string> = {};
  for (const [k, v] of gs.characterAssignments.entries()) {
    charAssignments[k] = v;
  }
  return {
    phase: gs.phase,
    currentTurnIndex: gs.currentTurnIndex,
    turnPlayerId: gs.turnPlayerId,
    turnNumber: gs.turnNumber,
    seatOrder: gs.seatOrder,
    characterAssignments: charAssignments,
    mysteryGuests: gs.mysteryGuests,
    revealedPlayers: Array.from(gs.revealedPlayers),
    turnHistory: gs.turnHistory,
    pendingAction: gs.pendingAction,
    draculaSecondChance: gs.draculaSecondChance,
    failedAccusersThisTurn: Array.from(gs.failedAccusersThisTurn),
  };
}

function deserializeGameState(data: SerializedGameState): GameState {
  const gs = new GameState(data.seatOrder);
  gs.phase = data.phase as any;
  gs.currentTurnIndex = data.currentTurnIndex;
  gs.turnPlayerId = data.turnPlayerId;
  gs.turnNumber = data.turnNumber;
  gs.mysteryGuests = data.mysteryGuests as CharacterId[];
  gs.revealedPlayers = new Set(data.revealedPlayers);
  gs.turnHistory = data.turnHistory;
  gs.pendingAction = data.pendingAction;
  gs.draculaSecondChance = data.draculaSecondChance;
  gs.failedAccusersThisTurn = new Set(data.failedAccusersThisTurn);
  gs.characterAssignments = new Map();
  for (const [k, v] of Object.entries(data.characterAssignments)) {
    gs.characterAssignments.set(k, v as CharacterId);
  }
  return gs;
}

function serializeRoom(room: Room): SerializedRoom {
  return {
    id: room.id,
    hostId: room.hostId,
    players: room.getPlayersArray().map(serializePlayer),
    gameState: room.gameState ? serializeGameState(room.gameState) : null,
    status: room.status,
    maxPlayers: room.maxPlayers,
    minPlayers: room.minPlayers,
    createdAt: room.createdAt,
  };
}

function deserializeRoom(data: SerializedRoom): Room {
  const room = new Room(data.id, data.hostId);
  room.status = data.status as RoomStatus;
  room.maxPlayers = data.maxPlayers;
  room.minPlayers = data.minPlayers;
  room.createdAt = data.createdAt;
  for (const pd of data.players) {
    const player = deserializePlayer(pd);
    room.players.set(player.id, player);
  }
  if (data.gameState) {
    room.gameState = deserializeGameState(data.gameState);
  }
  return room;
}

// ── Public API ────────────────────────────────────────────

const ROOM_KEY_PREFIX = 'dracula:room:';
const ROOM_TTL = 86400; // 24 hours

/**
 * Save a room to Redis. Non-blocking (fire-and-forget with error logging).
 */
export function saveRoom(room: Room): void {
  if (!redis) return;
  const key = ROOM_KEY_PREFIX + room.id;
  const json = JSON.stringify(serializeRoom(room));
  redis.setex(key, ROOM_TTL, json).catch(err => {
    console.error(`[RedisStore] Failed to save room ${room.id}:`, err.message);
  });
}

/**
 * Delete a room from Redis.
 */
export function deleteRoom(roomId: string): void {
  if (!redis) return;
  redis.del(ROOM_KEY_PREFIX + roomId).catch(err => {
    console.error(`[RedisStore] Failed to delete room ${roomId}:`, err.message);
  });
}

/**
 * Load all rooms from Redis. Used on server startup.
 * Marks all players as disconnected since socket connections are lost.
 */
export async function loadAllRooms(): Promise<{ rooms: Map<string, Room>; playerRoomMap: Map<string, string> }> {
  const rooms = new Map<string, Room>();
  const playerRoomMap = new Map<string, string>();

  if (!redis) return { rooms, playerRoomMap };

  try {
    const keys = await redis.keys(ROOM_KEY_PREFIX + '*');
    console.log(`[RedisStore] Found ${keys.length} rooms in Redis.`);

    for (const key of keys) {
      const json = await redis.get(key);
      if (!json) continue;

      try {
        const data: SerializedRoom = JSON.parse(json);
        const room = deserializeRoom(data);

        // Mark all players as disconnected (sockets are gone after restart)
        for (const [playerId, player] of room.players.entries()) {
          player.isConnected = false;
          playerRoomMap.set(playerId, room.id);
        }

        rooms.set(room.id, room);
        console.log(`[RedisStore] Restored room ${room.id} (${room.players.size} players, status: ${room.status})`);
      } catch (parseErr: any) {
        console.error(`[RedisStore] Failed to parse room from key ${key}:`, parseErr.message);
        // Clean up corrupted entry
        redis.del(key).catch(() => {});
      }
    }
  } catch (err: any) {
    console.error('[RedisStore] Failed to load rooms:', err.message);
  }

  return { rooms, playerRoomMap };
}
