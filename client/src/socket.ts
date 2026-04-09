// ============================================================
// Socket.io Client — Singleton connection to the game server
// ============================================================

import { io, Socket } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// Create a single socket instance for the entire app
export const socket: Socket = io(SERVER_URL, {
  autoConnect: false, // Connect manually after user enters nickname
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Debug logging in development
if (import.meta.env.DEV) {
  socket.onAny((event, ...args) => {
    console.log(`[Socket] ← ${event}`, args);
  });

  socket.onAnyOutgoing((event, ...args) => {
    console.log(`[Socket] → ${event}`, args);
  });
}

export default socket;
