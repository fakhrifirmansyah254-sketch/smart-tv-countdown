import React from 'react';

interface TimeUnitProps {
  value: number | string;
  label: string;
}

export const TimeUnit: React.FC<TimeUnitProps> = ({ value, label }) => {
  // Format to string pad if number
  const formattedValue = typeof value === 'number' ? value.toString().padStart(2, '0') : value;

  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-8 rounded-3xl glass-card border border-white/15 shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Decorative top lighting glow */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Huge Display Unit Digit */}
      <span className="text-[7vw] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-400 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] font-sans">
        {formattedValue}
      </span>

      {/* Label Subtext */}
      <span className="text-sm md:text-base font-bold tracking-[0.25em] text-blue-400 uppercase mt-2 opacity-90">
        {label}
      </span>

      {/* Underlay glow */}
      <div className="absolute -bottom-6 w-16 h-4 bg-blue-500/10 filter blur-xl rounded-full" />
    </div>
  );
};
