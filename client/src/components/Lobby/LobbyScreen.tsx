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
      addToast('Tên của bạn quá dài, vui lòng nhập dưới 20 ký tự.', 'error');
      return;
    }
    setNickname(nickname.trim());

    if (!socket.connected) {
      socket.connect();
    }
  };

  const handleCreate = () => {
    sessionStorage.removeItem('dracula_roomId');
    sessionStorage.removeItem('dracula_nickname');
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
      addToast('Vui lòng nhập mã phòng để tham gia.', 'error');
      return;
    }
    sessionStorage.removeItem('dracula_roomId');
    sessionStorage.removeItem('dracula_nickname');
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
        <p className="lobby-subtitle">Trò Chơi Ẩn Vai Suy Luận</p>

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
                  marginBottom: '0'
                }}>
                  Tên người chơi
                </label>
                <input
                  id="nickname-input"
                  className="input"
                  type="text"
                  placeholder="Nhập tên của bạn (tối đa 20 ký tự)..."
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
                    addToast('Vui lòng nhập tên của bạn trước khi tạo phòng!', 'error');
                    return;
                  }
                  setMode('create');
                }}
                style={{ width: '100%' }}
              >
                🏰 Tạo phòng mới
              </button>

              <div className="lobby-divider">hoặc</div>

              <button
                id="join-room-btn"
                className="btn btn--secondary btn--lg"
                onClick={() => {
                  if (!nickname.trim()) {
                    addToast('Vui lòng nhập tên của bạn trước khi tham gia!', 'error');
                    return;
                  }
                  setMode('join');
                }}
                style={{ width: '100%' }}
              >
                🕵️ Tham gia bằng mã phòng
              </button>
            </div>
          )}

          {mode === 'create' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <h3 style={{ textAlign: 'center' }}>Lập Kèo Mới</h3>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                Đang dùng acc: <strong style={{ color: 'var(--text-gold)' }}>{nickname}</strong>
              </p>
              <button
                id="confirm-create-btn"
                className="btn btn--primary btn--lg"
                onClick={handleCreate}
                style={{ width: '100%' }}
              >
                🧛 Triển Bàn Mới Ngay
              </button>
              <button
                className="btn btn--ghost"
                onClick={() => setMode('menu')}
                style={{ width: '100%' }}
              >
                ← Quay Xe
              </button>
            </div>
          )}

          {mode === 'join' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <h3 style={{ textAlign: 'center' }}>Tham Gian Phòng Chơi</h3>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                Tên của bạn: <strong style={{ color: 'var(--text-gold)' }}>{nickname}</strong>
              </p>
              <input
                id="room-id-input"
                className="input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Ví dụ: 123456"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.replace(/\D/g, ''))}
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
                🚪 Tham gia ngay
              </button>
              <button
                className="btn btn--ghost"
                onClick={() => setMode('menu')}
                style={{ width: '100%' }}
              >
                ← De Lại
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
          4-8 Mạng Cùng Chơi • Trò Trách Nhiệm Xã Hội • Lột Mặt Nạ Hội Báo Thủ
        </p>
      </div>
    </div>
  );
}
