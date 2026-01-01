import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
  opacity?: number;
  onOpacityChange?: (opacity: number) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, color, onChange, opacity, onOpacityChange }) => {
  const handleOpacityChange = (val: number) => {
    if (onOpacityChange) {
      // Clamp between 0 and 1, ensure precision
      const clamped = Math.min(1, Math.max(0, val));
      onOpacityChange(Number(clamped.toFixed(2)));
    }
  };

  return (
    <div>
      <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">{label}</label>
      <div className="flex items-center gap-2 p-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg group hover:border-gray-300 dark:hover:border-gray-600">
        <div className="relative w-6 h-6 rounded-md shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden flex-shrink-0">
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: color }}
          />
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -inset-4 w-[200%] h-[200%] opacity-0 cursor-pointer"
          />
        </div>
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 bg-transparent text-xs font-mono text-gray-700 dark:text-gray-300 outline-none uppercase"
        />
        {onOpacityChange && opacity !== undefined && (
          <div className="flex items-center gap-1 pl-2 border-l border-gray-200 dark:border-gray-700 flex-shrink-0">
             <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium select-none">OP</span>
             <div className="flex items-center">
               <input
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                className="w-8 text-xs font-mono bg-transparent outline-none text-right focus:text-gray-900 dark:focus:text-gray-100 text-gray-700 dark:text-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="flex flex-col ml-0.5">
                <button 
                  type="button"
                  onClick={() => handleOpacityChange(opacity + 0.05)}
                  className="flex items-center justify-center w-3 h-2 text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-[1px]"
                >
                  <ChevronUp className="w-2 h-2" />
                </button>
                <button 
                  type="button"
                  onClick={() => handleOpacityChange(opacity - 0.05)}
                  className="flex items-center justify-center w-3 h-2 text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-[1px]"
                >
                  <ChevronDown className="w-2 h-2" />
                </button>
              </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};