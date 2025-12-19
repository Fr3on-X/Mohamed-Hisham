import React, { useState } from 'react';
import { AppMode } from './types';
import StrategyView from './components/StrategyView';
import CreativeView from './components/CreativeView';
import ContentView from './components/ContentView';
import LiveView from './components/LiveView';

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.STRATEGY);

  const renderContent = () => {
    switch (currentMode) {
      case AppMode.STRATEGY: return <StrategyView />;
      case AppMode.CREATIVE: return <CreativeView />;
      case AppMode.CONTENT: return <ContentView />;
      case AppMode.LIVE: return <LiveView />;
      default: return <StrategyView />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-black border-r border-zinc-900 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tighter text-white">
            NOTSTUDIO <span className="text-zinc-600">NEXUS</span>
          </h1>
          <div className="mt-1 text-[10px] text-zinc-500 font-mono uppercase">Internal Alpha v0.9</div>
        </div>
        
        <nav className="flex-1 px-3 space-y-1">
            <NavButton 
                active={currentMode === AppMode.STRATEGY} 
                onClick={() => setCurrentMode(AppMode.STRATEGY)}
                icon="psychology"
                label="Strategy"
            />
            <NavButton 
                active={currentMode === AppMode.CREATIVE} 
                onClick={() => setCurrentMode(AppMode.CREATIVE)}
                icon="palette"
                label="Creative"
            />
            <NavButton 
                active={currentMode === AppMode.CONTENT} 
                onClick={() => setCurrentMode(AppMode.CONTENT)}
                icon="description"
                label="Content"
            />
            <NavButton 
                active={currentMode === AppMode.LIVE} 
                onClick={() => setCurrentMode(AppMode.LIVE)}
                icon="sensors"
                label="Live War Room"
            />
        </nav>

        <div className="p-6 border-t border-zinc-900">
            <div className="text-xs text-zinc-600">
                Authorized Personnel Only.<br/>
                API Key Injected.
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
         {/* Top decorative bar */}
         <div className="h-1 w-full bg-gradient-to-r from-zinc-800 to-zinc-900"></div>
         
         <div className="h-full overflow-y-auto">
            {renderContent()}
         </div>
      </main>

      {/* Simple link to material icons for UI */}
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
    </div>
  );
};

const NavButton: React.FC<{active: boolean, onClick: () => void, icon: string, label: string}> = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            active 
            ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
            : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
        }`}
    >
        <span className="material-icons text-lg">{icon}</span>
        <span>{label}</span>
    </button>
);

export default App;