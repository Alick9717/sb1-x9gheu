import React, { useCallback, useRef } from 'react';

interface ModelLoaderProps {
  onModelLoad: (url: string) => void;
}

export default function ModelLoader({ onModelLoad }: ModelLoaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, []);

  const handleFiles = useCallback((files: FileList) => {
    const modelFile = Array.from(files).find(file => 
      file.name.toLowerCase().endsWith('.glb') ||
      file.name.toLowerCase().endsWith('.gltf')
    );

    if (modelFile) {
      const url = URL.createObjectURL(modelFile);
      onModelLoad(url);
    }
  }, [onModelLoad]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="absolute inset-0 pointer-events-auto"
      />
      
      <div className="absolute bottom-4 left-4 flex flex-col gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".glb,.gltf"
          onChange={handleFileInput}
          className="hidden"
        />
        <button
          onClick={handleButtonClick}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg 
                   transition-colors duration-200 shadow-lg backdrop-blur-md"
        >
          Load Model
        </button>
        <div className="text-white/70 text-sm bg-black/30 backdrop-blur-md p-4 rounded-lg">
          Drag and drop or click the button to load a GLTF/GLB model
        </div>
      </div>
    </>
  );
}