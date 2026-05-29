import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const DATA_FILE = path.join(__dirname, '..', 'data.json');

app.use(cors({
  origin: '*', // Allow all origins for TV environments
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Interfaces for multiple deadlines
interface CountdownEvent {
  id: string;
  title: string;
  targetDate: string; // ISO string
  backgroundImageUrl?: string;
  backgroundVideoUrl?: string;
}

interface CountdownState {
  events: CountdownEvent[];
  activeEventId: string;
}

// Default initial state
const getDefaultState = (): CountdownState => {
  const defaultEvent: CountdownEvent = {
    id: "default-newyear",
    title: "Next New Year's Celebration",
    targetDate: new Date(new Date().getFullYear() + 1, 0, 1, 0, 0, 0).toISOString(),
    backgroundImageUrl: "",
    backgroundVideoUrl: ""
  };
  return {
    events: [defaultEvent],
    activeEventId: defaultEvent.id
  };
};

// Helper function to read data and perform migrations if necessary
const readData = (): CountdownState => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(fileContent);
      
      // Migration check: if old data format (single event, object without "events" array)
      if (parsed && typeof parsed === 'object' && !parsed.events) {
        console.log("Migrating legacy single-event data format to multi-event array...");
        const migratedEvent: CountdownEvent = {
          id: "migrated-legacy-event",
          title: parsed.title || "My Countdown Event",
          targetDate: parsed.targetDate || new Date().toISOString(),
          backgroundImageUrl: parsed.backgroundImageUrl || "",
          backgroundVideoUrl: parsed.backgroundVideoUrl || ""
        };
        const migratedState = {
          events: [migratedEvent],
          activeEventId: migratedEvent.id
        };
        // Save the migrated state immediately
        fs.writeFileSync(DATA_FILE, JSON.stringify(migratedState, null, 2), 'utf-8');
        return migratedState;
      }
      
      return parsed;
    }
  } catch (error) {
    console.error("Error reading data file, using default state:", error);
  }
  return getDefaultState();
};

// Helper function to write data
const writeData = (data: CountdownState): boolean => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error("Error writing data file:", error);
    return false;
  }
};

// GET current countdown state (list of events + active id)
app.get('/api/event', (req: Request, res: Response) => {
  const data = readData();
  res.json(data);
});

// POST save full countdown state
app.post('/api/event', (req: Request, res: Response) => {
  const { events, activeEventId } = req.body;

  if (!events || !Array.isArray(events) || !activeEventId) {
    return res.status(400).json({ error: "Invalid state format: missing events array or activeEventId" });
  }

  // Double check elements validation
  const validatedEvents = events.map((ev: any) => ({
    id: String(ev.id || Math.random().toString(36).substring(2, 9)),
    title: String(ev.title || "Unnamed Event").trim(),
    targetDate: new Date(ev.targetDate).toISOString(),
    backgroundImageUrl: ev.backgroundImageUrl ? String(ev.backgroundImageUrl).trim() : "",
    backgroundVideoUrl: ev.backgroundVideoUrl ? String(ev.backgroundVideoUrl).trim() : ""
  }));

  const updatedState: CountdownState = {
    events: validatedEvents,
    activeEventId: String(activeEventId)
  };

  const success = writeData(updatedState);
  if (success) {
    res.json({ message: "Countdown state saved successfully", data: updatedState });
  } else {
    res.status(500).json({ error: "Failed to save state to disk" });
  }
});

// POST reset event to default
app.post('/api/event/reset', (req: Request, res: Response) => {
  const defaultState = getDefaultState();
  const success = writeData(defaultState);
  if (success) {
    res.json({ message: "Countdown state reset successfully", data: defaultState });
  } else {
    res.status(500).json({ error: "Failed to reset settings" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  Smart TV Countdown Backend Running`);
  console.log(`  Port: ${PORT}`);
  console.log(`  Data Storage: ${DATA_FILE}`);
  console.log(`=========================================`);
});
