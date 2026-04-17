// ============================================================
// VanHelsingAccuseModal — Đặc quyền của Van Helsing: Đoán 1 người là Dracula
// ============================================================

import { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import socket from '../../socket';

interface Props {
  onClose: () => void;
}

export function VanHelsingAccuseModal({ onClose }: Props) {
  const { room } = useGameStore();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  if (!room) return null;

  const targets = room.players.filter(p => !p.isRevealed && p.id !== socket.id);

  const handleSubmit = () => {
    if (!selectedTarget) return;
    socket.emit('van-helsing-accuse', { targetId: selectedTarget });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 500 }}>
        <h3 style={{ textAlign: 'center', marginBottom: 'var(--space-sm)' }}>
          ⚔️ Quyền Lực Của Van Helsing
        </h3>
        <p style={{
          textAlign: 'center',
          color: 'var(--text-blood)',
          fontSize: '0.85rem',
          marginBottom: 'var(--space-lg)',
        }}>
          ⚠️ Đã có người đoán sai tất cả! Với tư cách là Van Helsing, thẻ bài của bạn sẽ tự động được thu hồi và lật ngửa. Hãy chọn duy nhất một người chơi mà bạn tin là <strong>Dracula</strong>. Nếu đoán sai, lượt của người vừa buộc tội hỏng sẽ được tiếp tục!
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', maxHeight: '30vh', overflowY: 'auto' }}>
          {targets.map(player => (
            <div
              key={player.id}
              onClick={() => setSelectedTarget(player.id)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-sm) var(--space-md)',
                background: selectedTarget === player.id ? 'var(--bg-card-hover)' : 'var(--bg-surface)',
                border: `1px solid ${selectedTarget === player.id ? 'var(--text-blood)' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontWeight: 600 }}>{player.nickname}</span>
              {selectedTarget === player.id && <span style={{ color: 'var(--text-blood)' }}>🦇 Ai là Dracula?</span>}
            </div>
          ))}
          {targets.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Không còn ai để buộc tội.</p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
          <button
            className="btn btn--primary action-btn--inline"
            onClick={handleSubmit}
            disabled={!selectedTarget}
          >
            Xác nhận đó là Dracula
          </button>
        </div>
      </div>
    </div>
  );
}
