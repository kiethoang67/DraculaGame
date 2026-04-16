// ============================================================
// ActionPanel — Bảng hành động trong lượt chơi
// ============================================================

import { useGameStore } from '../../stores/useGameStore';

interface ActionPanelProps {
  onInquire: () => void;
  onDance: () => void;
  onAccuse: () => void;
}

export function ActionPanel({ onInquire, onDance, onAccuse }: ActionPanelProps) {
  const { isMyTurn, room, gameState, myCharacterId } = useGameStore();
  const me = room?.players.find(p => p.id === gameState?.turnPlayerId);
  const canDance = me?.canDance !== false && !me?.isRevealed;
  const isGuest = !myCharacterId;
  const isDanceRefused = gameState?.phase === 'DANCE_REFUSED';

  if (isGuest) {
    return (
      <div className="action-panel action-panel--guest">
        <span className="action-panel__status">
          👀 Bạn đang xem với tư cách Khách
        </span>
      </div>
    );
  }

  if (!isMyTurn) {
    return (
      <div className="action-panel action-panel--compact">
        <span className="action-panel__status">
          ⏳ Đang đợi lượt của {room?.players.find(p => p.id === gameState?.turnPlayerId)?.nickname || '...'}
        </span>
      </div>
    );
  }

  // After dance refusal: only Inquire is allowed
  if (isDanceRefused) {
    return (
      <div className="action-panel">
        <span className="action-panel__status action-panel__status--active">
          🔍 Khiêu vũ bị từ chối — bạn phải Hỏi một người chơi khác
        </span>
        <div className="action-panel__buttons">
          <button
            id="inquire-btn"
            className="btn btn--primary action-btn--inline"
            onClick={onInquire}
          >
            🔍 Hỏi (Inquire)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="action-panel">
      <span className="action-panel__status action-panel__status--active">
        ⚔️ Lượt của bạn
      </span>
      <div className="action-panel__buttons">
        <button
          id="inquire-btn"
          className="btn btn--secondary action-btn--inline"
          onClick={onInquire}
        >
          🔍 Hỏi (Inquire)
        </button>

        <button
          id="dance-btn"
          className="btn btn--secondary action-btn--inline"
          onClick={onDance}
          disabled={!canDance}
        >
          💃 Khiêu vũ (Dance)
        </button>

        <button
          id="accuse-btn"
          className="btn btn--primary action-btn--inline"
          onClick={onAccuse}
        >
          ⚖️ Buộc tội (Accuse)
        </button>
      </div>
    </div>
  );
}
