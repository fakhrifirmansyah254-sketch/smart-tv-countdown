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

// Interface for Countdown Event data
interface CountdownEvent {
  title: string;
  targetDate: string; // ISO string or parsable date string
  backgroundImageUrl?: string;
  backgroundVideoUrl?: string;
}

// Default countdown target (e.g., 2027 New Year)
const DEFAULT_EVENT: CountdownEvent = {
  title: "Next New Year's Celebration",
  targetDate: new Date(new Date().getFullYear() + 1, 0, 1, 0, 0, 0).toISOString(),
  backgroundImageUrl: "",
  backgroundVideoUrl: ""
};

// Helper function to read the event data
const readEventData = (): CountdownEvent => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(fileContent);
    }
  } catch (error) {
    console.error("Error reading data file, using default:", error);
  }
  return DEFAULT_EVENT;
};

// Helper function to write the event data
const writeEventData = (data: CountdownEvent): boolean => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error("Error writing data file:", error);
    return false;
  }
};

// GET current event
app.get('/api/event', (req: Request, res: Response) => {
  const data = readEventData();
  res.json(data);
});

// POST save event
app.post('/api/event', (req: Request, res: Response) => {
  const { title, targetDate, backgroundImageUrl, backgroundVideoUrl } = req.body;

  if (!title || !targetDate) {
    return res.status(400).json({ error: "Missing required fields: title and targetDate" });
  }

  // Validate targetDate is a valid date
  const parsedDate = new Date(targetDate);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ error: "Invalid targetDate format. Must be a valid date string" });
  }

  const updatedData: CountdownEvent = {
    title: String(title).trim(),
    targetDate: parsedDate.toISOString(),
    backgroundImageUrl: backgroundImageUrl ? String(backgroundImageUrl).trim() : "",
    backgroundVideoUrl: backgroundVideoUrl ? String(backgroundVideoUrl).trim() : ""
  };

  const success = writeEventData(updatedData);
  if (success) {
    res.json({ message: "Event saved successfully", data: updatedData });
  } else {
    res.status(500).json({ error: "Failed to save event details to disk" });
  }
});

// POST reset event to default
app.post('/api/event/reset', (req: Request, res: Response) => {
  const success = writeEventData(DEFAULT_EVENT);
  if (success) {
    res.json({ message: "Event reset to default successfully", data: DEFAULT_EVENT });
  } else {
    res.status(500).json({ error: "Failed to reset event details" });
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
