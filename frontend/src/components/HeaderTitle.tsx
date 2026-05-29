import React, { useState, useEffect } from 'react';
import { Clock, Tv } from 'lucide-react';

interface HeaderTitleProps {
  title: string;
  isFinished: boolean;
}

export const HeaderTitle: React.FC<HeaderTitleProps> = ({ title, isFinished }) => {
  const [localTime, setLocalTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLocalTime(
        now.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex items-center justify-between border-b border-white/5 pb-4 mb-8">
      {/* Event Details */}
      <div className="flex items-center space-x-4">
        <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
          <Tv className="w-6 h-6 animate-pulse-slow" />
        </div>
        <div>
          <span className="text-xs font-semibold tracking-widest text-blue-400 uppercase">
            LIVE EVENT COUNTDOWN
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5">
            {title || "Event Countdown"}
          </h1>
        </div>
      </div>

      {/* Clock / Status Indicator */}
      <div className="flex items-center space-x-6">
        {/* Live Status Tag */}
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <span className={`w-2 h-2 rounded-full ${isFinished ? 'bg-red-500' : 'bg-green-500 animate-ping'}`} />
          <span className="text-xs font-medium text-gray-300">
            {isFinished ? 'Ended' : 'Active'}
          </span>
        </div>

        {/* Local Digital Clock */}
        <div className="flex items-center space-x-2 text-gray-300">
          <Clock className="w-5 h-5 text-gray-400" />
          <span className="font-mono text-lg font-medium tracking-wider">
            {localTime || '00:00:00'}
          </span>
        </div>
      </div>
    </div>
  );
};
