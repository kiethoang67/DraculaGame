// ============================================================
// SecretHand — Displays the player's own hidden character
// ============================================================

import { useGameStore } from '../../stores/useGameStore';
import { CHARACTER_ICONS, CHARACTER_BACKSTORIES } from '../../utils/constants';

export function SecretHand() {
  const { myCharacterId, myCharacterName, myCharacterDescription } = useGameStore();

  if (!myCharacterId || !myCharacterName) return null;

  const icon = CHARACTER_ICONS[myCharacterId] || '❓';

  return (
    <div className="secret-hand">
      <div className="secret-hand__label">Thân Phận Của Sếp</div>
      <div className="character-card__icon">{icon}</div>
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
