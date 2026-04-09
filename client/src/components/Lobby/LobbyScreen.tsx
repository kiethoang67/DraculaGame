// ============================================================
// LobbyScreen — Create or Join a game room
// ============================================================

import { useState } from 'react';
import socket from '../../socket';
import { useGameStore } from '../../stores/useGameStore';

export function LobbyScreen() {
  const [nickname, setNicknameLocal] = useState('');
  const [roomId, setRoomId] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const { setNickname, addToast } = useGameStore();

  const handleConnect = () => {
    if (!nickname.trim()) {
      addToast('Please enter a nickname', 'error');
      return;
    }
    if (nickname.trim().length > 20) {
      addToast('Nickname must be 20 characters or less', 'error');
      return;
    }
    setNickname(nickname.trim());

    if (!socket.connected) {
      socket.connect();
    }
  };

  const handleCreate = () => {
    handleConnect();
    // Wait for connection then create
    const tryCreate = () => {
      if (socket.connected) {
        socket.emit('create-room', { nickname: nickname.trim() });
      } else {
        setTimeout(tryCreate, 100);
      }
    };
    tryCreate();
  };

  const handleJoin = () => {
    if (!roomId.trim()) {
      addToast('Please enter a Room ID', 'error');
      return;
    }
    handleConnect();
    const tryJoin = () => {
      if (socket.connected) {
        socket.emit('join-room', { roomId: roomId.trim().toUpperCase(), nickname: nickname.trim() });
      } else {
        setTimeout(tryJoin, 100);
      }
    };
    tryJoin();
  };

  return (
    <div className="page-center">
      <div className="lobby-container">
        <h1 className="lobby-title">🧛 Dracula's Feast</h1>
        <p className="lobby-subtitle">New Blood — A Social Deduction Game</p>

        <div className="glass-card lobby-card">
          {mode === 'menu' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 'var(--space-xs)'
                }}>
                  Your Name
                </label>
                <input
                  id="nickname-input"
                  className="input"
                  type="text"
                  placeholder="Enter your nickname..."
                  value={nickname}
                  onChange={(e) => setNicknameLocal(e.target.value)}
                  maxLength={20}
                  onKeyDown={(e) => e.key === 'Enter' && setMode('create')}
                />
              </div>

              <button
                id="create-room-btn"
                className="btn btn--primary btn--lg"
                onClick={() => {
                  if (!nickname.trim()) {
                    addToast('Enter a nickname first!', 'error');
                    return;
                  }
                  setMode('create');
                }}
                style={{ width: '100%' }}
              >
                🏰 Create New Room
              </button>

              <div className="lobby-divider">or</div>

              <button
                id="join-room-btn"
                className="btn btn--secondary btn--lg"
                onClick={() => {
                  if (!nickname.trim()) {
                    addToast('Enter a nickname first!', 'error');
                    return;
                  }
                  setMode('join');
                }}
                style={{ width: '100%' }}
              >
                🚪 Join Existing Room
              </button>
            </div>
          )}

          {mode === 'create' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <h3 style={{ textAlign: 'center' }}>Create a Room</h3>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                Playing as <strong style={{ color: 'var(--text-gold)' }}>{nickname}</strong>
              </p>
              <button
                id="confirm-create-btn"
                className="btn btn--primary btn--lg"
                onClick={handleCreate}
                style={{ width: '100%' }}
              >
                🧛 Create & Enter Room
              </button>
              <button
                className="btn btn--ghost"
                onClick={() => setMode('menu')}
                style={{ width: '100%' }}
              >
                ← Back
              </button>
            </div>
          )}

          {mode === 'join' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <h3 style={{ textAlign: 'center' }}>Join a Room</h3>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                Playing as <strong style={{ color: 'var(--text-gold)' }}>{nickname}</strong>
              </p>
              <input
                id="room-id-input"
                className="input"
                type="text"
                placeholder="Enter Room ID (e.g. ABC123)"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                maxLength={6}
                style={{ textAlign: 'center', fontSize: '1.3rem', letterSpacing: '0.2em', fontFamily: 'var(--font-display)' }}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
              <button
                id="confirm-join-btn"
                className="btn btn--primary btn--lg"
                onClick={handleJoin}
                style={{ width: '100%' }}
              >
                🚪 Join Room
              </button>
              <button
                className="btn btn--ghost"
                onClick={() => setMode('menu')}
                style={{ width: '100%' }}
              >
                ← Back
              </button>
            </div>
          )}
        </div>

        <p style={{
          textAlign: 'center',
          marginTop: 'var(--space-xl)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}>
          4-8 players • Social deduction • Unmask the monsters
        </p>
      </div>
    </div>
  );
}
