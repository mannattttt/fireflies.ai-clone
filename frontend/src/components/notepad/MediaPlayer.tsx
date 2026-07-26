import { useState, useEffect } from "react";
import { PlayIcon, PauseIcon, SpeakerWaveIcon, ForwardIcon, BackwardIcon } from "@heroicons/react/24/solid";

interface MediaPlayerProps {
  durationSeconds: number;
  currentTime: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
}

export default function MediaPlayer({ 
  durationSeconds, 
  currentTime, 
  isPlaying, 
  onPlayPause, 
  onSeek 
}: MediaPlayerProps) {
  
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = durationSeconds > 0 ? (currentTime / durationSeconds) * 100 : 0;

  return (
    <div className="bg-[#1a1f2e] text-white rounded-xl overflow-hidden shadow-lg border border-gray-800">
      {/* Mock Video Area */}
      <div className="aspect-[21/9] bg-black relative flex items-center justify-center overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        {/* Abstract visualization replacing actual video */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <div className="flex items-center gap-1">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="w-2 bg-brand-primary rounded-full transition-all duration-150"
                style={{ 
                  height: isPlaying ? `${Math.random() * 40 + 10}px` : '4px',
                  opacity: isPlaying ? 0.8 : 0.3
                }}
              />
            ))}
          </div>
        </div>
        
        {!isPlaying && (
          <button 
            onClick={onPlayPause}
            className="w-16 h-16 bg-brand-primary/90 rounded-full flex items-center justify-center z-20 hover:scale-110 transition-transform shadow-xl shadow-brand-primary/30"
          >
            <PlayIcon className="w-8 h-8 ml-1" />
          </button>
        )}
      </div>

      {/* Controls Area */}
      <div className="p-4 bg-[#1a1f2e]">
        {/* Progress Bar */}
        <div 
          className="h-1.5 bg-gray-700 rounded-full mb-4 cursor-pointer relative group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            onSeek(pos * durationSeconds);
          }}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-brand-primary rounded-full transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${progressPercent}% - 6px)` }}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onPlayPause} className="hover:text-brand-primary transition-colors">
              {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => onSeek(Math.max(0, currentTime - 10))} className="text-gray-400 hover:text-white transition-colors">
                <BackwardIcon className="w-5 h-5" />
              </button>
              <button onClick={() => onSeek(Math.min(durationSeconds, currentTime + 10))} className="text-gray-400 hover:text-white transition-colors">
                <ForwardIcon className="w-5 h-5" />
              </button>
            </div>
            <span className="text-xs font-medium text-gray-400 font-mono">
              {formatTime(currentTime)} / {formatTime(durationSeconds)}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-xs font-semibold px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 transition-colors">
              1.0x
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <SpeakerWaveIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
