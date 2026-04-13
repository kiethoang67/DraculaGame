// ============================================================
// GameBoard — Main game view composing all game components
// ============================================================

import { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { PlayerCircle } from './PlayerCircle';
import { SecretHand } from './SecretHand';
import { ActionPanel } from './ActionPanel';
import { InquiryModal } from './InquiryModal';
import { DanceModal, DanceResultModal } from './DanceModal';
import { AccuseModal } from './AccuseModal';
import { InquiryResultModal } from './InquiryResultModal';
import { WhisperResponseModal, InquiryWaitingModal } from './WhisperResponseModal';
import { GameLog } from './GameLog';
import { GuestList } from './GuestList';
import { GameOverScreen } from './GameOverScreen';
import { ChatBox } from '../Chat/ChatBox';
import { Notepad } from './Notepad';

export function GameBoard() {
  const { gameState, pendingDance, pendingInquiry, inquiryWaiting, inquiryResult, danceResult, gameOver } = useGameStore();

  // Modal states
  const [showInquiry, setShowInquiry] = useState(false);
  const [showDance, setShowDance] = useState(false);
  const [showAccuse, setShowAccuse] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const handlePlayerClick = (playerId: string) => {
    setSelectedPlayerId(playerId);
  };

  if (!gameState) return null;

  return (
    <>
      <div className="game-layout">
        {/* Main game area — PlayerCircle fills the space, panels overlay */}
        <div className="game-main">
          {/* Player circle — takes full space */}
          <div className="game-main__arena">
            <PlayerCircle
              onPlayerClick={handlePlayerClick}
              selectedPlayerId={selectedPlayerId}
            />
          </div>

          {/* Action panel — overlays top */}
          <div className="game-main__top-overlay">
            <ActionPanel
              onInquire={() => setShowInquiry(true)}
              onDance={() => setShowDance(true)}
              onAccuse={() => setShowAccuse(true)}
            />
          </div>

          {/* Game log — overlays bottom, collapsible */}
          <div className="game-main__bottom-overlay">
            <GameLog />
          </div>
        </div>

        {/* Sidebar */}
        <div className="game-sidebar">
          {/* Secret hand */}
          <SecretHand />

          {/* Chat */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <ChatBox />
          </div>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────── */}

      {/* Inquiry modal */}
      {showInquiry && (
        <InquiryModal
          onClose={() => { setShowInquiry(false); setSelectedPlayerId(null); }}
          preSelectedTarget={selectedPlayerId}
        />
      )}

      {/* Dance invite modal */}
      {showDance && (
        <DanceModal
          mode="invite"
          onClose={() => { setShowDance(false); setSelectedPlayerId(null); }}
          preSelectedTarget={selectedPlayerId}
        />
      )}

      {/* Dance response modal (when someone invites YOU) */}
      {pendingDance && (
        <DanceModal
          mode="respond"
          onClose={() => {}}
        />
      )}

      {/* Accuse modal */}
      {showAccuse && (
        <AccuseModal onClose={() => setShowAccuse(false)} />
      )}

      {/* Whisper card response (target answers Yes/No) */}
      {pendingInquiry && <WhisperResponseModal />}

      {/* Waiting for target's whisper card (shown to asker) */}
      {inquiryWaiting && <InquiryWaitingModal />}

      {/* Result modals */}
      {inquiryResult && <InquiryResultModal />}
      {danceResult && <DanceResultModal />}

      {/* Overlays / Modals */}
      <div className="game-overlays">
        <GuestList />
        <ChatBox />
        <Notepad />
      </div>

      {/* Game over overlay */}
      {gameOver && <GameOverScreen />}
    </>
  );
}
