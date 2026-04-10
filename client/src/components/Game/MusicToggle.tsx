// ============================================================
// MusicToggle — Background music player with toggle button
// ============================================================

import { useState, useRef, useEffect } from 'react';

// Royalty-free dark ambient music
const MUSIC_URL = 'https://cdn.pixabay.com/audio/2022/03/15/audio_8a1a666a5a.mp3';

export function MusicToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showVolume, setShowVolume] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = volume;
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay might be blocked
      });
    }
  };

  return (
    <div
      className="music-toggle"
      onMouseEnter={() => setShowVolume(true)}
      onMouseLeave={() => setShowVolume(false)}
    >
      <button
        className="music-toggle__btn"
        onClick={toggleMusic}
        title={isPlaying ? 'Tắt nhạc' : 'Bật nhạc'}
      >
        {isPlaying ? '🔊' : '🔇'}
      </button>
      {showVolume && (
        <div className="music-toggle__volume">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="music-toggle__slider"
          />
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', minWidth: 28, textAlign: 'center' }}>
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
