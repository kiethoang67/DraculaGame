// ============================================================
// RoomLobby — Waiting room before game starts
// ============================================================

import { useGameStore } from '../../stores/useGameStore';
import socket from '../../socket';

export function RoomLobby() {
  const { room, addToast } = useGameStore();

  if (!room) return null;

  const isHost = room.hostId === socket.id;
  const playerCount = room.players.length;
  const canStart = playerCount >= room.minPlayers && playerCount <= room.maxPlayers;

  const handleStart = () => {
    socket.emit('start-game', { roomId: room.id });
  };

  const handleLeave = () => {
    socket.emit('leave-room');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.id).then(() => {
      addToast('Đã sao chép mã phòng vào khay nhớ tạm!', 'success');
    });
  };

  return (
    <div className="page-center">
      <div className="room-lobby">
        <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-sm)' }}>
          🏰 Sảnh Chờ Bắt Đầu
        </h2>
        <p style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-lg)',
          fontFamily: 'var(--font-body)',
        }}>
          Chia sẻ mã phòng này cho các người chơi khác để tham gia
        </p>

        <div className="room-code" onClick={handleCopyCode} title="Click to copy">
          {room.id}
        </div>
        <p style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginTop: 'var(--space-xs)',
        }}>
          Nhấp vào để sao chép • {playerCount}/{room.maxPlayers} người chơi
        </p>

        <div className="glass-card" style={{ padding: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
          <h4 style={{ marginBottom: 'var(--space-md)' }}>
            🎭 Danh sách người chơi ({playerCount})
          </h4>
          <div className="player-list">
            {room.players.map((player, index) => (
              <div key={player.id} className="player-list-item" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="player-list-item__name">
                  <span className="player-avatar">
                    {player.nickname.charAt(0).toUpperCase()}
                  </span>
                  <span>{player.nickname}</span>
                  {player.id === socket.id && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(bản thân)</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                  {player.isHost && (
                    <span className="player-list-item__badge">Chủ Phòng</span>
                  )}
                  {!player.isConnected && (
                    <span className="player-list-item__badge" style={{ background: 'var(--text-muted)' }}>
                      Ngắt kết nối
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Waiting slots */}
          {playerCount < room.minPlayers && (
            <p style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              fontStyle: 'italic',
              marginTop: 'var(--space-md)',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              Đang chờ người chơi, cần thêm ít nhất {room.minPlayers - playerCount} người tham gia...
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
          <button className="btn btn--ghost" onClick={handleLeave} style={{ flex: 1 }}>
            🚪 Rời phòng
          </button>
          {isHost && (
            <button
              id="start-game-btn"
              className="btn btn--primary btn--lg"
              onClick={handleStart}
              disabled={!canStart}
              style={{ flex: 2 }}
            >
              {canStart
                ? '⚔️ Bắt đầu trò chơi'
                : `Yêu cầu ít nhất ${room.minPlayers} người chơi`}
            </button>
          )}
          {!isHost && (
            <div style={{
              flex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
            }}>
              <span className="spinner" style={{ width: 20, height: 20, marginRight: 'var(--space-sm)' }}></span>
              Chủ phòng ({room.players.find(p => p.isHost)?.nickname}) đang chuẩn bị bắt đầu...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
