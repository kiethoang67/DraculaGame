// ============================================================
// ChatBox — Real-time chat component
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../stores/useChatStore';
import socket from '../../socket';

export function ChatBox() {
  const [input, setInput] = useState('');
  const messagesEnd = useRef<HTMLDivElement>(null);
  const { messages, isOpen, unreadCount, toggleChat, sendMessage } = useChatStore();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  if (!isOpen) {
    return (
      <button
        id="chat-toggle-btn"
        className="btn btn--secondary"
        onClick={toggleChat}
        style={{ position: 'relative', marginTop: 8, marginRight: 8 }}
      >
        💬 Chat
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -4,
            right: -4,
            background: 'var(--color-blood-light)',
            color: '#fff',
            borderRadius: '50%',
            width: 20,
            height: 20,
            fontSize: '0.7rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="chat-container" style={{ height: 350 }}>
      <div style={{
        padding: 'var(--space-sm) var(--space-md)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h4 style={{ fontSize: '0.9rem' }}>💬 Chat</h4>
        <button
          className="btn btn--ghost btn--sm"
          onClick={toggleChat}
        >
          ✕
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <p style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            fontStyle: 'italic',
            marginTop: 'var(--space-lg)',
          }}>
            No messages yet...
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-message ${
              msg.isSystem ? 'chat-message--system' :
              msg.senderId === socket.id ? 'chat-message--self' : ''
            }`}
          >
            {msg.isSystem ? (
              <span className="chat-message__text">{msg.message}</span>
            ) : (
              <>
                <span className="chat-message__sender">{msg.nickname}: </span>
                <span className="chat-message__text">{msg.message}</span>
              </>
            )}
          </div>
        ))}
        <div ref={messagesEnd} />
      </div>

      <div className="chat-input-area">
        <input
          id="chat-input"
          className="input"
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="btn btn--primary btn--sm" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}
