import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  unit?: string;
}

export const Slider: React.FC<SliderProps> = ({ label, value, min, max, step = 1, onChange, unit = '' }) => {
  // Calculate percentage for gradient track
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="group">
      <div className="flex justify-between items-end mb-2">
        <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</label>
        <span className="text-[11px] font-mono text-gray-900 dark:text-gray-200 tabular-nums opacity-60 group-hover:opacity-100 transition-opacity">
          {Math.round(value * 100) / 100}{unit}
        </span>
      </div>
      <div className="relative w-full h-5 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute z-10 w-full h-full opacity-0 cursor-ew-resize touch-none"
        />
        <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden pointer-events-none">
          <div 
            className="h-full bg-gray-800 dark:bg-gray-200" 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div 
          className="absolute h-3 w-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-500 shadow-sm rounded-full pointer-events-none"
          style={{ left: `calc(${percentage}% - 6px)` }}
        />
      </div>
    </div>
  );
};