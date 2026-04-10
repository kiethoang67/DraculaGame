// ============================================================
// MusicToggle — Background music using Web Audio API synthesizer
// ============================================================
// Generates a dark ambient drone loop locally — no CDN needed.

import { useState, useRef, useCallback } from 'react';

function createAmbientAudio(ctx: AudioContext): { gain: GainNode } {
  // Create a dark droning chord (C2 + Eb2 + G2 + Bb2) with detuned oscillators
  const frequencies = [65.41, 77.78, 98.0, 116.54, 130.81];
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.12;
  masterGain.connect(ctx.destination);

  frequencies.forEach((freq, i) => {
    // Main oscillator
    const osc = ctx.createOscillator();
    osc.type = i % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.value = freq;
    osc.detune.value = Math.random() * 10 - 5;

    // Slow LFO for subtle pulsing
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1 + Math.random() * 0.2;

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.02;

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    // Individual gain
    const oscGain = ctx.createGain();
    oscGain.gain.value = 0.3 / frequencies.length;

    osc.connect(oscGain);
    oscGain.connect(masterGain);

    osc.start();
    lfo.start();
  });

  // Add filtered noise for atmosphere
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.015;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.value = 200;
  noiseFilter.Q.value = 1;

  noise.connect(noiseFilter);
  noiseFilter.connect(masterGain);
  noise.start();

  return { gain: masterGain };
}

export function MusicToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showVolume, setShowVolume] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const toggleMusic = useCallback(() => {
    if (isPlaying) {
      // Stop
      if (ctxRef.current) {
        ctxRef.current.close();
        ctxRef.current = null;
        gainRef.current = null;
      }
      setIsPlaying(false);
    } else {
      // Start
      const ctx = new AudioContext();
      const { gain } = createAmbientAudio(ctx);
      gain.gain.value = volume * 0.4;
      ctxRef.current = ctx;
      gainRef.current = gain;
      setIsPlaying(true);
    }
  }, [isPlaying, volume]);

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (gainRef.current) {
      gainRef.current.gain.value = newVol * 0.4;
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
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
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
