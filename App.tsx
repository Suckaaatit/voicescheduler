import React, { useState, useEffect } from 'react';
import { AgentInterface } from './components/AgentInterface';
import { SettingsModal } from './components/SettingsModal';
import { Header } from './components/Header';
import { EventList } from './components/EventList';
import { SetupGuide } from './components/SetupGuide';
import { VapiService } from './services/vapiService';
import { CallStatus, VapiConfig } from './types';
import { Calendar, Info } from 'lucide-react';

const vapiService = new VapiService();

const App: React.FC = () => {
  const [status, setStatus] = useState<CallStatus>('disconnected');
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [volume, setVolume] = useState(0);
  const [config, setConfig] = useState<VapiConfig>({
    publicKey: '',
    assistantId: ''
  });

  // Load config from local storage
  useEffect(() => {
    const savedConfig = localStorage.getItem('vapi_config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    } else {
      setIsGuideOpen(true);
    }
  }, []);

  // Initialize Vapi listeners
  useEffect(() => {
    const cleanup = vapiService.initialize(
      (newStatus) => setStatus(newStatus),
      (newVolume) => setVolume(newVolume),
      (error) => {
        console.error("Vapi Error in App:", error);
        const msg = error?.message || (typeof error === 'string' ? error : 'Connection failed');
        if (msg.includes('ejection')) {
          alert("Call ended: The connection was rejected. Please check your Assistant ID and API Key.");
        }
      }
    );
    return cleanup;
  }, []);

  // Backend Health Check
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        // Determine backend URL based on environment
        // If local, assume port 3000. If prod, assume relative path.
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        // Note: For this demo, we prioritize localhost:3000 for local dev if protocol is http
        const url = (isLocal && window.location.protocol === 'http:') 
          ? 'http://localhost:3000/health' 
          : '/health';

        const response = await fetch(url);
        if (response.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch (error) {
        // Silent fail, just set status
        setBackendStatus('offline');
      }
    };

    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  const handleStartCall = async () => {
    if (!config.publicKey || !config.assistantId) {
      setIsSettingsOpen(true);
      return;
    }
    try {
      await vapiService.start(config.publicKey, config.assistantId);
    } catch (e) {
      console.error("Failed to start call", e);
      alert("Failed to start call. Please check your API keys.");
    }
  };

  const handleEndCall = () => {
    vapiService.stop();
  };

  const handleSaveConfig = (newConfig: VapiConfig) => {
    setConfig(newConfig);
    localStorage.setItem('vapi_config', JSON.stringify(newConfig));
    setIsSettingsOpen(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-x-hidden overflow-y-auto relative">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-900/20 rounded-full blur-3xl opacity-50 animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-3xl opacity-30"></div>
      </div>

      <Header 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      <main className="flex-1 flex flex-col md:flex-row relative z-10 p-4 md:p-8 gap-6 max-w-7xl mx-auto w-full">
        
        {/* Left Panel: Voice Agent Interface */}
        <section className="flex-1 flex flex-col items-center justify-center bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
           <div className="absolute top-4 left-4 text-xs font-mono text-gray-400 flex items-center gap-2">
             <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
             STATUS: {status.toUpperCase()}
           </div>

           <div className="flex-1 flex items-center justify-center w-full">
              <AgentInterface 
                status={status} 
                volume={volume} 
                onStart={handleStartCall}
                onStop={handleEndCall}
              />
           </div>

           <div className="mt-8 text-center max-w-md">
             <h2 className="text-2xl font-bold mb-2 tracking-tight">Vikara Voice Scheduler</h2>
             <p className="text-gray-400 text-sm">
               {status === 'connected' 
                 ? "I'm listening. Ask me to schedule a meeting." 
                 : "Ready to coordinate your calendar. Click the mic to start."}
             </p>
           </div>
        </section>

        {/* Right Panel: Context & Events */}
        <section className="hidden md:flex w-96 flex-col gap-6">
          
          <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-primary-400" />
              </div>
              <h3 className="font-semibold text-lg">Upcoming Events</h3>
            </div>
            <EventList />
          </div>

          <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 shadow-xl">
             <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-emerald-500/10 rounded-lg">
                 <Info className="w-5 h-5 text-emerald-400" />
               </div>
               <h3 className="font-semibold text-white">System Status</h3>
             </div>
             <div className="space-y-3 text-sm text-gray-400 font-mono">
               <div className="flex justify-between">
                 <span>Voice Engine</span>
                 <span className="text-emerald-400">VAPI.AI</span>
               </div>
               <div className="flex justify-between">
                 <span>LLM Model</span>
                 <span className="text-emerald-400">Mistral Large</span>
               </div>
               <div className="flex justify-between">
                 <span>Calendar API</span>
                 <span className={`${
                   backendStatus === 'online' ? "text-emerald-400" : 
                   backendStatus === 'checking' ? "text-yellow-400" : "text-red-500"
                 }`}>
                   {backendStatus === 'online' ? 'ONLINE' : 
                    backendStatus === 'checking' ? 'CHECKING...' : 'OFFLINE'}
                 </span>
               </div>
               {backendStatus === 'offline' && (
                 <div className="text-xs text-red-400/80 mt-2 pt-2 border-t border-gray-700/50">
                   Backend not reachable. Ensure server.js is running on port 3000.
                 </div>
               )}
             </div>
          </div>
        </section>
      </main>

      {/* Modals */}
      {isSettingsOpen && (
        <SettingsModal 
          config={config} 
          onSave={handleSaveConfig} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}
      
      {isGuideOpen && (
        <SetupGuide onClose={() => setIsGuideOpen(false)} />
      )}
    </div>
  );
};

export default App;