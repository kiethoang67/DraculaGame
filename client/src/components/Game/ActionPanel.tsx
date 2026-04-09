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
            ⏳ Waiting for {room?.players.find(p => p.id === gameState?.turnPlayerId)?.nickname || '...'}'s turn
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="action-panel">
      <div className="turn-indicator turn-indicator--active" style={{ width: '100%', marginBottom: 'var(--space-md)' }}>
        <div className="turn-indicator__text">⚔️ Your Turn — Choose an Action</div>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-md)', width: '100%' }}>
        <button
          id="inquire-btn"
          className="btn btn--secondary action-btn"
          onClick={onInquire}
        >
          <span className="action-btn__icon">🔍</span>
          <span>Inquire</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Ask identity</span>
        </button>

        <button
          id="dance-btn"
          className="btn btn--secondary action-btn"
          onClick={onDance}
          disabled={!canDance}
        >
          <span className="action-btn__icon">💃</span>
          <span>Dance</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Swap cards</span>
        </button>

        <button
          id="accuse-btn"
          className="btn btn--primary action-btn"
          onClick={onAccuse}
        >
          <span className="action-btn__icon">⚡</span>
          <span>Accuse</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Guess all</span>
        </button>
      </div>
    </div>
  );
}
