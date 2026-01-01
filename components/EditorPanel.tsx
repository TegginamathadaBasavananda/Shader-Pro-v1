
import React, { useState } from 'react';
import { StudioState, StylePreset, ShadowConfig, AspectRatioPreset } from '../types';
import { Slider } from './ui/Slider';
import { ColorPicker } from './ui/ColorPicker';
import { PositionPad } from './ui/PositionPad';
import { ThemeToggle } from './ui/ThemeToggle';
import { Download, Upload, ChevronDown, ChevronRight, Zap, Layers, Frame, Sun, Sparkles, Box, Power, Info, Package, Square, Scissors, RectangleHorizontal, RectangleVertical, Monitor, Smartphone, Minimize, Expand } from 'lucide-react';

interface EditorPanelProps {
  state: StudioState;
  onChange: (newState: StudioState) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  applyPreset: (preset: StylePreset) => void;
  isExporting: boolean;
  exportProgress: { current: number, total: number } | null;
  onShowInfo: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  imageCount: number;
  hasActiveImage: boolean;
}

// Collapsible Section Component
const Section = ({ title, icon: Icon, children, defaultOpen = false }: { title: string, icon: any, children?: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 group"
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-md ${isOpen ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
      </button>
      {isOpen && <div className="p-4 pt-1 space-y-6">{children}</div>}
    </div>
  );
};

// Reusable Shadow Layer Control
const ShadowLayerControl = ({ 
  label, 
  config, 
  onChange,
  isCutoutMode
}: { 
  label: string; 
  config: ShadowConfig; 
  onChange: (newConfig: ShadowConfig) => void;
  isCutoutMode: boolean;
}) => {
  
  const toggleEnabled = () => onChange({ ...config, enabled: !config.enabled });

  return (
    <div className={`rounded-xl border ${config.enabled ? 'bg-gray-50/50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 shadow-sm' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-70'}`}>
      <div className="p-3 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between bg-white dark:bg-gray-800/50 rounded-t-xl">
        <div className="flex items-center gap-2">
           <button 
             onClick={toggleEnabled}
             className={`w-4 h-4 rounded flex items-center justify-center ${config.enabled ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}
           >
             <Power className="w-2.5 h-2.5" />
           </button>
           <span className={`text-[11px] font-bold uppercase tracking-wider ${config.enabled ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>{label}</span>
        </div>
        
        {config.enabled && !isCutoutMode && (
          <div className="flex items-center gap-2">
            <label className="text-[10px] uppercase font-semibold text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300" htmlFor={`inset-${label}`}>Inset</label>
             <input 
              type="checkbox" 
              id={`inset-${label}`}
              checked={config.inset} 
              onChange={(e) => onChange({ ...config, inset: e.target.checked })}
              className="w-3.5 h-3.5 rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-gray-900 dark:focus:ring-white cursor-pointer"
            />
          </div>
        )}
      </div>

      {config.enabled && (
        <div className="p-3 space-y-4">
           <div className="flex gap-4">
             {/* Left Col: Position Pad - Fixed width to match visual rhythm */}
             <div className="w-[84px] shrink-0">
               <PositionPad 
                 x={config.x} 
                 y={config.y} 
                 max={200}
                 onChange={(x, y) => onChange({ ...config, x, y })}
               />
             </div>

             {/* Right Col: Sliders */}
             <div className="flex-1 space-y-4">
                <Slider label="Blur" value={config.blur} min={0} max={200} onChange={(v) => onChange({ ...config, blur: v })} />
                {!isCutoutMode && (
                  <Slider label="Spread" value={config.spread} min={-50} max={50} onChange={(v) => onChange({ ...config, spread: v })} />
                )}
             </div>
           </div>

           {/* Bottom Row: Color Picker - Full width for better usability */}
           <div className="pt-1">
              <ColorPicker 
                  label="Color" 
                  color={config.color} 
                  onChange={(c) => onChange({ ...config, color: c })}
                  opacity={config.opacity}
                  onOpacityChange={(o) => onChange({ ...config, opacity: o })}
                />
           </div>
        </div>
      )}
    </div>
  );
};

const RATIO_PRESETS: { id: AspectRatioPreset; label: string; ratioW: number; ratioH: number; icon: any }[] = [
  { id: '1:1', label: '1:1', ratioW: 1, ratioH: 1, icon: Square },
  { id: '2:3', label: '2:3', ratioW: 2, ratioH: 3, icon: RectangleVertical },
  { id: '3:2', label: '3:2', ratioW: 3, ratioH: 2, icon: RectangleHorizontal },
  { id: '16:9', label: '16:9', ratioW: 16, ratioH: 9, icon: Monitor },
  { id: '9:16', label: '9:16', ratioW: 9, ratioH: 16, icon: Smartphone },
  { id: '4:5', label: '4:5', ratioW: 4, ratioH: 5, icon: RectangleVertical },
];

export const EditorPanel: React.FC<EditorPanelProps> = ({ 
  state, 
  onChange, 
  onImageUpload, 
  onExport, 
  applyPreset, 
  isExporting, 
  exportProgress,
  onShowInfo,
  isDarkMode,
  toggleTheme,
  imageCount,
  hasActiveImage
}) => {

  const updateBorder = (key: string, val: any) => {
    onChange({ ...state, border: { ...state.border, [key]: val } });
  };

  const isCutout = state.mode === 'cutout';

  const handleRatioChange = (preset: typeof RATIO_PRESETS[0]) => {
     // Smart Resize: Preserve the largest dimension of the current frame to maintain quality
     const currentMax = Math.max(state.frameWidth, state.frameHeight);
     // Default baseline if 0 (shouldn't happen)
     const baseline = currentMax || 1080;
     
     let newW, newH;

     // Logic: Keep the largest dimension as the anchor for the new ratio's largest dimension
     // This ensures we don't downscale unnecessarily.
     if (preset.ratioW >= preset.ratioH) {
         // Landscape or Square
         newW = baseline;
         newH = Math.round(baseline * (preset.ratioH / preset.ratioW));
     } else {
         // Portrait
         newH = baseline;
         newW = Math.round(baseline * (preset.ratioW / preset.ratioH));
     }

     onChange({ 
        ...state, 
        frameWidth: newW, 
        frameHeight: newH, 
        aspectRatio: preset.id 
     });
  };

  return (
    <>
      {/* Header */}
      <div className="flex-shrink-0 h-16 px-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 z-20">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-bold">S</div>
           <div>
             <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-none">Shader Pro</h1>
             <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider mt-0.5">v1</p>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <ThemeToggle isDark={isDarkMode} toggle={toggleTheme} />
           <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-800 mx-1"></div>
           
           {/* Upload Button */}
           <label className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer relative" title="Upload Images">
             <Upload className="w-4 h-4" />
             <input type="file" className="hidden" accept="image/*" multiple onChange={onImageUpload} />
             {imageCount > 0 && (
               <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-blue-500 text-[8px] font-bold text-white ring-1 ring-white dark:ring-gray-900">
                 {imageCount > 9 ? '9+' : imageCount}
               </span>
             )}
           </label>

           <button 
             onClick={onExport} 
             disabled={isExporting}
             className={`flex items-center justify-center gap-2 h-8 px-4 rounded-lg bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-black text-xs font-bold tracking-wide shadow-sm active:scale-95 disabled:opacity-50 transition-all ${imageCount > 1 ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:text-white' : ''}`}
           >
             {isExporting ? (
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                 {exportProgress ? <span>{Math.round((exportProgress.current / exportProgress.total) * 100)}%</span> : null}
               </div>
             ) : (
               <>
                 {imageCount > 1 ? <Package className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                 {imageCount > 1 ? `ALL (${imageCount})` : 'EXPORT'}
               </>
             )}
           </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-white dark:bg-gray-900">
        
        {/* Presets Grid */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2 mb-3 text-gray-400 dark:text-gray-500">
            <Sparkles className="w-3 h-3" />
            <label className="text-[10px] font-bold uppercase tracking-widest">Quick Styles</label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { 
                id: StylePreset.Clean, 
                label: 'Clean', 
                previewClass: 'bg-white border border-gray-200 shadow-sm'
              },
              { 
                id: StylePreset.Dark, 
                label: 'Dark', 
                previewClass: 'bg-zinc-800 border border-zinc-700 shadow-lg' 
              },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className={`w-full aspect-square rounded-lg group-hover:scale-105 group-hover:shadow-md ${preset.previewClass}`}></div>
                <span className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-300 uppercase tracking-wide">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Groups */}
        <div>
          
          <Section title="Canvas & Frame" icon={Frame} defaultOpen={true}>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50 space-y-4">
              
              {/* Aspect Ratio Selector */}
              <div>
                <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-2 block">Templates / Aspect Ratio</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {RATIO_PRESETS.map((preset) => {
                    const isActive = state.aspectRatio === preset.id;
                    const Icon = preset.icon;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleRatioChange(preset)}
                        className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg border transition-all ${
                          isActive 
                            ? 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-500/10' 
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                         <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                         <span className="text-[9px] font-bold uppercase">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1 border-t border-dashed border-gray-200 dark:border-gray-700/50">
                <div className="flex-1">
                  <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1.5 block">Width (px)</label>
                  <input
                    type="number"
                    value={state.frameWidth}
                    onChange={(e) => onChange({ ...state, frameWidth: parseInt(e.target.value) || 0, aspectRatio: 'custom' })}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2 text-xs font-mono font-medium text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10 focus:border-gray-900 dark:focus:border-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div className="text-gray-300 dark:text-gray-600 pt-5">×</div>
                <div className="flex-1">
                  <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1.5 block">Height (px)</label>
                  <input
                    type="number"
                    value={state.frameHeight}
                    onChange={(e) => onChange({ ...state, frameHeight: parseInt(e.target.value) || 0, aspectRatio: 'custom' })}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2 text-xs font-mono font-medium text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10 focus:border-gray-900 dark:focus:border-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>
            
            <ColorPicker 
              label="Canvas Background" 
              color={state.canvasBgColor} 
              onChange={(c) => onChange({ ...state, canvasBgColor: c })} 
            />
          </Section>

          <Section title="Image Container" icon={Box} defaultOpen={true}>
            {/* Mode Switcher */}
             <div className="mb-4 space-y-3">
               <div className="bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center p-1 border border-gray-200 dark:border-gray-700">
                 <button 
                   onClick={() => onChange({ ...state, mode: 'card' })}
                   className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${!isCutout ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                 >
                   <Square className="w-3.5 h-3.5" />
                   Card
                 </button>
                 <button 
                   onClick={() => onChange({ ...state, mode: 'cutout' })}
                   className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${isCutout ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                 >
                   <Scissors className="w-3.5 h-3.5" />
                   Cutout
                 </button>
               </div>
             </div>

             {!isCutout && (
                <ColorPicker 
                  label="Card Background" 
                  color={state.cardBgColor} 
                  onChange={(c) => onChange({ ...state, cardBgColor: c })} 
                />
             )}
             
             <Slider 
              label="Scale" 
              value={state.scale} 
              min={0.1} 
              max={2} 
              step={0.01}
              onChange={(v) => onChange({ ...state, scale: v })} 
              unit="x"
            />
             <Slider 
              label="Rotation" 
              value={state.rotate} 
              min={-180} 
              max={180} 
              onChange={(v) => onChange({ ...state, rotate: v })} 
              unit="°"
            />
            
            {!isCutout && (
              <>
                <Slider 
                  label="Corner Radius" 
                  value={state.borderRadius} 
                  min={0} 
                  max={200} 
                  onChange={(v) => onChange({ ...state, borderRadius: v })} 
                  unit="px"
                />
                <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-700/50 mt-2">
                    <Slider 
                      label="Border Width" 
                      value={state.border.width} 
                      min={0} 
                      max={20} 
                      step={0.5}
                      onChange={(v) => updateBorder('width', v)} 
                    />
                    <ColorPicker 
                      label="Border Color" 
                      color={state.border.color} 
                      onChange={(c) => updateBorder('color', c)}
                      opacity={state.border.opacity}
                      onOpacityChange={(o) => updateBorder('opacity', o)}
                    />
                </div>
              </>
            )}
          </Section>

          <Section title="Shadows & Depth" icon={Zap}>
             <div className="space-y-4">
                <ShadowLayerControl 
                  label="Layer 1" 
                  config={state.shadow1} 
                  onChange={(newConfig) => onChange({ ...state, shadow1: newConfig })} 
                  isCutoutMode={isCutout}
                />
                <ShadowLayerControl 
                  label="Layer 2" 
                  config={state.shadow2} 
                  onChange={(newConfig) => onChange({ ...state, shadow2: newConfig })} 
                  isCutoutMode={isCutout}
                />
             </div>
             {isCutout && (
               <div className="mt-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-[10px] leading-relaxed">
                 <span className="font-bold">Note:</span> In Cutout Mode, shadows follow the shape of your image. Spread and Inset options are disabled.
               </div>
             )}
          </Section>

          {!isCutout && (
            <Section title="Lighting & Glass" icon={Sun}>
              <Slider 
                label="Backdrop Blur" 
                value={state.glassBlur} 
                min={0} 
                max={60} 
                onChange={(v) => onChange({...state, glassBlur: v})} 
              />
              <Slider 
                label="Card Opacity" 
                value={state.glassOpacity} 
                min={0} 
                max={1} 
                step={0.05}
                onChange={(v) => onChange({...state, glassOpacity: v})} 
              />
              <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-700/50 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Overlay Gradient</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={state.lighting.enabled}
                        onChange={(e) => onChange({...state, lighting: { ...state.lighting, enabled: e.target.checked }})}
                      />
                      <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-500 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gray-900 dark:peer-checked:bg-white"></div>
                  </label>
                </div>
                {state.lighting.enabled && (
                  <div className="space-y-4">
                    <Slider 
                      label="Opacity" 
                      value={state.lighting.opacity} 
                      min={0} 
                      max={1} 
                      step={0.05}
                      onChange={(v) => onChange({...state, lighting: { ...state.lighting, opacity: v }})} 
                    />
                    <Slider 
                      label="Direction" 
                      value={state.lighting.direction} 
                      min={0} 
                      max={360} 
                      onChange={(v) => onChange({...state, lighting: { ...state.lighting, direction: v }})} 
                      unit="°"
                    />
                  </div>
                )}
              </div>
            </Section>
          )}

        </div>
      </div>
      
      {/* Footer Info */}
      <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 dark:text-gray-500 flex justify-between items-center z-20">
        <span className="font-mono">V1.0.0</span>
        <button 
          onClick={onShowInfo}
          className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 group"
        >
          <Info className="w-3 h-3 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors" />
          <span className="font-medium">About</span>
        </button>
      </div>
    </>
  );
};