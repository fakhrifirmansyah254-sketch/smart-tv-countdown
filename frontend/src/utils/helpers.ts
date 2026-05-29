/**
 * Smart TV Countdown helper functions
 */

// Interface for Countdown Event data
export interface CountdownEvent {
  title: string;
  targetDate: string; // ISO string
  backgroundImageUrl?: string;
  backgroundVideoUrl?: string;
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

// Default countdown target (e.g. New Year of next year)
export const getDefaultEvent = (): CountdownEvent => {
  const nextYear = new Date().getFullYear() + 1;
  const newYear = new Date(nextYear, 0, 1, 0, 0, 0);
  return {
    title: "New Year's Eve Countdown",
    targetDate: newYear.toISOString(),
    backgroundImageUrl: "",
    backgroundVideoUrl: ""
  };
};

// Fetch event config from API with LocalStorage fallback
export const fetchEventConfig = async (): Promise<CountdownEvent> => {
  try {
    const response = await fetch('/api/event');
    if (response.ok) {
      const data = await response.json();
      // Cache in localStorage as backup
      localStorage.setItem('tv_countdown_event', JSON.stringify(data));
      return data;
    }
  } catch (error) {
    console.warn("Backend API not reachable. Falling back to cached local storage:", error);
  }

  // Fallback to LocalStorage cache
  const cached = localStorage.getItem('tv_countdown_event');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error("Error parsing cached event data:", e);
    }
  }

  // Fallback to standard default event
  const defaultEvent = getDefaultEvent();
  localStorage.setItem('tv_countdown_event', JSON.stringify(defaultEvent));
  return defaultEvent;
};

// Save event config to API with LocalStorage replication
export const saveEventConfig = async (event: CountdownEvent): Promise<boolean> => {
  // Sync to local storage immediately
  localStorage.setItem('tv_countdown_event', JSON.stringify(event));

  try {
    const response = await fetch('/api/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (response.ok) {
      console.log('Event synced to server successfully');
      return true;
    }
  } catch (error) {
    console.warn('Could not sync event to server backend, saved locally in browser:', error);
  }
  return false;
};

// Reset event config
export const resetEventConfig = async (): Promise<CountdownEvent> => {
  const defaultEvent = getDefaultEvent();
  localStorage.setItem('tv_countdown_event', JSON.stringify(defaultEvent));

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
  return defaultEvent;
};
