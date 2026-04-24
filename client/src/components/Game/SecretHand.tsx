// ============================================================
// SecretHand — Hiển thị nhân vật bí mật của người chơi
// ============================================================

import { useGameStore } from '../../stores/useGameStore';
import { CHARACTER_IMAGES, CHARACTER_BACKSTORIES } from '../../utils/constants';

export function SecretHand() {
  const { myCharacterId, myCharacterName, myCharacterDescription } = useGameStore();

  if (!myCharacterId) {
    if (myCharacterName === 'Khách') {
      return (
        <div className="secret-hand secret-hand--guest">
          <div className="secret-hand__label">Chế Độ Khách</div>
          <div className="character-card__icon">👁️</div>
          <div className="secret-hand__character">Đang Quan Sát</div>
          <div className="secret-hand__ability">{myCharacterDescription}</div>
        </div>
      );
    }
    return null;
  }

  const cardImage = CHARACTER_IMAGES[myCharacterId];

  return (
    <div className="secret-hand">
      <div className="secret-hand__label">Nhân Vật Của Bạn</div>
      {cardImage && (
        <img
          src={cardImage}
          alt={myCharacterName || 'Character'}
          style={{
            width: '100%',
            maxWidth: 180,
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            margin: '0 auto var(--space-sm)',
            display: 'block',
          }}
        />
      )}
      <div className="secret-hand__character">{myCharacterName}</div>
      <div className="secret-hand__ability" style={{ marginBottom: 4 }}>{myCharacterDescription}</div>
      {CHARACTER_BACKSTORIES[myCharacterId] && (
        <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--text-muted)', marginTop: 'var(--space-xs)' }}>
          "{CHARACTER_BACKSTORIES[myCharacterId]}"
        </div>
      )}
    </div>
  );
}
