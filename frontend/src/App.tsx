import React, { useState, useEffect } from 'react';
import { Settings, Maximize, Minimize, Power, Tv } from 'lucide-react';
import { BackgroundLayer } from './components/BackgroundLayer';
import { HeaderTitle } from './components/HeaderTitle';
import { CountdownCard } from './components/CountdownCard';
import { SettingsModal } from './components/SettingsModal';
import { useCountdown } from './hooks/useCountdown';
import { useTvNavigation } from './hooks/useTvNavigation';
import { 
  fetchEventConfig, 
  saveEventConfig, 
  resetEventConfig, 
  requestWakeLock, 
  releaseWakeLock, 
  CountdownEvent 
} from './utils/helpers';

const App: React.FC = () => {
  const [event, setEvent] = useState<CountdownEvent | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  // 1. Initial Data Fetching & Wake Lock Setup
  useEffect(() => {
    const initApp = async () => {
      const config = await fetchEventConfig();
      setEvent(config);
      
      // Request screen wake lock to prevent TV sleeping
      const lockAcquired = await requestWakeLock();
      setWakeLockActive(lockAcquired);
    };

    initApp();

    // Listen to fullscreen changes to update UI toggles
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      releaseWakeLock();
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 2. Countdown calculation hook
  const timeLeft = useCountdown(event?.targetDate || new Date().toISOString());

  // 3. Register TV spatial navigation listeners
  // If settings modal is open, navigation handles modal elements.
  // We handle modal closing (Escape) and opening (Enter when focused).
  useTvNavigation({
    active: true, // Always listen to arrow key focus movements
    onEscape: () => {
      if (isSettingsOpen) {
        setIsSettingsOpen(false);
      }
    },
    onEnter: () => {
      // Custom TV Enter hooks if required
    }
  });

  // Global Remote shortcuts: Enter key opens settings, Escape closes settings
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isSettingsOpen && document.activeElement === document.body) {
        // If nothing is focused and Enter is pressed, open settings immediately
        setIsSettingsOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [isSettingsOpen]);

  // 4. Save/Reset handler callbacks
  const handleSaveSettings = async (updatedEvent: CountdownEvent) => {
    setEvent(updatedEvent);
    setIsSettingsOpen(false);
    await saveEventConfig(updatedEvent);
  };

  const handleResetSettings = async () => {
    const resetEvent = await resetEventConfig();
    setEvent(resetEvent);
    setIsSettingsOpen(false);
  };

  // 5. Fullscreen action trigger
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error(`Error requesting fullscreen: ${err.message}`));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false));
    }
  };

  if (!event) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0e] text-white">
        <Tv className="w-12 h-12 text-blue-500 animate-bounce mb-4" />
        <p className="text-lg font-medium tracking-widest text-gray-400 animate-pulse uppercase">
          Initializing TV Application...
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden px-tv-safe py-tv-safe select-none text-white">
      {/* Cinematic Dynamic Background Layer */}
      <BackgroundLayer 
        backgroundImageUrl={event.backgroundImageUrl}
        backgroundVideoUrl={event.backgroundVideoUrl}
      />

      {/* Top Header Section */}
      <HeaderTitle title={event.title} isFinished={timeLeft.isFinished} />

      {/* Main Center Area: Large Countdown Display */}
      <div className="flex-1 flex items-center justify-center my-6">
        <div className="w-full max-w-5xl">
          <CountdownCard
            days={timeLeft.days}
            hours={timeLeft.hours}
            minutes={timeLeft.minutes}
            seconds={timeLeft.seconds}
            isFinished={timeLeft.isFinished}
          />
        </div>
      </div>

      {/* Footer Navigation Bar (Sony / Google TV standard style) */}
      <div className="w-full flex items-center justify-between mt-auto border-t border-white/5 pt-4">
        {/* Remote Hints */}
        <div className="flex items-center space-x-6 text-xs text-gray-400 font-medium">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded bg-white/10 text-white font-mono text-[10px] font-bold border border-white/15 uppercase">
              D-Pad
            </span>
            <span>Navigate</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded bg-white/10 text-white font-mono text-[10px] font-bold border border-white/15 uppercase">
              Enter
            </span>
            <span>Select / Open Settings</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded bg-white/10 text-white font-mono text-[10px] font-bold border border-white/15 uppercase">
              Esc / Back
            </span>
            <span>Close Modal</span>
          </div>
          {wakeLockActive && (
            <div className="flex items-center space-x-1.5 text-green-400/90 font-semibold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/10">
              <Power className="w-3.5 h-3.5" />
              <span>AWAKE ACTIVE</span>
            </div>
          )}
        </div>

        {/* Focusable Interactive Action Buttons */}
        <div className="flex items-center space-x-4">
          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            data-nav={!isSettingsOpen ? "true" : "false"}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold hover:text-white glass-card-hover focus:outline-none transition-all duration-200"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            <span className="text-xs tracking-wider uppercase">Fullscreen</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            data-nav={!isSettingsOpen ? "true" : "false"}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600/90 border border-blue-500/30 text-white font-bold hover:bg-blue-600 glass-card-hover focus:outline-none transition-all duration-200 shadow-md"
            aria-label="Open Settings"
          >
            <Settings className="w-4 h-4" />
            <span className="text-xs tracking-wider uppercase">Settings</span>
          </button>
        </div>
      </div>

      {/* Settings Modal (Overlay overlay) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        onReset={handleResetSettings}
        currentEvent={event}
      />
    </div>
  );
};

export default App;
