// ============================================================
// ActionPanel — Compact inline turn indicator + action buttons
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
      <div className="action-panel action-panel--compact">
        <span className="action-panel__status">
          ⏳ Đang chờ {room?.players.find(p => p.id === gameState?.turnPlayerId)?.nickname || '...'} diễn
        </span>
      </div>
    );
  }

  return (
    <div className="action-panel">
      <span className="action-panel__status action-panel__status--active">
        ⚔️ Lượt sếp
      </span>
      <div className="action-panel__buttons">
        <button
          id="inquire-btn"
          className="btn btn--secondary action-btn--inline"
          onClick={onInquire}
        >
          🔍 Check Var
        </button>

        <button
          id="dance-btn"
          className="btn btn--secondary action-btn--inline"
          onClick={onDance}
          disabled={!canDance}
        >
          💃 Rủ Quẩy
        </button>

        <button
          id="accuse-btn"
          className="btn btn--primary action-btn--inline"
          onClick={onAccuse}
        >
          ⚡ Bắt Bài
        </button>
      </div>
    </div>
  );
}
