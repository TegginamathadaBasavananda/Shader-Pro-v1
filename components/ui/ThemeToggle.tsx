import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  toggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, toggle }) => {
  return (
    <button
      onClick={toggle}
      className={`
        relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
        ${isDark ? 'bg-gray-700' : 'bg-gray-200'}
      `}
      aria-label="Toggle Dark Mode"
    >
      <span className="sr-only">Toggle Dark Mode</span>
      <div
        className={`
          absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center transition-transform duration-200 ease-out
          ${isDark ? 'translate-x-4' : 'translate-x-0'}
        `}
      >
        {isDark ? (
          <Moon className="w-2.5 h-2.5 text-gray-800" />
        ) : (
          <Sun className="w-2.5 h-2.5 text-gray-800" />
        )}
      </div>
    </button>
  );
};