// ============================================================
// AccuseModal — Chọn nhân vật cho tất cả người chơi để buộc tội
// ============================================================

import { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { CHARACTER_NAMES, CHARACTER_ICONS, CHARACTER_IDS } from '../../utils/constants';
import socket from '../../socket';

interface AccuseModalProps {
  onClose: () => void;
}

export function AccuseModal({ onClose }: AccuseModalProps) {
  const { room } = useGameStore();
  const [accusations, setAccusations] = useState<Record<string, string>>({});
  const [selectingFor, setSelectingFor] = useState<string | null>(null);

  if (!room) return null;

  const targets = room.players.filter(
    p => p.id !== socket.id && !p.isRevealed
  );

  const assignedCharacters = Object.values(accusations);
  const allAssigned = targets.every(t => accusations[t.id]);

  const handleAssign = (characterId: string) => {
    if (!selectingFor) return;
    setAccusations({ ...accusations, [selectingFor]: characterId });
    setSelectingFor(null);
  };

  const handleSubmit = () => {
    if (!allAssigned) return;
    socket.emit('accuse-start', { accusations });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <h3 style={{ textAlign: 'center', marginBottom: 'var(--space-sm)' }}>
          ⚖️ Thực Hiện Buộc Tội
        </h3>
        <p style={{
          textAlign: 'center',
          color: 'var(--text-blood)',
          fontSize: '0.85rem',
          marginBottom: 'var(--space-lg)',
        }}>
          ⚠️ Lưu ý: Hành động này yêu cầu bạn lật ngửa thẻ bí mật của mình. Bạn phải dự đoán chính xác tất cả người chơi để giành chiến thắng.
        </p>

        {/* Player → Character assignments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
          {targets.map(player => (
            <div
              key={player.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-sm) var(--space-md)',
                background: 'var(--bg-glass)',
                border: `1px solid ${accusations[player.id] ? 'var(--border-gold)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <span className="player-avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                  {player.nickname.charAt(0)}
                </span>
                <span style={{ fontWeight: 500 }}>{player.nickname}</span>
              </div>

              {accusations[player.id] ? (
                <button
                  className="btn btn--secondary btn--sm"
                  onClick={() => setSelectingFor(player.id)}
                >
                  {CHARACTER_ICONS[accusations[player.id]]} {CHARACTER_NAMES[accusations[player.id]]}
                </button>
              ) : (
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={() => setSelectingFor(player.id)}
                >
                  Chọn nhân vật →
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Character picker (when selecting for a player) */}
        {selectingFor && (
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <h4 style={{ fontSize: '0.85rem', marginBottom: 'var(--space-sm)', color: 'var(--text-gold)' }}>
              Dự đoán nhân vật của: {room.players.find(p => p.id === selectingFor)?.nickname}
            </h4>
            <div className="character-grid">
              {CHARACTER_IDS.map(id => {
                const isUsed = assignedCharacters.includes(id) && accusations[selectingFor] !== id;
                return (
                  <button
                    key={id}
                    className={`character-option ${
                      accusations[selectingFor] === id ? 'character-option--selected' : ''
                    } ${isUsed ? 'character-option--assigned' : ''}`}
                    onClick={() => !isUsed && handleAssign(id)}
                    disabled={isUsed}
                  >
                    <div style={{ fontSize: '1.2rem' }}>{CHARACTER_ICONS[id]}</div>
                    <div>{CHARACTER_NAMES[id]}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          <button className="btn btn--ghost" onClick={onClose} style={{ flex: 1 }}>
            Hủy bỏ
          </button>
          <button
            className="btn btn--primary"
            onClick={handleSubmit}
            disabled={!allAssigned}
            style={{ flex: 1 }}
          >
            ⚡ Xác nhận buộc tội ({Object.keys(accusations).length}/{targets.length})
          </button>
        </div>
      </div>
    </div>
  );
}
