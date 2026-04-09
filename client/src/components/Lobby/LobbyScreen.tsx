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
      addToast('Tên dài quá không ai rảnh đọc cả, ngắn lại dùm.', 'error');
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
      addToast('Chưa nhập mã phòng sao vô fen?', 'error');
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
        <h1 className="lobby-title">🧛 Dạ Tiệc Dracula</h1>
        <p className="lobby-subtitle">Trò Chơi Hủy Diệt Tình Bạn Thân Thiết</p>

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
                  Tuổi Gi mà tên Rì
                </label>
                <input
                  id="nickname-input"
                  className="input"
                  type="text"
                  placeholder="Nhập nick của sếp vào đây..."
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
                    addToast('Gõ tên vào đã nào sếp ơi!', 'error');
                    return;
                  }
                  setMode('create');
                }}
                style={{ width: '100%' }}
              >
                🏰 Mở Rạp (Tạo Phòng)
              </button>

              <div className="lobby-divider">hoặc</div>

              <button
                id="join-room-btn"
                className="btn btn--secondary btn--lg"
                onClick={() => {
                  if (!nickname.trim()) {
                    addToast('Ông chưa kêu tên sao biết ai mà cho dzô?!', 'error');
                    return;
                  }
                  setMode('join');
                }}
                style={{ width: '100%' }}
              >
                🚪 Tham Gia Sới (Vào Phòng)
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
              <h3 style={{ textAlign: 'center' }}>Vào Kèo</h3>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                Xưng danh: <strong style={{ color: 'var(--text-gold)' }}>{nickname}</strong>
              </p>
              <input
                id="room-id-input"
                className="input"
                type="text"
                placeholder="Khè Mã Phòng Vô (Ví dụ: ABC123)"
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
                🚪 Bay Vào Quẩy
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
