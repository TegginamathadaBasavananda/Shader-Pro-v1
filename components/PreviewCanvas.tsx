

import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { StudioState, UploadedImage } from '../types';
import { ZoomIn, ZoomOut, Maximize, Sun, Image as ImageIcon, X } from 'lucide-react';

interface PreviewCanvasProps {
  images: UploadedImage[];
  activeImageId: string | null;
  onSelectImage: (id: string) => void;
  onRemoveImage: (id: string) => void;
  state: StudioState;
  canvasRef: React.RefObject<HTMLDivElement>;
  onChange: (newState: StudioState) => void;
}

// Draggable Light Source Control
interface LightControlProps {
  x: number;
  y: number;
  rotate: number; // Keep for API compatibility but pass 0 when decoupled
  scale: number;  // Keep for API compatibility but pass 1 when decoupled
  zoomScale: number;
  onChange: (nx: number, ny: number) => void;
}

const LightControl: React.FC<LightControlProps> = ({ x, y, rotate, scale, zoomScale, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 });

  useEffect(() => {
    if (!isDragging) return;
    
    // Disable selection and force cursor while dragging
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';

    const onMove = (e: PointerEvent) => {
      // Calculate delta in screen pixels
      // Compensate for the preview canvas zoom level to ensure 1:1 tracking
      const dx = (e.clientX - dragStart.current.x) / zoomScale;
      const dy = (e.clientY - dragStart.current.y) / zoomScale;
      
      // Direct screen space mapping since we are now Global
      const finalDx = dx / scale;
      const finalDy = dy / scale;
      
      onChange(dragStart.current.initialX + finalDx, dragStart.current.initialY + finalDy);
    };

    const onUp = () => {
      setIsDragging(false);
      // Clean up happens in return
    };
    
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
       window.removeEventListener('pointermove', onMove);
       window.removeEventListener('pointerup', onUp);
       
       // Restore styles
       document.body.style.cursor = '';
       document.body.style.userSelect = '';
    };
  }, [isDragging, onChange, rotate, scale, zoomScale]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, initialX: x, initialY: y };
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  // Handle Scale Logic:
  // When decoupled, scale is 1, so handleScale is 1/zoomScale (keeps knob constant size on screen)
  const handleScale = 1 / (Math.max(0.1, scale) * Math.max(0.1, zoomScale));

  return (
    <div 
      className="absolute top-1/2 left-1/2 exclude-from-export z-50 pointer-events-auto"
      style={{
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
      }}
    >
       {/* Dashed Line to Center */}
       <div 
         className="absolute top-1/2 left-1/2 h-0 border-t border-dashed border-gray-400 opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none"
         style={{
           width: Math.sqrt(x*x + y*y),
           transformOrigin: 'top left',
           transform: `rotate(${Math.atan2(y, x)}rad) scaleY(${handleScale})`
         }}
       />

       {/* Handle Knob */}
       <div 
         onPointerDown={handlePointerDown}
         className="group relative flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-800 text-orange-500 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] ring-1 ring-black/5 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
         style={{
           transform: `scale(${handleScale})`
         }}
         title="Drag to move Light Source"
       >
         <Sun className="w-4 h-4 fill-orange-500/20" />
         
         {/* Value Tooltip */}
         <div className="absolute top-full mt-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-mono rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            LIGHT
         </div>
       </div>
    </div>
  );
};

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({ 
  images, 
  activeImageId, 
  onSelectImage, 
  onRemoveImage,
  state, 
  canvasRef, 
  onChange 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomScale, setZoomScale] = useState(0.5);
  const [autoFit, setAutoFit] = useState(true);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  // Get current active image source
  const activeImage = images.find(img => img.id === activeImageId);
  const imageSrc = activeImage?.src || null;
  const isCutout = state.mode === 'cutout';

  // Helper to convert hex to rgb for rgba strings
  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const getRgba = (color: string, opacity: number) => {
    const rgb = hexToRgb(color);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  };

  // Robust Auto-Fit Logic using ResizeObserver
  useLayoutEffect(() => {
    if (!autoFit || !containerRef.current) return;

    const calculateScale = () => {
      if (!containerRef.current) return;
      
      const { width: containerWidth, height: containerHeight } = containerRef.current.getBoundingClientRect();
      const padding = 64; // 32px padding on each side
      
      const availableWidth = Math.max(0, containerWidth - padding);
      const availableHeight = Math.max(0, containerHeight - padding);
      
      const scaleX = availableWidth / state.frameWidth;
      const scaleY = availableHeight / state.frameHeight;
      
      // Use the smaller scale to ensure it fits
      let fitScale = Math.min(scaleX, scaleY);
      
      // Prevent weird zero/negative values
      if (!isFinite(fitScale) || fitScale <= 0) fitScale = 0.1;
      
      setZoomScale(fitScale);
      setPan({ x: 0, y: 0 }); // Reset pan on autofit recalc
    };

    // Initial calculation
    calculateScale();

    // Observe resizing
    const resizeObserver = new ResizeObserver(() => {
      if (autoFit) {
        window.requestAnimationFrame(calculateScale);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [state.frameWidth, state.frameHeight, autoFit]);

  const handleZoomIn = () => {
    setAutoFit(false);
    setZoomScale(prev => {
      const next = Math.round((prev + 0.1) * 10) / 10;
      return Math.min(next, 3.0);
    });
  };

  const handleZoomOut = () => {
    setAutoFit(false);
    setZoomScale(prev => {
      const next = Math.round((prev - 0.1) * 10) / 10;
      return Math.max(next, 0.1);
    });
  };

  const handleAutoFit = () => {
    setAutoFit(true);
    setPan({ x: 0, y: 0 });
  };

  // Panning Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setAutoFit(false);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setPan(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  // --- Style Generation Logic ---
  // GLOBAL LIGHTING HELPER
  // This calculates the LOCAL shadow offsets required to simulate a GLOBAL light source.
  // It counter-rotates the Screen Space shadow config by the object's rotation.
  const getLocalShadowCoords = (sx: number, sy: number, angleDeg: number) => {
     const rad = -angleDeg * (Math.PI / 180);
     const cos = Math.cos(rad);
     const sin = Math.sin(rad);
     return {
        x: sx * cos - sy * sin,
        y: sx * sin + sy * cos
     };
  };

  // 1. Box Shadows
  const shadows = [];
  if (state.shadow1.enabled && !isCutout) {
     const { x, y } = getLocalShadowCoords(state.shadow1.x, state.shadow1.y, state.rotate);
     shadows.push(`${state.shadow1.inset ? 'inset ' : ''}${x}px ${y}px ${state.shadow1.blur}px ${state.shadow1.spread}px ${getRgba(state.shadow1.color, state.shadow1.opacity)}`);
  }
  if (state.shadow2.enabled && !isCutout) {
     const { x, y } = getLocalShadowCoords(state.shadow2.x, state.shadow2.y, state.rotate);
     shadows.push(`${state.shadow2.inset ? 'inset ' : ''}${x}px ${y}px ${state.shadow2.blur}px ${state.shadow2.spread}px ${getRgba(state.shadow2.color, state.shadow2.opacity)}`);
  }
  const boxShadowStr = shadows.length > 0 ? shadows.join(', ') : 'none';

  // 2. Drop Shadows
  const dropShadows = [];
  if (state.shadow1.enabled && isCutout) {
    const { x, y } = getLocalShadowCoords(state.shadow1.x, state.shadow1.y, state.rotate);
    dropShadows.push(`drop-shadow(${x}px ${y}px ${state.shadow1.blur}px ${getRgba(state.shadow1.color, state.shadow1.opacity)})`);
  }
  if (state.shadow2.enabled && isCutout) {
    const { x, y } = getLocalShadowCoords(state.shadow2.x, state.shadow2.y, state.rotate);
    dropShadows.push(`drop-shadow(${x}px ${y}px ${state.shadow2.blur}px ${getRgba(state.shadow2.color, state.shadow2.opacity)})`);
  }
  const filterStr = dropShadows.length > 0 ? dropShadows.join(' ') : 'none';
  
  const cardRgb = hexToRgb(state.cardBgColor);
  const cardBgRgba = `rgba(${cardRgb.r}, ${cardRgb.g}, ${cardRgb.b}, ${state.glassOpacity})`;

  const wrapperStyle: React.CSSProperties = {
     transform: `scale(${state.scale}) rotate(${state.rotate}deg)`,
     transformOrigin: 'center center',
     width: '100%',
     height: '100%',
     display: 'flex',
     alignItems: 'center',
     justifyContent: 'center',
     position: 'relative'
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: isCutout ? 0 : `${state.borderRadius}px`,
    boxShadow: isCutout ? 'none' : boxShadowStr,
    filter: isCutout ? filterStr : 'none',
    border: isCutout ? 'none' : `${state.border.width}px solid ${getRgba(state.border.color, state.border.opacity)}`,
    backdropFilter: (!isCutout && state.glassBlur > 0) ? `blur(${state.glassBlur}px)` : 'none',
    backgroundColor: isCutout ? 'transparent' : cardBgRgba,
    objectFit: 'contain',
    width: 'auto',
    height: 'auto',
    maxWidth: '100%',
    maxHeight: '100%',
    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  };

  // --- Decoupled Light Logic ---
  const LIGHT_MULTIPLIER = 4;
  
  // With Global Lighting, state.shadow1 represents SCREEN SPACE coordinates.
  // We simply scale them for visual placement.
  // Light is typically visually opposite to shadow, hence the negative.
  const screenLightX = -state.shadow1.x * LIGHT_MULTIPLIER * state.scale;
  const screenLightY = -state.shadow1.y * LIGHT_MULTIPLIER * state.scale;

  const handleLightDrag = (newScreenX: number, newScreenY: number) => {
    // Inverse Scale only (No Inverse Rotation, because input is Screen Space and storage is Screen Space)
    const unscaledX = newScreenX / state.scale;
    const unscaledY = newScreenY / state.scale;
    
    const newShadowX = -unscaledX / LIGHT_MULTIPLIER;
    const newShadowY = -unscaledY / LIGHT_MULTIPLIER;
    
    // Calculate angle for the gradient
    // 0 deg in CSS linear-gradient is Up (Bottom -> Top).
    // If Knob is at (0, -10) [Top], we want Highlight at Top (Top -> Bottom).
    // This is 180deg.
    // atan2(0, -(-10)) = atan2(0, 10) = 0.
    // So we add 180.
    const lx = -unscaledX;
    const ly = -unscaledY;
    let angleDeg = (Math.atan2(lx, -ly) * (180 / Math.PI)) + 180;
    if (angleDeg < 0) angleDeg += 360;

    onChange({
       ...state,
       shadow1: { ...state.shadow1, x: newShadowX, y: newShadowY },
       lighting: { ...state.lighting, direction: Math.round(angleDeg) }
    });
  };

  // Counter-rotate the gradient direction so the highlight stays fixed on screen
  const effectiveGradientDirection = (state.lighting.direction - state.rotate + 360) % 360;

  return (
    <div className="w-full h-full flex flex-col bg-[#E5E7EB] dark:bg-[#0c0c0e] dot-grid-bg relative overflow-hidden">
       
      {/* Canvas Controls Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <button 
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-16 text-center text-xs font-mono font-medium text-gray-700 dark:text-gray-300">
          {(zoomScale * 100).toFixed(0)}%
        </div>
        <button 
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-700 mx-1"></div>
        <button 
          onClick={handleAutoFit}
          className={`p-2 rounded-md ${autoFit ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
          title="Fit to Screen"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* Batch Thumbnails Bar */}
      {images.length > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 max-w-[90vw] p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-x-auto">
          <div className="flex items-center gap-2">
            {images.map((img) => (
              <div 
                key={img.id}
                className={`relative w-12 h-12 rounded-lg border-2 overflow-hidden cursor-pointer transition-all flex-shrink-0 group ${img.id === activeImageId ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 opacity-60 hover:opacity-100'}`}
                onClick={() => onSelectImage(img.id)}
              >
                <img src={img.src} alt={img.name} className="w-full h-full object-cover" />
                <button 
                  onClick={(e) => { e.stopPropagation(); onRemoveImage(img.id); }}
                  className="absolute top-0 right-0 p-0.5 bg-black/50 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Overlay */}
      <div className="absolute top-6 right-6 z-20 pointer-events-none opacity-50 hover:opacity-100 transition-opacity">
        <div className="bg-white/90 dark:bg-black/80 backdrop-blur px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-800 shadow-sm text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
           Output: {state.frameWidth}px × {state.frameHeight}px
        </div>
      </div>
       
      {/* Zoom Container - Handles Panning */}
      <div 
        ref={containerRef}
        className="flex-1 w-full h-full flex items-center justify-center overflow-hidden"
        style={{ cursor: isPanning ? 'grabbing' : 'default' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* The Scaled Wrapper */}
        <div 
          style={{
            width: state.frameWidth,
            height: state.frameHeight,
            // Apply translation for panning before scaling
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomScale})`,
            transformOrigin: 'center center',
            boxShadow: '0 50px 100px -20px rgba(0,0,0,0.1), 0 30px 60px -30px rgba(0,0,0,0.1)',
            willChange: 'transform'
          }}
          className="flex-shrink-0 bg-white transition-transform duration-75 ease-out"
        >
          {/* THE ACTUAL CANVAS TO EXPORT */}
          <div 
            ref={canvasRef}
            data-export-target="true"
            className="w-full h-full relative overflow-hidden flex items-center justify-center"
            style={{
              backgroundColor: state.canvasBgColor,
            }}
          >
             {/* Content Area */}
             <div className="w-full h-full relative flex items-center justify-center">
                
                {/* Transform Wrapper: Handles Rotation/Scale */}
                <div style={wrapperStyle}>
                   {/* Card / Image */}
                   <div 
                     className="relative z-20 flex items-center justify-center max-w-full max-h-full"
                     style={{
                       width: 'auto',
                       height: 'auto',
                     }}
                   > 
                      {imageSrc ? (
                        <img 
                          src={imageSrc} 
                          alt="Product" 
                          className="block"
                          style={cardStyle}
                        />
                      ) : (
                        <div 
                          className="flex flex-col items-center justify-center gap-8 text-gray-300 dark:text-gray-600 border-4 border-dashed border-gray-300 dark:border-gray-700"
                          style={{
                            ...cardStyle,
                            width: '800px',
                            aspectRatio: '16/10',
                            backgroundColor: (isCutout || state.glassOpacity > 0) ? cardBgRgba : 'rgba(255,255,255,0.05)',
                            ...(isCutout ? { backgroundColor: 'rgba(255,255,255,0.05)', border: '4px dashed #e5e7eb' } : {})
                          }}
                        >
                           <div className="w-48 h-48 rounded-[2.5rem] bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm">
                              <ImageIcon className="w-24 h-24 text-gray-300 dark:text-gray-600" strokeWidth={1} />
                           </div>
                           <span className="font-bold text-3xl text-gray-300 dark:text-gray-600 tracking-[0.2em] uppercase opacity-80">No Image Selected</span>
                        </div>
                      )}

                      {/* Lighting Overlay - Applied on top of content inside card (Only for Card mode) */}
                      {!isCutout && state.lighting.enabled && (
                         <div 
                           className="absolute inset-0 z-30 pointer-events-none mix-blend-overlay"
                           style={{
                             borderRadius: state.borderRadius,
                             background: `linear-gradient(${effectiveGradientDirection}deg, rgba(255,255,255,${state.lighting.opacity}) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,${state.lighting.opacity * 0.1}) 100%)`,
                           }}
                         />
                      )}
                   </div>
                </div>

                {/* Light Source Control - Decoupled: Lives outside rotated wrapper */}
                <LightControl 
                   x={screenLightX} 
                   y={screenLightY} 
                   rotate={0} 
                   scale={1}  
                   zoomScale={zoomScale}
                   onChange={handleLightDrag}
                />

             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
