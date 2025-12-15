import React from 'react';
import { X, CheckCircle, Terminal, Server, Calendar, Settings } from 'lucide-react';

interface SetupGuideProps {
  onClose: () => void;
}

export const SetupGuide: React.FC<SetupGuideProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 my-8">
        <div className="flex justify-between items-center p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10 rounded-t-2xl">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary-400" />
            Project Setup Guide
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-8 text-gray-300">
          
          <section>
            <h4 className="text-white font-medium text-lg mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-900 text-primary-400 flex items-center justify-center text-xs border border-primary-700">1</span>
              Deploy Backend
            </h4>
            <div className="bg-gray-950 rounded-lg border border-gray-800 p-4 font-mono text-xs overflow-x-auto">
              <p className="text-gray-500 mb-2"># Structure needed for Node.js Backend</p>
              <div className="text-blue-300">
                POST /vapi/webhook<br/>
                GET /health
              </div>
              <p className="mt-2 text-gray-500"># Required Env Vars</p>
              <div className="text-emerald-300">
                MISTRAL_API_KEY=...<br/>
                VAPI_API_KEY=...<br/>
                GOOGLE_CALENDAR_ID=primary<br/>
                GOOGLE_APPLICATION_CREDENTIALS=service-account.json
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-white font-medium text-lg mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-900 text-primary-400 flex items-center justify-center text-xs border border-primary-700">2</span>
              Configure Vapi Agent
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <p>Create a new Assistant in Vapi Dashboard (Select Mistral).</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <p>Add Function Tool: <code className="text-primary-300">create_calendar_event</code></p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <p>Set Server URL to your deployed backend (e.g. Railway URL).</p>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-white font-medium text-lg mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-900 text-primary-400 flex items-center justify-center text-xs border border-primary-700">3</span>
              Connect Frontend
            </h4>
            <p className="text-sm mb-4">
              Click the <Settings className="w-4 h-4 inline mx-1" /> Settings icon in the top right of this app and enter your Vapi Public Key and Assistant ID.
            </p>
            <div className="p-4 bg-primary-900/20 border border-primary-800 rounded-lg">
              <p className="text-xs text-primary-200">
                <strong>Tip:</strong> This frontend uses the <code>@vapi-ai/web</code> SDK to talk directly to your configured agent. The agent then calls your backend webhook to schedule the event.
              </p>
            </div>
          </section>

        </div>
        
        <div className="p-6 border-t border-gray-800 bg-gray-800/30 rounded-b-2xl flex justify-end">
           <button 
             onClick={onClose}
             className="px-6 py-2 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
           >
             Got it, I'm ready
           </button>
        </div>
      </div>
    </div>
  );
};