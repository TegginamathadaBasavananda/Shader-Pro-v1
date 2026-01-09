S


import React from 'react';
import { X, Globe, User, Heart, Github, Twitter } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300">
        <div className="absolute top-0 right-0 p-4 z-10">
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 pb-6 text-center">
          <div className="w-16 h-16 bg-gray-900 dark:bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-200 dark:shadow-none rotate-3 hover:rotate-6 transition-all duration-300">
             <span className="text-white dark:text-gray-900 font-bold text-3xl select-none">S</span>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Shader Pro</h2>
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6">v1</p>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-8 font-medium">
            A professional styling studio for your product assets. Apply gorgeous glassmorphism and lighting effects in seconds.
          </p>

          <div className="border-t border-dashed border-gray-200 dark:border-gray-800 pt-6 space-y-5">
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Designed & Developed by</span>
              <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold text-sm">
                <User className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                <span>Matthew Robert Wesney</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <a 
                href="https://matt-wesney.github.io/website/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full p-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 group"
              >
                <Globe className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors" />
                <span>dovvnloading.github.io</span>
              </a>
              
              <div className="grid grid-cols-2 gap-2">
                <a 
                  href="https://github.com/dovvnloading" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full p-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 group"
                >
                  <Github className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                  <span>Github</span>
                </a>
                
                <a 
                  href="https://x.com/D3VAUX" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full p-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 group"
                >
                  <Twitter className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-sky-500 transition-colors" />
                  <span>X (Twitter)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 text-center border-t border-gray-100 dark:border-gray-800">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium flex items-center justify-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> & React
          </p>
        </div>
      </div>
    </div>
  );
};
