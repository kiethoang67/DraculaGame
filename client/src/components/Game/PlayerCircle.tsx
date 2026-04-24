// ============================================================
// PlayerCircle — Người chơi xếp quanh bàn tròn (Card-based UI)
// ============================================================

import { useGameStore } from '../../stores/useGameStore';
import { CHARACTER_ICONS, CHARACTER_NAMES, CHARACTER_IMAGES } from '../../utils/constants';
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
          <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {gameState.revealedMysteryGuests.map((charId, idx) => (
              <div key={idx} style={{
                width: 40,
                height: 56,
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid var(--border-gold)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              }} title={CHARACTER_NAMES[charId as keyof typeof CHARACTER_NAMES]}>
                {CHARACTER_IMAGES[charId as keyof typeof CHARACTER_IMAGES] ? (
                  <img
                    src={CHARACTER_IMAGES[charId as keyof typeof CHARACTER_IMAGES]}
                    alt={CHARACTER_NAMES[charId as keyof typeof CHARACTER_NAMES]}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', fontSize: '1.2rem' }}>
                    {CHARACTER_ICONS[charId as keyof typeof CHARACTER_ICONS]}
                  </div>
                )}
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

        // Determine which card image to show
        const revealedImage = isRevealed && player.revealedCharacterId
          ? CHARACTER_IMAGES[player.revealedCharacterId]
          : null;
        const selfImage = isSelf && myCharacterId
          ? CHARACTER_IMAGES[myCharacterId]
          : null;

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
                padding: '0',
                minWidth: 72,
                textAlign: 'center',
                border: 'none',
                background: 'transparent',
                cursor: isSelf || isRevealed ? 'default' : 'pointer',
              }}
            >
              {/* Card Visual */}
              <div className="player-card" style={{
                width: 68,
                height: 95,
                borderRadius: 6,
                overflow: 'hidden',
                position: 'relative',
                boxShadow: isActive
                  ? '0 0 12px 3px var(--color-gold-bright)'
                  : isSelected
                    ? '0 0 10px 2px var(--color-gold)'
                    : '0 3px 12px rgba(0,0,0,0.5)',
                border: isActive
                  ? '2px solid var(--color-gold-bright)'
                  : isRevealed
                    ? '2px solid var(--text-blood)'
                    : isSelf
                      ? '2px solid var(--color-gold)'
                      : '2px solid var(--border-subtle)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                margin: '0 auto',
              }}>
                {revealedImage ? (
                  // Revealed player: Show their character card
                  <img
                    src={revealedImage}
                    alt={CHARACTER_NAMES[player.revealedCharacterId!]}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : selfImage ? (
                  // Self (not revealed): Show your own card with a subtle glow
                  <img
                    src={selfImage}
                    alt="Your character"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                  />
                ) : (
                  // Other unrevealed players: Card back
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #1a0a2e, #2d1b4e, #1a0a2e)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}>
                    {/* Decorative card back pattern */}
                    <div style={{
                      width: '80%',
                      height: '85%',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.1), transparent)',
                    }}>
                      <span style={{ fontSize: '1.8rem', opacity: 0.6 }}>🦇</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Player Name */}
              <span style={{
                fontSize: '0.7rem',
                fontWeight: isActive ? 700 : 500,
                color: isSelf ? 'var(--color-gold-bright)' : 'var(--text-primary)',
                whiteSpace: 'nowrap',
                marginTop: 'var(--space-xs)',
              }}>
                {player.nickname}
                {isSelf ? ' (Bạn)' : ''}
              </span>

              {/* Character name if revealed */}
              {isRevealed && player.revealedCharacterId && (
                <span style={{
                  fontSize: '0.6rem',
                  color: 'var(--text-blood)',
                  fontWeight: 600,
                }}>
                  {CHARACTER_NAMES[player.revealedCharacterId]}
                </span>
              )}

              {/* Active indicator */}
              {isActive && (
                <span style={{
                  fontSize: '0.55rem',
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
