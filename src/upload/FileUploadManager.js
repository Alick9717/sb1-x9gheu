import { sceneManager } from '../scene/SceneManager.js';
import JSZip from 'jszip';

class FileUploadManager {
  constructor() {
    this.fileInput = document.getElementById('fileInput');
    this.uploadButton = document.getElementById('uploadButton');
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.uploadButton.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
    
    // Setup drag and drop
    document.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    document.addEventListener('drop', this.handleDrop.bind(this));
  }

  async handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      await this.processFile(file);
    }
  }

  async handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer?.files[0];
    if (file) {
      await this.processFile(file);
    }
  }

  async processFile(file) {
    if (file.name.endsWith('.zip')) {
      await this.processZipFile(file);
    } else if (file.name.match(/\.(glb|gltf|drc)$/)) {
      const url = URL.createObjectURL(file);
      sceneManager.loadModel(url);
    } else {
      alert('Please upload a .glb, .gltf, .drc, or .zip file');
    }
  }

  async processZipFile(file) {
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      
      const modelFile = Object.values(contents.files).find(file => 
        !file.dir && (file.name.endsWith('.gltf') || file.name.endsWith('.glb') || file.name.endsWith('.drc'))
      );

      if (!modelFile) {
        throw new Error('No GLTF/GLB/DRC file found in the ZIP archive');
      }

      const extractedFiles = {};
      await Promise.all(
        Object.values(contents.files).map(async (file) => {
          if (!file.dir) {
            const blob = await file.async('blob');
            extractedFiles[file.name] = blob;
          }
        })
      );

      const urls = {};
      Object.entries(extractedFiles).forEach(([name, blob]) => {
        urls[name] = URL.createObjectURL(blob);
      });

      if (modelFile.name.endsWith('.gltf')) {
        const gltfContent = JSON.parse(await modelFile.async('text'));
        
        if (gltfContent.buffers) {
          gltfContent.buffers.forEach((buffer) => {
            const bufferPath = new URL(buffer.uri, 'file:///').pathname.slice(1);
            if (urls[bufferPath]) {
              buffer.uri = urls[bufferPath];
            }
          });
        }

        if (gltfContent.images) {
          gltfContent.images.forEach((image) => {
            const imagePath = new URL(image.uri, 'file:///').pathname.slice(1);
            if (urls[imagePath]) {
              image.uri = urls[imagePath];
            }
          });
        }

        const modifiedGltfBlob = new Blob([JSON.stringify(gltfContent)], { type: 'application/json' });
        sceneManager.loadModel(URL.createObjectURL(modifiedGltfBlob));
      } else {
        sceneManager.loadModel(urls[modelFile.name]);
      }
    } catch (error) {
      console.error('Error processing ZIP file:', error);
      alert('Error processing ZIP file. Please make sure it contains valid GLTF/GLB/DRC files.');
    }
  }
}

// Create and export a single instance
export const fileUploadManager = new FileUploadManager();