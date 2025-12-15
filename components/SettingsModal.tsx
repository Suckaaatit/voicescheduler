import React, { useState } from 'react';
import { VapiConfig } from '../types';
import { X, Key, Bot, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  config: VapiConfig;
  onSave: (config: VapiConfig) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ config, onSave, onClose }) => {
  const [publicKey, setPublicKey] = useState(config.publicKey);
  const [assistantId, setAssistantId] = useState(config.assistantId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ publicKey, assistantId });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h3 className="text-xl font-semibold">Agent Configuration</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-400">VAPI Public Key</label>
                <a 
                  href="https://dashboard.vapi.ai/org/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                >
                  Get Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  placeholder="e.g. 550e8400-e29b..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Found in Dashboard &rarr; Account &rarr; API Keys.</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-400">Assistant ID</label>
                <a 
                  href="https://dashboard.vapi.ai/assistants" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                >
                  View Assistants <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative">
                <Bot className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={assistantId}
                  onChange={(e) => setAssistantId(e.target.value)}
                  placeholder="e.g. 7d8f9g0..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Click your Assistant in the dashboard, copy the ID at the top.</p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 text-xs text-gray-400 leading-relaxed border border-gray-700/50">
            <p><strong>Note:</strong> This frontend connects directly to Vapi.ai via the Web SDK. To enable Google Calendar integration, you must deploy the Node.js backend webhook as specified in the Setup Guide.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-primary-500/20"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};