// ============================================================
// PlayerCircle — Players arranged around a circular table
// ============================================================

import { useGameStore } from '../../stores/useGameStore';
import { CHARACTER_ICONS, CHARACTER_NAMES } from '../../utils/constants';
import socket from '../../socket';

interface PlayerCircleProps {
  onPlayerClick: (playerId: string) => void;
  selectedPlayerId?: string | null;
}

export function PlayerCircle({ onPlayerClick, selectedPlayerId }: PlayerCircleProps) {
  const { room, gameState, myCharacterId } = useGameStore();

  if (!room || !gameState) return null;

  const players = room.players;
  const totalPlayers = players.length;

  return (
    <div className="player-circle">
      {/* Center — Mystery Guest info */}
      <div className="player-circle__center">
        <div style={{ fontSize: '2rem' }}>🂠</div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          marginTop: 'var(--space-xs)',
        }}>
          Khách Không Mời
          <br />
          ({gameState.mysteryGuestCount} thẻ{gameState.mysteryGuestCount !== 1 ? '' : ''})
        </div>
      </div>

      {/* Player nodes arranged in a circle */}
      {players.map((player, index) => {
        const angle = (index / totalPlayers) * 2 * Math.PI - Math.PI / 2;
        const radius = 42; // % from center
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);

        const isActive = gameState.turnPlayerId === player.id;
        const isSelf = player.id === socket.id;
        const isSelected = selectedPlayerId === player.id;
        const isRevealed = player.isRevealed;

        return (
          <div
            key={player.id}
            className={`player-circle__node`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
            }}
            onClick={() => !isSelf && !isRevealed && onPlayerClick(player.id)}
          >
            <div
              className={`player-badge ${isActive ? 'player-badge--active' : ''} ${isRevealed ? 'player-badge--revealed' : ''}`}
              style={{
                flexDirection: 'column',
                padding: 'var(--space-sm) var(--space-md)',
                minWidth: 80,
                textAlign: 'center',
                border: isSelected ? '2px solid var(--color-gold-bright)' : undefined,
                cursor: isSelf || isRevealed ? 'default' : 'pointer',
              }}
            >
              <div className="player-avatar" style={{
                background: isSelf
                  ? 'linear-gradient(135deg, var(--color-gold), var(--color-gold-dim))'
                  : isRevealed
                    ? 'var(--text-muted)'
                    : 'linear-gradient(135deg, var(--color-blood), var(--color-blood-light))',
                width: 36,
                height: 36,
                fontSize: '1rem',
              }}>
                {isRevealed && player.revealedCharacterId
                  ? CHARACTER_ICONS[player.revealedCharacterId] || '❓'
                  : isSelf && myCharacterId
                    ? CHARACTER_ICONS[myCharacterId] || player.nickname.charAt(0).toUpperCase()
                    : player.nickname.charAt(0).toUpperCase()
                }
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: isActive ? 700 : 500,
                color: isSelf ? 'var(--color-gold-bright)' : 'var(--text-primary)',
                whiteSpace: 'nowrap',
              }}>
                {player.nickname}
                {isSelf ? ' (bản tôn)' : ''}
              </span>
              {isRevealed && player.revealedCharacterId && (
                <span style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-blood)',
                }}>
                  {CHARACTER_NAMES[player.revealedCharacterId]}
                </span>
              )}
              {isActive && (
                <span style={{
                  fontSize: '0.6rem',
                  color: 'var(--color-gold-bright)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}>
                  ◆ Đang quậy
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
