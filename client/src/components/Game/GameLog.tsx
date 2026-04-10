// ============================================================
// GameLog — Public game event log (collapsible)
// ============================================================

import { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { CHARACTER_NAMES, CHARACTER_ICONS } from '../../utils/constants';

export function GameLog() {
  const { gameState } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!gameState) return null;

  const entries = [...gameState.turnHistory].reverse();

  return (
    <div className={`game-log-panel ${isOpen ? 'game-log-panel--open' : ''}`}>
      <div
        className="game-log-panel__header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 style={{ fontSize: '0.8rem', margin: 0 }}>
          📜 Camera Chạy Bằng Cơm
          {entries.length > 0 && (
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
              ({entries.length})
            </span>
          )}
        </h4>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {isOpen ? '▼ Thu gọn' : '▲ Mở log'}
        </span>
      </div>
      {isOpen && (
        <div className="game-log">
          {entries.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
              Sới vừa mở, chưa có vụ phốt nào để hít...
            </p>
          )}
          {entries.map((entry, i) => (
            <div key={i} className="game-log__entry">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                T{entry.turnNumber}
              </span>{' '}
              <span className="highlight">{entry.playerNickname}</span>
              {entry.action === 'inquire' && (
                <>
                  {' '}check var{' '}
                  <span className="highlight">{entry.targetNickname}</span>
                  {' '}"Khai mau, mài có phải là{' '}
                  {entry.characterGuess && (
                    <>
                      {CHARACTER_ICONS[entry.characterGuess]}{' '}
                      {CHARACTER_NAMES[entry.characterGuess]}
                    </>
                  )}
                  không mạy?"
                </>
              )}
              {entry.action === 'dance' && (
                <>
                  {entry.danceAccepted
                    ? <> đã lôi cổ <span className="highlight">{entry.targetNickname}</span> lên múa quạt 💃</>
                    : <> gạ quẩy <span className="highlight">{entry.targetNickname}</span> nhưng bị chê từ chối 🚫</>
                  }
                </>
              )}
              {entry.action === 'accuse' && (
                <>
                  {' '}đóng vai thám tử bóc phốt cả làng{' '}
                  {entry.accuseSuccess ? '✅ VÀ CHUẨN ĐÉT' : '❌ NHƯNG QUÊ VÌ BẮT TRƯỢT'}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
