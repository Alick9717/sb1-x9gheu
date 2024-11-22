import React, { useCallback, useRef, useState } from 'react';
import JSZip from 'jszip';
import { Upload, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onUpload: (url: string) => void;
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const processZipFile = async (file: File) => {
    setIsLoading(true);
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      
      const modelFile = Object.values(contents.files).find(file => 
        !file.dir && (file.name.endsWith('.gltf') || file.name.endsWith('.glb') || file.name.endsWith('.drc'))
      );

      if (!modelFile) {
        throw new Error('No GLTF/GLB/DRC file found in the ZIP archive');
      }

      const extractedFiles: { [key: string]: Blob } = {};
      await Promise.all(
        Object.values(contents.files).map(async (file) => {
          if (!file.dir) {
            const blob = await file.async('blob');
            extractedFiles[file.name] = blob;
          }
        })
      );

      const urls: { [key: string]: string } = {};
      Object.entries(extractedFiles).forEach(([name, blob]) => {
        urls[name] = URL.createObjectURL(blob);
      });

      if (modelFile.name.endsWith('.gltf')) {
        const gltfContent = JSON.parse(await modelFile.async('text'));
        
        // Handle Draco-compressed meshes
        if (gltfContent.extensionsUsed?.includes('KHR_draco_mesh_compression')) {
          gltfContent.extensionsRequired = gltfContent.extensionsRequired || [];
          if (!gltfContent.extensionsRequired.includes('KHR_draco_mesh_compression')) {
            gltfContent.extensionsRequired.push('KHR_draco_mesh_compression');
          }
        }

        if (gltfContent.buffers) {
          gltfContent.buffers.forEach((buffer: any) => {
            const bufferPath = new URL(buffer.uri, 'file:///').pathname.slice(1);
            if (urls[bufferPath]) {
              buffer.uri = urls[bufferPath];
            }
          });
        }

        if (gltfContent.images) {
          gltfContent.images.forEach((image: any) => {
            const imagePath = new URL(image.uri, 'file:///').pathname.slice(1);
            if (urls[imagePath]) {
              image.uri = urls[imagePath];
            }
          });
        }

        const modifiedGltfBlob = new Blob([JSON.stringify(gltfContent)], { type: 'application/json' });
        onUpload(URL.createObjectURL(modifiedGltfBlob));
      } else {
        onUpload(urls[modelFile.name]);
      }
    } catch (error) {
      console.error('Error processing ZIP file:', error);
      alert('Error processing ZIP file. Please make sure it contains valid GLTF/GLB/DRC files.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFile = useCallback(async (file: File) => {
    if (file.name.endsWith('.zip')) {
      await processZipFile(file);
    } else if (file.name.match(/\.(glb|gltf|drc)$/)) {
      const url = URL.createObjectURL(file);
      onUpload(url);
    } else {
      alert('Please upload a .glb, .gltf, .drc, or .zip file');
    }
  }, [onUpload]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="absolute bottom-4 left-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".glb,.gltf,.drc,.zip"
        onChange={handleChange}
        className="hidden"
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className={`px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg 
                   transition-colors duration-200 shadow-lg backdrop-blur-md flex items-center gap-2
                   ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Upload className="w-5 h-5" />
        )}
        {isLoading ? 'Processing...' : 'Load Model'}
      </button>
    </div>
  );
}