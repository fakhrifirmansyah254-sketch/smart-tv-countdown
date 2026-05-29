/**
 * Smart TV Countdown helper functions - Multiple Deadlines Support
 */

export interface CountdownEvent {
  id: string;
  title: string;
  targetDate: string; // ISO string
  backgroundImageUrl?: string;
  backgroundVideoUrl?: string;
}

export interface CountdownState {
  events: CountdownEvent[];
  activeEventId: string;
}

// Request and maintain a Screen Wake Lock to prevent the Smart TV from sleeping
let wakeLock: any = null;

export const requestWakeLock = async (): Promise<boolean> => {
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await (navigator as any).wakeLock.request('screen');
      console.log('Screen Wake Lock acquired successfully');
      
      // Re-acquire wake lock when page becomes visible again
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return true;
    } catch (err: any) {
      console.warn(`Screen Wake Lock failed: ${err.name}, ${err.message}`);
      return false;
    }
  } else {
    console.warn('Wake Lock API is not supported in this browser/TV WebView');
    return false;
  }
};

export const releaseWakeLock = async (): Promise<void> => {
  if (wakeLock) {
    try {
      await wakeLock.release();
      wakeLock = null;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      console.log('Screen Wake Lock released');
    } catch (err) {
      console.error('Error releasing screen wake lock:', err);
    }
  }
};

const handleVisibilityChange = async () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    await requestWakeLock();
  }
};

// Formats a number with leading zeros (e.g. 9 -> "09")
export const formatTimeNumber = (num: number): string => {
  return num.toString().padStart(2, '0');
};

// Default countdown state (e.g. New Year of next year)
export const getDefaultState = (): CountdownState => {
  const nextYear = new Date().getFullYear() + 1;
  const newYear = new Date(nextYear, 0, 1, 0, 0, 0);
  const defaultEvent: CountdownEvent = {
    id: "default-newyear",
    title: "New Year's Eve Countdown",
    targetDate: newYear.toISOString(),
    backgroundImageUrl: "",
    backgroundVideoUrl: ""
  };
  return {
    events: [defaultEvent],
    activeEventId: defaultEvent.id
  };
};

// Fetch countdown state from API with LocalStorage fallback
export const fetchCountdownState = async (): Promise<CountdownState> => {
  try {
    const response = await fetch('/api/event');
    if (response.ok) {
      const data = await response.json();
      
      // Handle legacy single-event structure migrations if cached locally
      const migrated = migrateLegacyState(data);
      
      // Cache in localStorage as backup
      localStorage.setItem('tv_countdown_state', JSON.stringify(migrated));
      return migrated;
    }
  } catch (error) {
    console.warn("Backend API not reachable. Falling back to cached local storage:", error);
  }

  // Fallback to LocalStorage cache
  const cached = localStorage.getItem('tv_countdown_state');
  if (cached) {
    try {
      return migrateLegacyState(JSON.parse(cached));
    } catch (e) {
      console.error("Error parsing cached event data:", e);
    }
  }

  // Fallback to standard default event state
  const defaultState = getDefaultState();
  localStorage.setItem('tv_countdown_state', JSON.stringify(defaultState));
  return defaultState;
};

// Helper function to migrate legacy single-event config if encountered
const migrateLegacyState = (data: any): CountdownState => {
  if (data && typeof data === 'object' && !data.events) {
    const migratedEvent: CountdownEvent = {
      id: "migrated-legacy-event",
      title: data.title || "My Countdown Event",
      targetDate: data.targetDate || new Date().toISOString(),
      backgroundImageUrl: data.backgroundImageUrl || "",
      backgroundVideoUrl: data.backgroundVideoUrl || ""
    };
    return {
      events: [migratedEvent],
      activeEventId: migratedEvent.id
    };
  }
  return data as CountdownState;
};

// Save countdown state to API with LocalStorage replication
export const saveCountdownState = async (state: CountdownState): Promise<boolean> => {
  // Sync to local storage immediately
  localStorage.setItem('tv_countdown_state', JSON.stringify(state));

  try {
    const response = await fetch('/api/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state),
    });

    if (response.ok) {
      console.log('Countdown state synced to server successfully');
      return true;
    }
  } catch (error) {
    console.warn('Could not sync state to server backend, saved locally in browser:', error);
  }
  return false;
};

// Reset countdown state
export const resetCountdownState = async (): Promise<CountdownState> => {
  const defaultState = getDefaultState();
  localStorage.setItem('tv_countdown_state', JSON.stringify(defaultState));

  try {
    const response = await fetch('/api/event/reset', {
      method: 'POST'
    });
    if (response.ok) {
      const result = await response.json();
      return result.data;
    }
  } catch (error) {
    console.warn('Could not reset server backend, reset applied locally in browser:', error);
  }
  return defaultState;
};
