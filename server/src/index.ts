// ============================================================
// Dracula's Feast: New Blood — Server Entry Point
// ============================================================

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { CONFIG } from './config';
import { GameManager } from './managers/GameManager';
import { registerConnectionHandler } from './handlers/connectionHandler';
import { registerRoomHandler } from './handlers/roomHandler';
import { registerChatHandler } from './handlers/chatHandler';
import { registerGameHandler } from './handlers/gameHandler';

// ── Express Setup ─────────────────────────────────────────
const app = express();
app.use(cors({ origin: CONFIG.CORS_ORIGIN }));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// ── HTTP Server ───────────────────────────────────────────
const httpServer = createServer(app);

// ── Socket.io Setup ───────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: CONFIG.CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
  // Performance tuning
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ── Game Manager ──────────────────────────────────────────
const gameManager = new GameManager(io);

// ── Socket Event Registration ─────────────────────────────
io.on('connection', (socket) => {
  registerConnectionHandler(io, socket);
  registerRoomHandler(io, socket, gameManager);
  registerChatHandler(io, socket);
  registerGameHandler(io, socket, gameManager);
});

// ── Start Server ──────────────────────────────────────────
httpServer.listen(CONFIG.PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   🧛 Dracula's Feast: New Blood Server 🧛   ║
  ║                                              ║
  ║   Port: ${CONFIG.PORT}                            ║
  ║   CORS: ${CONFIG.CORS_ORIGIN}          ║
  ╚══════════════════════════════════════════════╝
  `);
});
