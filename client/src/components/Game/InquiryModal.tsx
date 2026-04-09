// ============================================================
// InquiryModal — Select target + character to inquire about
// ============================================================

import { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { CHARACTER_NAMES, CHARACTER_ICONS, CHARACTER_IDS } from '../../utils/constants';
import socket from '../../socket';

interface InquiryModalProps {
  onClose: () => void;
  preSelectedTarget?: string | null;
}

export function InquiryModal({ onClose, preSelectedTarget }: InquiryModalProps) {
  const { room, gameState } = useGameStore();
  const [targetId, setTargetId] = useState<string | null>(preSelectedTarget || null);
  const [characterGuess, setCharacterGuess] = useState<string | null>(null);

  if (!room || !gameState) return null;

  const validTargets = room.players.filter(
    p => p.id !== socket.id && !p.isRevealed
  );

  const handleSubmit = () => {
    if (!targetId || !characterGuess) return;
    socket.emit('inquire-request', { targetId, characterGuess });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3 style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          🔍 Check Var Toàn Tập
        </h3>

        {/* Step 1: Select target */}
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <h4 style={{ fontSize: '0.85rem', marginBottom: 'var(--space-sm)' }}>
            1. Khứa nào bạn muốn gài thóp?
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            {validTargets.map(player => (
              <button
                key={player.id}
                className={`character-option ${targetId === player.id ? 'character-option--selected' : ''}`}
                onClick={() => setTargetId(player.id)}
                style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}
              >
                <span className="player-avatar" style={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                  {player.nickname.charAt(0)}
                </span>
                {player.nickname}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select character guess */}
        {targetId && (
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <h4 style={{ fontSize: '0.85rem', marginBottom: 'var(--space-sm)' }}>
              2. Giơ mặt ra hỏi: "Ê phen, mài là..."
            </h4>
            <div className="character-grid">
              {CHARACTER_IDS.map(id => (
                <button
                  key={id}
                  className={`character-option ${characterGuess === id ? 'character-option--selected' : ''}`}
                  onClick={() => setCharacterGuess(id)}
                >
                  <div style={{ fontSize: '1.2rem' }}>{CHARACTER_ICONS[id]}</div>
                  <div>{CHARACTER_NAMES[id]}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
          <button className="btn btn--ghost" onClick={onClose} style={{ flex: 1 }}>
            Tem Tém Lại
          </button>
          <button
            className="btn btn--primary"
            onClick={handleSubmit}
            disabled={!targetId || !characterGuess}
            style={{ flex: 1 }}
          >
            Hỏi Thử Cái Nhe
          </button>
        </div>
      </div>
    </div>
  );
}
