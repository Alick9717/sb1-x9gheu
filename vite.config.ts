import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          'three-addons': [
            'three/examples/jsm/controls/OrbitControls',
            'three/examples/jsm/loaders/GLTFLoader',
            'three/examples/jsm/loaders/DRACOLoader',
            'three/examples/jsm/postprocessing/EffectComposer',
            'three/examples/jsm/postprocessing/RenderPass',
            'three/examples/jsm/postprocessing/UnrealBloomPass',
            'three/examples/jsm/postprocessing/ShaderPass'
          ]
        }
      }
    }
  }
});