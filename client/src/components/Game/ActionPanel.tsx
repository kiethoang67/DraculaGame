// ============================================================
// ActionPanel — Bảng hành động trong lượt chơi
// ============================================================

import { useGameStore } from '../../stores/useGameStore';

interface ActionPanelProps {
  onInquire: () => void;
  onDance: () => void;
  onAccuse: () => void;
  onJekyllSwap: () => void;
}

export function ActionPanel({ onInquire, onDance, onAccuse, onJekyllSwap }: ActionPanelProps) {
  const { isMyTurn, room, gameState, myCharacterId, boogieMonsterDanceTriggered } = useGameStore();
  const me = room?.players.find(p => p.id === gameState?.turnPlayerId);
  const canDance = me?.canDance !== false && !me?.isRevealed;
  const isGuest = !myCharacterId;
  const isDanceRefused = gameState?.phase === 'DANCE_REFUSED';
  const isZombieForcedToDance = myCharacterId === 'zombie' && 
    gameState?.turnHistory?.some(a => a.turnNumber === gameState.turnNumber - 1 && a.action === 'dance');

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
        {boogieMonsterDanceTriggered && (
          <div className="action-panel__buttons" style={{ marginLeft: 'var(--space-md)' }}>
            <button
              id="accuse-btn-interrupt"
              className="btn btn--primary action-btn--inline"
              onClick={onAccuse}
              style={{ animation: 'pulse 1.5s infinite' }}
            >
              🚨 Bạn có muốn NGẮT LỜI CƯỚP LƯỢT để Buộc Tội ngay không?
            </button>
          </div>
        )}
        {myCharacterId === 'ghost' && useGameStore.getState().ghostCounterAccuseOption && !me?.isRevealed && (
          <div className="action-panel__buttons" style={{ marginLeft: 'var(--space-md)' }}>
            <button
              id="ghost-counter-accuse-btn"
              className="btn btn--primary action-btn--inline"
              onClick={() => {
                useGameStore.setState({ ghostCounterAccuseOption: false });
                onAccuse(); // Opens Accuse Modal
              }}
              style={{ animation: 'pulse 1.5s infinite' }}
            >
              👻 Đoán sai rồi! Lật bài và Buộc tội ngay?
            </button>
          </div>
        )}
      </div>
    );
  }

  // After dance refusal: only Inquire is allowed
  if (isDanceRefused) {
    return (
      <div className="action-panel">
        <span className="action-panel__status action-panel__status--active">
          🔍 Khiêu vũ bị từ chối {myCharacterId === 'boogie_monster' ? '— Boogie Monster có thể Bỏ qua Hỏi để Buộc tội ngay lập tức!' : '— bạn BẮT BUỘC phải Hỏi một người khác'}
        </span>
        <div className="action-panel__buttons">
          <button
            id="inquire-btn"
            className="btn btn--primary action-btn--inline"
            onClick={onInquire}
          >
            🔍 Hỏi (Inquire)
          </button>
          {myCharacterId === 'boogie_monster' && me?.canAccuse && !me?.isRevealed && (
            <button
              id="accuse-btn-interrupt"
              className="btn btn--primary action-btn--inline"
              onClick={onAccuse}
              style={{ animation: 'pulse 1.5s infinite' }}
            >
              ⚖️ Buộc tội ngay lập tức (Bỏ qua Hỏi)
            </button>
          )}
          {myCharacterId === 'zombie' && useGameStore.getState().zombieRevealOption && (
            <button
               id="zombie-force-reveal-btn"
               className="btn btn--primary action-btn--inline"
               onClick={() => {
                 import('../../socket').then(module => module.default.emit('zombie-force-reveal', { targetId: useGameStore.getState().zombieRevealOption!.targetId }));
                 useGameStore.setState({ zombieRevealOption: null });
               }}
               style={{ animation: 'pulse 1.5s infinite' }}
             >
               ⚠️ Ép Lật Bài & Buộc Tội (Zombie)
             </button>
          )}
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
          disabled={isZombieForcedToDance}
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
          disabled={isZombieForcedToDance}
        >
          ⚖️ Buộc tội (Accuse)
        </button>

        {myCharacterId === 'doctor_jekyll' && !me?.isRevealed && (
          <button
            id="jekyll-swap-btn"
            className="btn btn--secondary action-btn--inline"
            onClick={onJekyllSwap}
          >
            🂠 Tráo Bài (Swap)
          </button>
        )}
      </div>
    </div>
  );
}
