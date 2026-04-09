// ============================================================
// Chat Store — Zustand state for real-time chat
// ============================================================

import { create } from 'zustand';
import socket from '../socket';

interface ChatMessage {
  senderId: string;
  nickname: string;
  message: string;
  timestamp: number;
  isSystem: boolean;
}

interface ChatStore {
  messages: ChatMessage[];
  unreadCount: number;
  isOpen: boolean;
  
  toggleChat: () => void;
  markRead: () => void;
  sendMessage: (message: string) => void;
  initChatListeners: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  unreadCount: 0,
  isOpen: false,

  toggleChat: () => {
    const willOpen = !get().isOpen;
    set({ isOpen: willOpen, unreadCount: willOpen ? 0 : get().unreadCount });
  },

  markRead: () => set({ unreadCount: 0 }),

  sendMessage: (message: string) => {
    if (!message.trim()) return;
    socket.emit('chat-message', { message: message.trim() });
  },

  initChatListeners: () => {
    socket.on('chat-broadcast', (data: ChatMessage) => {
      set(state => ({
        messages: [...state.messages, data],
        unreadCount: state.isOpen ? 0 : state.unreadCount + 1,
      }));
    });
  },
}));
