// ============================================================
// ActionPanel — Inquire / Dance / Accuse action buttons
// ============================================================

import { useGameStore } from '../../stores/useGameStore';

interface ActionPanelProps {
  onInquire: () => void;
  onDance: () => void;
  onAccuse: () => void;
}

export function ActionPanel({ onInquire, onDance, onAccuse }: ActionPanelProps) {
  const { isMyTurn, room, gameState } = useGameStore();
  const me = room?.players.find(p => p.id === gameState?.turnPlayerId);
  const canDance = me?.canDance !== false;

  if (!isMyTurn) {
    return (
      <div className="action-panel">
        <div className="turn-indicator">
          <div className="turn-indicator__text">
            ⏳ Đang pha trà ngồi xem {room?.players.find(p => p.id === gameState?.turnPlayerId)?.nickname || '...'} diễn
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="action-panel">
      <div className="turn-indicator turn-indicator--active" style={{ width: '100%', marginBottom: 'var(--space-md)' }}>
        <div className="turn-indicator__text">⚔️ Tới Lượt Sếp — Bấm Lẹ Lên</div>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-md)', width: '100%' }}>
        <button
          id="inquire-btn"
          className="btn btn--secondary action-btn"
          onClick={onInquire}
        >
          <span className="action-btn__icon">🔍</span>
          <span>Check Var</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Hỏi cung bí mật</span>
        </button>

        <button
          id="dance-btn"
          className="btn btn--secondary action-btn"
          onClick={onDance}
          disabled={!canDance}
        >
          <span className="action-btn__icon">💃</span>
          <span>Rủ Quẩy</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Ép đổi thẻ bài</span>
        </button>

        <button
          id="accuse-btn"
          className="btn btn--primary action-btn"
          onClick={onAccuse}
        >
          <span className="action-btn__icon">⚡</span>
          <span>Bắt Bài</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Lật tẩy cả sới</span>
        </button>
      </div>
    </div>
  );
}
