// ============================================================
// GameLog — Public game event log (collapsible, max 3 visible)
// ============================================================

import { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { CHARACTER_NAMES, CHARACTER_ICONS } from '../../utils/constants';

export function GameLog() {
  const { gameState } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!gameState) return null;

  const entries = [...gameState.turnHistory].reverse();
  const displayEntries = isOpen ? entries.slice(0, 8) : entries.slice(0, 2);

  return (
    <div className="game-log-panel">
      <div
        className="game-log-panel__header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 style={{ fontSize: '0.75rem', margin: 0 }}>
          📜 Log ({entries.length})
        </h4>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
          {isOpen ? '▼ Thu gọn' : '▲ Xem thêm'}
        </span>
      </div>
      {entries.length > 0 && (
        <div className="game-log game-log--compact">
          {displayEntries.map((entry, i) => (
            <div key={i} className="game-log__entry">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                T{entry.turnNumber}
              </span>{' '}
              <span className="highlight">{entry.playerNickname}</span>
              {entry.action === 'inquire' && (
                <>
                  {' '}đã hỏi{' '}
                  <span className="highlight">{entry.targetNickname}</span>
                  {' '}rằng "Bạn là{' '}
                  {entry.characterGuess && (
                    <>
                      {CHARACTER_ICONS[entry.characterGuess]}{' '}
                      {CHARACTER_NAMES[entry.characterGuess]}
                    </>
                  )}
                  ?"
                </>
              )}
              {entry.action === 'dance' && (
                <>
                  {entry.danceAccepted
                    ? <> 💃 Khiêu vũ cùng <span className="highlight">{entry.targetNickname}</span></>
                    : <> 🚫 bị từ chối Khiêu vũ bởi <span className="highlight">{entry.targetNickname}</span></>
                  }
                </>
              )}
              {entry.action === 'accuse' && (
                <>
                  {' '}bóc phốt{' '}
                  {entry.accuseSuccess ? '✅ TRÚNG' : '❌ TRƯỢT'}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
