import React, { useRef, useState, useEffect } from 'react';

interface PositionPadProps {
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
  max?: number; // Maximum range (e.g. 100 means -100 to 100)
}

export const PositionPad: React.FC<PositionPadProps> = ({ x, y, onChange, max = 100 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Map value to percentage (0-100) for logic
  const getPercentage = (val: number) => {
    return ((val + max) / (max * 2)) * 100;
  };

  // Clamp percentage for VISUAL display only
  // This ensures the dot never leaves the box, even if values exceed max
  const getVisualPercentage = (val: number) => {
    const pct = getPercentage(val);
    return Math.max(0, Math.min(100, pct));
  };

  const updatePosition = (e: React.PointerEvent | PointerEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate relative position 0..1
    let relX = (e.clientX - rect.left) / rect.width;
    let relY = (e.clientY - rect.top) / rect.height;
    
    // Clamp input to the box
    relX = Math.max(0, Math.min(1, relX));
    relY = Math.max(0, Math.min(1, relY));
    
    // Convert to value range
    const newX = Math.round((relX * max * 2) - max);
    const newY = Math.round((relY * max * 2) - max);
    
    onChange(newX, newY);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updatePosition(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      updatePosition(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Check if values are out of visual bounds to show a warning style
  const isOutOfBounds = Math.abs(x) > max || Math.abs(y) > max;

  return (
    <div className="group select-none">
      <div className="flex justify-between items-end mb-2">
        <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Position</label>
        <div className={`flex items-center gap-2 text-[11px] font-mono tabular-nums transition-colors ${isOutOfBounds ? 'text-blue-500 dark:text-blue-400 font-bold' : 'text-gray-900 dark:text-gray-200 opacity-60 group-hover:opacity-100'}`}>
           <span>X: {Math.round(x)}</span>
           <span>Y: {Math.round(y)}</span>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="relative w-full aspect-square bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-crosshair touch-none overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 shadow-sm transition-colors"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Cartesian Grid Background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 dark:opacity-20" width="100%" height="100%">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-400 dark:text-gray-500"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Center Axis Lines */}
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-blue-500/20 dark:bg-blue-400/20 pointer-events-none" />
        <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-blue-500/20 dark:bg-blue-400/20 pointer-events-none" />

        {/* Active Connector Line (from center to point) */}
        <div className="absolute top-1/2 left-1/2 w-0.5 h-0.5 bg-blue-500 dark:bg-blue-400 rounded-full opacity-50" />
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <line 
                x1="50%" 
                y1="50%" 
                x2={`${getVisualPercentage(x)}%`} 
                y2={`${getVisualPercentage(y)}%`} 
                stroke="currentColor" 
                strokeWidth="1.5"
                className="text-blue-500/30 dark:text-blue-400/30"
                strokeDasharray="2 2"
            />
        </svg>
        
        {/* Handle */}
        <div 
          className={`absolute w-3.5 h-3.5 rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.2)] border-[1.5px] transform -translate-x-1/2 -translate-y-1/2 transition-transform active:scale-125 ${isOutOfBounds ? 'bg-blue-500 border-white dark:border-gray-900' : 'bg-white dark:bg-gray-200 border-blue-500 dark:border-blue-400'}`}
          style={{ 
            left: `${getVisualPercentage(x)}%`, 
            top: `${getVisualPercentage(y)}%`,
          }}
        >
          {isOutOfBounds && (
             <div className="absolute -inset-2 rounded-full border border-blue-500/30 animate-ping pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
};