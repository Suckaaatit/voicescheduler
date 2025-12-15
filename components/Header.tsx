import React from 'react';
import { Settings, HelpCircle, Github } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenGuide }) => {
  return (
    <header className="w-full p-6 flex justify-between items-center z-20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
          <span className="text-xl font-bold">V</span>
        </div>
        <div>
           <h1 className="font-bold text-xl tracking-tight leading-none">VoiceScheduler</h1>
           <span className="text-xs text-primary-400 font-medium">AI AGENT DEMO</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenGuide}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          title="Setup Guide"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
        <button 
          onClick={onOpenSettings}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          title="VAPI Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm font-medium rounded-lg border border-gray-700 transition-colors flex items-center gap-2"
        >
          <Github className="w-4 h-4" />
          <span>Star on GitHub</span>
        </a>
      </div>
    </header>
  );
};