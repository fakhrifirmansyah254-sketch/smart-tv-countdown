import { useState, useEffect, useRef } from 'react';

export interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isFinished: boolean;
}

const calculateTimeRemaining = (targetDateString: string): TimeParts => {
  const difference = +new Date(targetDateString) - +new Date();
  
  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isFinished: true
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isFinished: false
  };
};

export const useCountdown = (targetDate: string): TimeParts => {
  const [timeLeft, setTimeLeft] = useState<TimeParts>(() => calculateTimeRemaining(targetDate));
  const targetRef = useRef(targetDate);

  // Sync ref when targetDate changes
  useEffect(() => {
    targetRef.current = targetDate;
    setTimeLeft(calculateTimeRemaining(targetDate));
  }, [targetDate]);

  useEffect(() => {
    // Zero lag: immediately sync with current timing first
    setTimeLeft(calculateTimeRemaining(targetRef.current));

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(targetRef.current));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return timeLeft;
};
