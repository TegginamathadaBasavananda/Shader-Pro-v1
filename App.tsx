
import React, { useState, useRef, useEffect } from 'react';
import { EditorPanel } from './components/EditorPanel';
import { PreviewCanvas } from './components/PreviewCanvas';
import { InfoModal } from './components/InfoModal';
import { StudioState, DEFAULT_STATE, StylePreset, UploadedImage } from './types';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';

function App() {
  const [state, setState] = useState<StudioState>(DEFAULT_STATE);
  
  // Batch Management
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{current: number, total: number} | null>(null);
  
  const [showInfo, setShowInfo] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Process files
    const filePromises = Array.from(files).map(file => {
      return new Promise<UploadedImage>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const src = event.target.result as string;
            // Load image to get dimensions
            const img = new Image();
            img.onload = () => {
              resolve({
                id: Math.random().toString(36).substring(2, 9),
                name: file.name.replace(/\.[^/.]+$/, ""), // remove extension
                src: src,
                width: img.naturalWidth,
                height: img.naturalHeight
              });
            };
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = src;
          } else {
            reject(new Error(`Failed to read file: ${file.name}`));
          }
        };
        reader.onerror = () => reject(new Error(`Error reading file: ${file.name}`));
        reader.readAsDataURL(file);
      });
    });

    try {
      const newImages = await Promise.all(filePromises);
      
      if (newImages.length > 0) {
        setImages(prev => [...prev, ...newImages]);
        const firstImg = newImages[0];
        setActiveImageId(firstImg.id);

        // Reset scale to 0.45 (under 50%) to ensure image is well-contained
        setState(prev => ({
          ...prev,
          scale: 0.45, 
          rotate: 0,
        }));
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload some images. Please try again.");
    }
    
    // Reset input to allow re-uploading the same file if needed
    e.target.value = '';
  };

  const removeImage = (id: string) => {
     setImages(prev => {
       const next = prev.filter(img => img.id !== id);
       // If we removed the active image, switch to another one
       if (activeImageId === id) {
         return next;
       }
       return next;
     });
     
     if (activeImageId === id) {
       const remaining = images.filter(img => img.id !== id);
       if (remaining.length > 0) {
         setActiveImageId(remaining[0].id);
       } else {
         setActiveImageId(null);
       }
     }
  };

  const getFontEmbedCSS = async () => {
      try {
        const fontUrl = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
        const res = await fetch(fontUrl);
        if (res.ok) {
          return await res.text();
        }
      } catch (e) {
        console.warn('Failed to fetch fonts for export.', e);
      }
      return '';
  };

  const handleExport = async () => {
    // If no images, or just one, standard export
    // If multiple, use batch logic
    if (images.length > 1) {
      await handleBatchExport();
    } else {
      await handleSingleExport();
    }
  };

  const handleSingleExport = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);

    try {
      const fontEmbedCSS = await getFontEmbedCSS();
      await new Promise(resolve => setTimeout(resolve, 100)); // UI settle

      const dataUrl = await toPng(canvasRef.current, {
        cacheBust: true,
        width: state.frameWidth,
        height: state.frameHeight,
        pixelRatio: 1,
        fontEmbedCSS,
        filter: (node) => !node.classList?.contains('exclude-from-export'),
        style: { transform: 'none' }
      });

      const activeImg = images.find(img => img.id === activeImageId);
      const filename = activeImg ? `${activeImg.name}-shaderpro.png` : `shader-pro-${Date.now()}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed", err);
      alert("Could not export image.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleBatchExport = async () => {
    if (!canvasRef.current || images.length === 0) return;
    
    setIsExporting(true);
    setExportProgress({ current: 0, total: images.length });
    
    try {
      const fontEmbedCSS = await getFontEmbedCSS();
      const zip = new JSZip();
      
      // We need to capture the current active ID to restore it later
      const originalActiveId = activeImageId;
      
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        
        // 1. Switch Active Image
        setActiveImageId(img.id);
        
        // 2. Wait for React Render & Image Load
        // We give a generous delay to ensure the DOM has updated and the image is visible
        await new Promise(resolve => setTimeout(resolve, 350));
        
        // 3. Render
        const dataUrl = await toPng(canvasRef.current, {
          cacheBust: true,
          width: state.frameWidth,
          height: state.frameHeight,
          pixelRatio: 1,
          fontEmbedCSS,
          filter: (node) => !node.classList?.contains('exclude-from-export'),
          style: { transform: 'none' }
        });
        
        // 4. Add to Zip
        // Remove data:image/png;base64, prefix
        const base64Data = dataUrl.split(',')[1];
        zip.file(`${img.name}-shaderpro.png`, base64Data, { base64: true });
        
        setExportProgress({ current: i + 1, total: images.length });
      }
      
      // Restore state
      if (originalActiveId) setActiveImageId(originalActiveId);

      // 5. Generate Zip
      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `shader-pro-batch-${Date.now()}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error("Batch export failed", err);
      alert("Batch export failed. Please try again.");
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const applyPreset = (preset: StylePreset) => {
    let newState = { ...state };

    switch (preset) {
      case StylePreset.Clean:
        newState = {
          ...state,
          mode: 'card',
          canvasBgColor: '#F3F4F6',
          cardBgColor: '#FFFFFF',
          borderRadius: 24,
          rotate: 0,
          scale: 0.45, // Updated default scale
          glassOpacity: 1,
          glassBlur: 0,
          border: { width: 0, color: '#ffffff', opacity: 1, radius: 24 },
          shadow1: { enabled: true, x: 0, y: 30, blur: 50, spread: -10, color: '#0f172a', opacity: 0.20, inset: false },
          shadow2: { ...DEFAULT_STATE.shadow2, enabled: false },
          lighting: { enabled: true, opacity: 0.05, direction: 135 }
        };
        break;

      case StylePreset.Dark:
        newState = {
          ...state,
          mode: 'card',
          canvasBgColor: '#111111',
          cardBgColor: '#222222',
          borderRadius: 30,
          rotate: 0,
          scale: 0.45, // Updated default scale
          glassOpacity: 1,
          glassBlur: 0,
          border: { width: 1, color: '#444444', opacity: 1, radius: 30 },
          shadow1: { enabled: true, x: 0, y: 35, blur: 70, spread: -15, color: '#000000', opacity: 0.7, inset: false },
          shadow2: { enabled: true, x: 0, y: 1, blur: 0, spread: 0, color: '#555555', opacity: 1, inset: true }, // Top lighting edge
          lighting: { enabled: true, opacity: 0.1, direction: 90 }
        };
        break;
    }
    setState(newState);
  };

  return (
    // Fixed layout container: Sidebar fixed width, Main area flex-grow
    <div className="flex flex-row h-screen w-full bg-[#F5F5F7] dark:bg-black overflow-hidden font-sans text-gray-900 dark:text-gray-100">
      
      {/* Sidebar - Fixed Width */}
      <aside className="w-[360px] h-full flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-30 shadow-xl relative flex flex-col">
        <EditorPanel 
          state={state} 
          onChange={setState} 
          onImageUpload={handleImageUpload}
          onExport={handleExport}
          applyPreset={applyPreset}
          isExporting={isExporting}
          exportProgress={exportProgress}
          onShowInfo={() => setShowInfo(true)}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          imageCount={images.length}
          hasActiveImage={!!activeImageId}
        />
      </aside>

      {/* Main Area - Preview */}
      <main className="flex-1 h-full relative z-10 overflow-hidden bg-gray-100 dark:bg-black">
        <PreviewCanvas 
          images={images}
          activeImageId={activeImageId}
          onSelectImage={setActiveImageId}
          onRemoveImage={removeImage}
          state={state} 
          canvasRef={canvasRef}
          onChange={setState}
        />
        
        {/* Processing Overlay */}
        {isExporting && exportProgress && (
           <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
             <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center">
                <div className="mb-4 flex justify-center">
                   <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin" />
                </div>
                <h3 className="text-lg font-bold mb-1">Rendering Batch</h3>
                <p className="text-sm text-gray-500 mb-4">Processing image {exportProgress.current} of {exportProgress.total}...</p>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                   <div 
                     className="bg-blue-500 h-full transition-all duration-300 ease-out"
                     style={{ width: `${(exportProgress.current / exportProgress.total) * 100}%` }}
                   />
                </div>
             </div>
           </div>
        )}
      </main>

      {/* Info Modal Overlay */}
      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
    </div>
  );
}

export default App;