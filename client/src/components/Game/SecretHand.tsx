// ============================================================
// SecretHand — Displays the player's own hidden character
// ============================================================

import { useGameStore } from '../../stores/useGameStore';
import { CHARACTER_ICONS } from '../../utils/constants';

export function SecretHand() {
  const { myCharacterId, myCharacterName, myCharacterDescription } = useGameStore();

  if (!myCharacterId || !myCharacterName) return null;

  const icon = CHARACTER_ICONS[myCharacterId] || '❓';

  return (
    <div className="secret-hand">
      <div className="secret-hand__label">Your Secret Identity</div>
      <div className="character-card__icon">{icon}</div>
      <div className="secret-hand__character">{myCharacterName}</div>
      <div className="secret-hand__ability">{myCharacterDescription}</div>
    </div>
  );
}
