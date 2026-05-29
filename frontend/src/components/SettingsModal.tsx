import React, { useState, useEffect } from 'react';
import { X, Calendar, Video, Image, Save, Trash2, Plus, Check } from 'lucide-react';
import { CountdownEvent, CountdownState } from '../utils/helpers';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveState: (state: CountdownState) => void;
  currentState: CountdownState;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSaveState,
  currentState
}) => {
  // Local copies of the full state
  const [events, setEvents] = useState<CountdownEvent[]>(currentState.events);
  const [activeId, setActiveId] = useState<string>(currentState.activeEventId);
  
  // Track currently selected event for editing (can be different from the active timer)
  const [selectedEventId, setSelectedEventId] = useState<string>(currentState.activeEventId);

  // Form states for the selected event
  const [title, setTitle] = useState('');
  const [bgImage, setBgImage] = useState('');
  const [bgVideo, setBgVideo] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [second, setSecond] = useState('');

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setEvents(currentState.events);
      setActiveId(currentState.activeEventId);
      setSelectedEventId(currentState.activeEventId);
    }
  }, [isOpen, currentState]);

  // Load selected event details into form when selection changes
  useEffect(() => {
    const selectedEvent = events.find(e => e.id === selectedEventId) || events[0];
    if (selectedEvent) {
      setTitle(selectedEvent.title);
      setBgImage(selectedEvent.backgroundImageUrl || '');
      setBgVideo(selectedEvent.backgroundVideoUrl || '');

      const d = new Date(selectedEvent.targetDate);
      setYear(d.getFullYear().toString());
      setMonth((d.getMonth() + 1).toString());
      setDay(d.getDate().toString());
      setHour(d.getHours().toString());
      setMinute(d.getMinutes().toString());
      setSecond(d.getSeconds().toString());
    }
  }, [selectedEventId, events]);

  if (!isOpen) return null;

  // 1. Create a blank new deadline
  const handleAddNewEvent = () => {
    const nextYear = new Date().getFullYear() + 1;
    const defaultDate = new Date(nextYear, 0, 1, 0, 0, 0);
    const newEvent: CountdownEvent = {
      id: "deadline-" + Math.random().toString(36).substring(2, 9),
      title: "New Event Title",
      targetDate: defaultDate.toISOString(),
      backgroundImageUrl: "",
      backgroundVideoUrl: ""
    };
    
    const newEvents = [...events, newEvent];
    setEvents(newEvents);
    setSelectedEventId(newEvent.id);
  };

  // 2. Save changes to the selected deadline
  const handleSaveSelectedEvent = (e: React.FormEvent) => {
    e.preventDefault();

    const y = parseInt(year) || new Date().getFullYear();
    const m = (parseInt(month) || 1) - 1;
    const d = parseInt(day) || 1;
    const h = parseInt(hour) || 0;
    const min = parseInt(minute) || 0;
    const s = parseInt(second) || 0;
    const targetDate = new Date(y, m, d, h, min, s).toISOString();

    const updatedEvents = events.map(ev => {
      if (ev.id === selectedEventId) {
        return {
          ...ev,
          title: title.trim() || 'Countdown Event',
          targetDate,
          backgroundImageUrl: bgImage.trim(),
          backgroundVideoUrl: bgVideo.trim()
        };
      }
      return ev;
    });

    setEvents(updatedEvents);
    
    // Save to global state instantly
    onSaveState({
      events: updatedEvents,
      activeEventId: activeId
    });
    alert("Deadline updated successfully!");
  };

  // 3. Set selected deadline as the active countdown
  const handleSetActiveEvent = () => {
    setActiveId(selectedEventId);
    onSaveState({
      events,
      activeEventId: selectedEventId
    });
  };

  // 4. Delete the selected deadline
  const handleDeleteSelectedEvent = () => {
    if (events.length <= 1) {
      alert("You must keep at least one deadline.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      const remainingEvents = events.filter(ev => ev.id !== selectedEventId);
      setEvents(remainingEvents);
      
      // If we deleted the active event, reset active to the first remaining event
      let newActiveId = activeId;
      if (selectedEventId === activeId) {
        newActiveId = remainingEvents[0].id;
        setActiveId(newActiveId);
      }
      
      // Select the first remaining event for editing
      setSelectedEventId(remainingEvents[0].id);

      onSaveState({
        events: remainingEvents,
        activeEventId: newActiveId
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md transition-opacity duration-300">
      
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-6xl glass-card rounded-3xl border border-white/10 shadow-2xl p-8 h-[85vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Manage Deadlines
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

        {/* Dual Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
          
          {/* Left Column: Deadlines List */}
          <div className="md:col-span-1 flex flex-col h-full min-h-0 border-r border-white/5 pr-4">
            <div className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">
              Your Deadlines ({events.length})
            </div>

            {/* List Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 no-scrollbar">
              {events.map((ev) => {
                const isActive = ev.id === activeId;
                const isSelected = ev.id === selectedEventId;
                const dateStr = new Date(ev.targetDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => setSelectedEventId(ev.id)}
                    data-nav="true"
                    className={`w-full flex flex-col text-left p-3.5 rounded-xl border transition-all duration-200 focus:outline-none ${
                      isSelected 
                        ? 'bg-blue-600/20 border-blue-500 text-white tv-focused ring-1 ring-blue-500' 
                        : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold truncate max-w-[80%] text-sm">{ev.title}</span>
                      {isActive && (
                        <span className="flex items-center space-x-0.5 px-2 py-0.5 rounded-full bg-green-500/25 border border-green-500/20 text-[9px] font-bold text-green-400 tracking-wider uppercase">
                          <Check className="w-2.5 h-2.5 mr-0.5" /> Active
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 mt-1 font-mono">{dateStr}</span>
                  </button>
                );
              })}
            </div>

            {/* Add New Button */}
            <button
              type="button"
              onClick={handleAddNewEvent}
              data-nav="true"
              className="mt-4 flex items-center justify-center space-x-2 w-full py-3 rounded-xl border border-dashed border-white/20 text-gray-300 hover:border-blue-500/50 hover:text-white glass-card-hover focus:outline-none transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wider">Add Deadline</span>
            </button>
          </div>

          {/* Right Column: Edit Form */}
          <div className="md:col-span-2 flex flex-col h-full min-h-0 overflow-y-auto no-scrollbar">
            <div className="text-xs font-bold tracking-widest text-blue-400 uppercase mb-3">
              Edit Selected Deadline Details
            </div>

            <form onSubmit={handleSaveSelectedEvent} className="space-y-4 flex-1">
              {/* Event Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                  Event / Celebration Name
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  data-nav="true"
                  placeholder="e.g. My New Deadline..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none tv-input-focus transition-all duration-200 text-sm"
                />
              </div>

              {/* Date Config (Year, Month, Day) */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">Year</label>
                  <input
                    type="number"
                    min="2026"
                    max="2100"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    data-nav="true"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none tv-input-focus transition-all duration-200 text-center text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">Month (1-12)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    data-nav="true"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none tv-input-focus transition-all duration-200 text-center text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">Day (1-31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    data-nav="true"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none tv-input-focus transition-all duration-200 text-center text-sm"
                  />
                </div>
              </div>

              {/* Time Config (Hour, Minute, Second) */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">Hour (0-23)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={hour}
                    onChange={(e) => setHour(e.target.value)}
                    data-nav="true"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none tv-input-focus transition-all duration-200 text-center text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">Minute (0-59)</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minute}
                    onChange={(e) => setMinute(e.target.value)}
                    data-nav="true"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none tv-input-focus transition-all duration-200 text-center text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">Second (0-59)</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={second}
                    onChange={(e) => setSecond(e.target.value)}
                    data-nav="true"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none tv-input-focus transition-all duration-200 text-center text-sm"
                  />
                </div>
              </div>

              {/* Background visuals (image & video) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-widest text-gray-400 uppercase flex items-center space-x-1.5">
                    <Image className="w-3.5 h-3.5 text-gray-400" />
                    <span>BG Image URL (Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={bgImage}
                    onChange={(e) => setBgImage(e.target.value)}
                    data-nav="true"
                    placeholder="https://example.com/bg.jpg"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none tv-input-focus transition-all duration-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-widest text-gray-400 uppercase flex items-center space-x-1.5">
                    <Video className="w-3.5 h-3.5 text-gray-400" />
                    <span>BG Video URL (Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={bgVideo}
                    onChange={(e) => setBgVideo(e.target.value)}
                    data-nav="true"
                    placeholder="https://example.com/loop.mp4"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none tv-input-focus transition-all duration-200"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
                
                {/* Delete button on the left */}
                <button
                  type="button"
                  onClick={handleDeleteSelectedEvent}
                  disabled={events.length <= 1}
                  data-nav="true"
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/10 disabled:opacity-40 disabled:pointer-events-none focus:outline-none tv-button-reset-focus transition-all duration-200 text-xs font-bold uppercase"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>

                {/* Save and Active buttons on the right */}
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleSetActiveEvent}
                    disabled={selectedEventId === activeId}
                    data-nav="true"
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white disabled:opacity-50 disabled:pointer-events-none glass-card-hover focus:outline-none transition-all duration-200 text-xs font-bold uppercase"
                  >
                    Set Active
                  </button>

                  <button
                    type="submit"
                    data-nav="true"
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 border border-blue-500 text-white hover:bg-blue-700 focus:outline-none tv-button-focus transition-all duration-200 text-xs font-bold uppercase shadow-lg"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
