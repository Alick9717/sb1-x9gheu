import React, { useCallback } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

interface DragDropZoneProps {
  onModelLoad: (url: string) => void;
}

export default function DragDropZone({ onModelLoad }: DragDropZoneProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const modelFile = files.find(file => 
      file.name.toLowerCase().endsWith('.glb') ||
      file.name.toLowerCase().endsWith('.gltf')
    );

    if (modelFile) {
      const url = URL.createObjectURL(modelFile);
      onModelLoad(url);
    }
  }, [onModelLoad]);

  return (
    <div 
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="absolute inset-0 pointer-events-auto"
    />
  );
}