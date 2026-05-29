import React from 'react';
import { TimeUnit } from './TimeUnit';

interface CountdownCardProps {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isFinished: boolean;
}

export const CountdownCard: React.FC<CountdownCardProps> = ({
  days,
  hours,
  minutes,
  seconds,
  isFinished
}) => {
  if (isFinished) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12 px-6 rounded-3xl glass-card border border-red-500/20 shadow-2xl relative overflow-hidden text-center animate-pulse-slow">
        {/* Glowing border effect */}
        <div className="absolute inset-0 border border-red-500/30 rounded-3xl pointer-events-none" />
        
        <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-4">
          EVENT COMPLETED!
        </h2>
        <p className="text-lg md:text-xl font-medium text-gray-400 max-w-xl">
          The countdown target date has arrived. You can configure a new countdown from the settings menu.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-4 gap-[2vw]">
      <TimeUnit value={days} label="Days" />
      <TimeUnit value={hours} label="Hours" />
      <TimeUnit value={minutes} label="Minutes" />
      <TimeUnit value={seconds} label="Seconds" />
    </div>
  );
};
