import React, { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { createRng } from '../utils/musicGenerator';

interface AudioPreviewProps {
  index: number;
  seed: number;
}

export const AudioPreview: React.FC<AudioPreviewProps> = ({ index, seed }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const togglePlay = () => {
    if (isPlaying) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    const audioCtx = new AudioContextClass();
    audioCtxRef.current = audioCtx;
    setIsPlaying(true);

    const rng = createRng((seed + index * 13) >>> 0);
    const scale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
    
    let time = audioCtx.currentTime;
    const noteDuration = 0.28 + rng() * 0.15;

    for (let i = 0; i < 24; i++) {
      const noteIdx = Math.floor(rng() * scale.length);
      
      // Melody
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.setValueAtTime(scale[noteIdx], time);
      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + noteDuration * 0.9);
      
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(time);
      osc.stop(time + noteDuration);

      // Bass
      if (i % 3 === 0) {
        const bassOsc = audioCtx.createOscillator();
        const bassGain = audioCtx.createGain();
        bassOsc.frequency.setValueAtTime(scale[noteIdx] / 2, time);
        bassGain.gain.setValueAtTime(0.2, time);
        bassGain.gain.exponentialRampToValueAtTime(0.01, time + noteDuration * 1.8);
        
        bassOsc.connect(bassGain).connect(audioCtx.destination);
        bassOsc.start(time);
        bassOsc.stop(time + noteDuration * 2);
      }

      time += noteDuration * (0.6 + rng() * 0.8);
    }

    setTimeout(() => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsPlaying(false);
    }, 8000);
  };

  return (
    <div className="bg-slate-800 rounded-2xl p-4 flex items-center gap-4">
      <button 
        onClick={togglePlay}
        className="w-12 h-12 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl flex items-center justify-center transition-all"
      >
        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
      </button>
      <div className="flex-1">
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          {isPlaying && (
            <div className="h-full bg-cyan-400 animate-[progress_8s_linear]" style={{ width: '100%' }} />
          )}
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-mono text-slate-500">
          <span>0:00</span>
          <span>0:08</span>
        </div>
      </div>
      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};
