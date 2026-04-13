import React, { useEffect, useRef } from 'react';
import { createRng } from '../utils/musicGenerator';

interface MusicCoverProps {
  title: string;
  artist: string;
  album: string;
  seed: number;
  size?: number;
}

export const MusicCover: React.FC<MusicCoverProps> = ({ title, artist, album, seed, size = 320 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rng = createRng(seed);
    const hue = Math.floor(rng() * 360);

    // Background
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, `hsl(${hue}, 85%, 55%)`);
    grad.addColorStop(1, `hsl(${hue + 40}, 70%, 25%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Pattern
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, (size / 8) + i * (size / 18), 0, Math.PI * 2);
      ctx.stroke();
    }

    // Text
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    
    ctx.font = `700 ${size * 0.0875}px Inter`;
    ctx.fillText(title.toUpperCase(), size / 2, size * 0.35);

    ctx.shadowBlur = 8;
    ctx.font = `500 ${size * 0.056}px Inter`;
    ctx.fillText(`by ${artist}`, size / 2, size * 0.47);

    ctx.font = `400 ${size * 0.05}px Inter`;
    ctx.fillText(album, size / 2, size * 0.6);

    // Vinyl effect
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.arc(size * 0.8, size * 0.8, size * 0.07, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(size * 0.8, size * 0.8, size * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }, [title, artist, album, seed, size]);

  return (
    <canvas 
      ref={canvasRef} 
      width={size} 
      height={size} 
      className="rounded-2xl shadow-2xl"
    />
  );
};
