import React, { useState, useEffect } from 'react';
import { X, Calendar, Video, Image, Save, RotateCcw } from 'lucide-react';
import { CountdownEvent } from '../utils/helpers';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CountdownEvent) => void;
  onReset: () => void;
  currentEvent: CountdownEvent;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onReset,
  currentEvent
}) => {
  const [title, setTitle] = useState(currentEvent.title);
  const [bgImage, setBgImage] = useState(currentEvent.backgroundImageUrl || '');
  const [bgVideo, setBgVideo] = useState(currentEvent.backgroundVideoUrl || '');

  // Split targetDate into year, month, day, hour, minute, second
  const dateObj = new Date(currentEvent.targetDate);
  const [year, setYear] = useState(dateObj.getFullYear().toString());
  const [month, setMonth] = useState((dateObj.getMonth() + 1).toString());
  const [day, setDay] = useState(dateObj.getDate().toString());
  const [hour, setHour] = useState(dateObj.getHours().toString());
  const [minute, setMinute] = useState(dateObj.getMinutes().toString());
  const [second, setSecond] = useState(dateObj.getSeconds().toString());

  // Sync state with current event details when opened
  useEffect(() => {
    if (isOpen) {
      setTitle(currentEvent.title);
      setBgImage(currentEvent.backgroundImageUrl || '');
      setBgVideo(currentEvent.backgroundVideoUrl || '');

      const d = new Date(currentEvent.targetDate);
      setYear(d.getFullYear().toString());
      setMonth((d.getMonth() + 1).toString());
      setDay(d.getDate().toString());
      setHour(d.getHours().toString());
      setMinute(d.getMinutes().toString());
      setSecond(d.getSeconds().toString());
    }
  }, [isOpen, currentEvent]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse values to create Date object
    const y = parseInt(year) || new Date().getFullYear();
    const m = (parseInt(month) || 1) - 1; // 0-indexed month
    const d = parseInt(day) || 1;
    const h = parseInt(hour) || 0;
    const min = parseInt(minute) || 0;
    const s = parseInt(second) || 0;

    const targetDate = new Date(y, m, d, h, min, s).toISOString();

    onSave({
      title: title.trim() || 'Countdown Event',
      targetDate,
      backgroundImageUrl: bgImage.trim(),
      backgroundVideoUrl: bgVideo.trim()
    });
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset settings to standard defaults?")) {
      onReset();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md transition-opacity duration-300">
      
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-4xl glass-card rounded-3xl border border-white/10 shadow-2xl p-8 max-h-[90vh] overflow-y-auto no-scrollbar flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Countdown Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            data-nav="true"
            className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white glass-card-hover focus:outline-none"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6 flex-1">
          {/* Row 1: Event Title */}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-widest text-blue-400 uppercase">
              Event / Celebration Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-nav="true"
              placeholder="e.g. New Year's Eve, Product Launch..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none tv-input-focus transition-all duration-200"
            />
          </div>

          {/* Row 2: Date Config (Year, Month, Day) */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">Year</label>
              <input
                type="number"
                min="2026"
                max="2100"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                data-nav="true"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none tv-input-focus transition-all duration-200 text-center"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">Month (1-12)</label>
              <input
                type="number"
                min="1"
                max="12"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                data-nav="true"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none tv-input-focus transition-all duration-200 text-center"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">Day (1-31)</label>
              <input
                type="number"
                min="1"
                max="31"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                data-nav="true"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none tv-input-focus transition-all duration-200 text-center"
              />
            </div>
          </div>

          {/* Row 3: Time Config (Hour, Minute, Second) */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">Hour (0-23)</label>
              <input
                type="number"
                min="0"
                max="23"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                data-nav="true"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none tv-input-focus transition-all duration-200 text-center"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">Minute (0-59)</label>
              <input
                type="number"
                min="0"
                max="59"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                data-nav="true"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none tv-input-focus transition-all duration-200 text-center"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">Second (0-59)</label>
              <input
                type="number"
                min="0"
                max="59"
                value={second}
                onChange={(e) => setSecond(e.target.value)}
                data-nav="true"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none tv-input-focus transition-all duration-200 text-center"
              />
            </div>
          </div>

          {/* Row 4: Background Visual Customizations */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-gray-400 uppercase flex items-center space-x-1.5">
                <Image className="w-3.5 h-3.5 text-gray-400" />
                <span>Background Image URL (Optional)</span>
              </label>
              <input
                type="url"
                value={bgImage}
                onChange={(e) => setBgImage(e.target.value)}
                data-nav="true"
                placeholder="https://example.com/background.jpg"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none tv-input-focus transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-gray-400 uppercase flex items-center space-x-1.5">
                <Video className="w-3.5 h-3.5 text-gray-400" />
                <span>Background Video URL (Optional)</span>
              </label>
              <input
                type="url"
                value={bgVideo}
                onChange={(e) => setBgVideo(e.target.value)}
                data-nav="true"
                placeholder="https://example.com/loop.mp4"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none tv-input-focus transition-all duration-200"
              />
            </div>
          </div>

          {/* Footer Actions Row */}
          <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-8">
            <button
              type="button"
              onClick={handleReset}
              data-nav="true"
              className="flex items-center space-x-2 px-5 py-3 rounded-xl border border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/10 focus:outline-none tv-button-reset-focus transition-all duration-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm font-bold tracking-wider uppercase">Reset Default</span>
            </button>

            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={onClose}
                data-nav="true"
                className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white glass-card-hover focus:outline-none transition-all duration-200 text-sm font-bold tracking-wider uppercase"
              >
                Cancel
              </button>

              <button
                type="submit"
                data-nav="true"
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 border border-blue-500 text-white hover:bg-blue-700 focus:outline-none tv-button-focus transition-all duration-200 shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span className="text-sm font-bold tracking-wider uppercase">Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
