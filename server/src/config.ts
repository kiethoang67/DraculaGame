// ============================================================
// Dracula's Feast: New Blood — Server Configuration
// ============================================================

export const CONFIG = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Game rules
  MIN_PLAYERS: 4,
  MAX_PLAYERS: 8,
  ROOM_ID_LENGTH: 6,

  // Timeouts (ms)
  RESPONSE_TIMEOUT: 60000,      // 60s to respond to inquiry/dance/accuse
  DISCONNECT_GRACE_PERIOD: 30000, // 30s before removing disconnected player

  // Room limits
  MAX_ROOMS: 100,
} as const;
