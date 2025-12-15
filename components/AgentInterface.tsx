import React from 'react';
import { Mic, MicOff, PhoneOff, Loader2 } from 'lucide-react';
import { CallStatus } from '../types';

interface AgentInterfaceProps {
  status: CallStatus;
  volume: number;
  onStart: () => void;
  onStop: () => void;
}

export const AgentInterface: React.FC<AgentInterfaceProps> = ({ status, volume, onStart, onStop }) => {
  // Normalize volume for visualization (0 to 1 approx)
  const normalizedVolume = Math.min(Math.max(volume, 0), 1);
  const scale = 1 + normalizedVolume * 1.5; // Scale between 1 and 2.5 based on volume

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Orb Container */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        
        {/* Ripples (Only active when connected) */}
        {status === 'connected' && (
          <>
            <div 
              className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl transition-all duration-75 ease-out"
              style={{ transform: `scale(${scale})` }}
            />
            <div 
              className="absolute inset-0 bg-primary-400/10 rounded-full blur-2xl transition-all duration-100 delay-75 ease-out"
              style={{ transform: `scale(${scale * 1.5})` }}
            />
          </>
        )}

        {/* Core Orb */}
        <div 
          className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(14,165,233,0.3)] transition-all duration-500
            ${status === 'connected' 
              ? 'bg-gradient-to-tr from-primary-600 to-cyan-400' 
              : status === 'connecting'
                ? 'bg-gray-700 animate-pulse'
                : 'bg-gray-800 border border-gray-700 hover:border-primary-500/50 hover:shadow-[0_0_30px_rgba(14,165,233,0.2)]'
            }
          `}
        >
          {status === 'connecting' ? (
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          ) : status === 'connected' ? (
             <div className="flex gap-1 items-center h-8">
               {[1, 2, 3, 4, 5].map((i) => (
                 <div 
                    key={i}
                    className="w-1.5 bg-white rounded-full transition-all duration-75"
                    style={{ 
                      height: `${Math.max(10, volume * 100 * (Math.random() * 2))}%`,
                      opacity: 0.8 
                    }}
                 />
               ))}
             </div>
          ) : (
            <Mic className="w-12 h-12 text-gray-400 group-hover:text-white transition-colors" />
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-12 flex gap-6">
        {status === 'disconnected' ? (
          <button
            onClick={onStart}
            className="group relative px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-semibold tracking-wide transition-all shadow-lg hover:shadow-primary-500/25 active:scale-95 flex items-center gap-3"
          >
            <Mic className="w-5 h-5" />
            <span>START CONVERSATION</span>
          </button>
        ) : (
          <button
            onClick={onStop}
            className="px-8 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-full font-semibold tracking-wide transition-all active:scale-95 flex items-center gap-3"
          >
            <PhoneOff className="w-5 h-5" />
            <span>END CALL</span>
          </button>
        )}
      </div>
    </div>
  );
};