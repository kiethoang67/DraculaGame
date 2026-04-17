// ============================================================
// PlayerCircle — Người chơi xếp quanh bàn tròn
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

  // Only show players actually in the game (in seatOrder)
  const gamePlayers = room.players.filter(p => gameState.seatOrder.includes(p.id));
  const totalPlayers = gamePlayers.length;

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
          Khách Ẩn
          <br />
          ({gameState.mysteryGuestCount} thẻ)
        </div>

        {/* Display revealed Mystery Guests (e.g. from Jekyll swap) */}
        {gameState.revealedMysteryGuests && gameState.revealedMysteryGuests.length > 0 && (
          <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            {gameState.revealedMysteryGuests.map((charId, idx) => (
              <div key={idx} style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-xs) var(--space-sm)',
                fontSize: '0.75rem',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                boxShadow: 'var(--shadow-sm)'
              }} title="Thẻ đã lật ở vị trí Khách Ẩn">
                <span>{CHARACTER_ICONS[charId as keyof typeof CHARACTER_ICONS]}</span>
                {CHARACTER_NAMES[charId as keyof typeof CHARACTER_NAMES]}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Player nodes arranged in a circle */}
      {gamePlayers.map((player, index) => {
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
                width: 48,
                height: 48,
                fontSize: '1.4rem',
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
                {isSelf ? ' (Bạn)' : ''}
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
                  ◆ Đang hành động
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
