import { useState, Suspense, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Controls from './Controls';
import FileUpload from './FileUpload';
import LoadedModel from './LoadedModel';
import DefaultScene from './DefaultScene';
import CameraLight from './lights/CameraLight';
import { ColorAdjustment } from './effects/ColorAdjustment';
import * as THREE from 'three';

function ShadowVolume() {
  const size = 200;
  return (
    <mesh visible={false}>
      <boxGeometry args={[size, size, size]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

export default function Scene() {
  const colorAdjustmentRef = useRef();
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [enabledEffects, setEnabledEffects] = useState({
    bloom: true,
    colorAdjustment: true,
    directionalLight: true,
    ambientLight: true,
    colorSaturation: true
  });
  
  const [settings, setSettings] = useState({
    intensity: 0.2,
    radius: 0.1,
    directionalLight: {
      intensity: 3.6,
      color: '#ffffff'
    },
    ambientLight: {
      intensity: 2.0,
      color: '#ffffff'
    },
    backgroundColor: '#dedede',
    gamma: 1.2,
    exposure: 0.6,
    contrast: 104,
    saturation: 165,
    colorSaturation: {
      red: 56,
      yellow: 100
    },
    light: {
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0
    },
    tint: {
      color: '#ffffff',
      strength: 0
    }
  });

  const canvasSettings = useMemo(() => ({
    camera: { position: [0, 2, 5], fov: 75 },
    gl: { 
      antialias: true,
      alpha: false,
      stencil: false,
      depth: true,
      powerPreference: "high-performance",
      toneMapping: THREE.ACESFilmicToneMapping,
      shadowMap: {
        enabled: true,
        type: THREE.PCFSoftShadowMap,
        autoUpdate: true
      }
    },
    shadows: true,
    dpr: [1, 2],
    performance: { min: 0.5 }
  }), []);

  const orbitControlsSettings = useMemo(() => ({
    enableDamping: true,
    dampingFactor: 0.05,
    minDistance: 2,
    maxDistance: 300
  }), []);

  return (
    <div className="relative w-full h-screen">
      <Canvas {...canvasSettings}>
        <Stats className="stats" />
        <color attach="background" args={[settings.backgroundColor]} />
        
        <ShadowVolume />
        
        {enabledEffects.ambientLight && (
          <ambientLight 
            intensity={settings.ambientLight.intensity} 
            color={settings.ambientLight.color} 
          />
        )}
        
        {enabledEffects.directionalLight && (
          <CameraLight 
            intensity={settings.directionalLight.intensity}
            color={settings.directionalLight.color}
          />
        )}

        <Suspense fallback={null}>
          {modelUrl ? (
            <LoadedModel url={modelUrl} />
          ) : (
            <DefaultScene />
          )}
        </Suspense>

        <OrbitControls makeDefault {...orbitControlsSettings} />

        {(enabledEffects.bloom || enabledEffects.colorAdjustment) && (
          <EffectComposer multisampling={0}>
            {enabledEffects.colorAdjustment && (
              <ColorAdjustment
                ref={colorAdjustmentRef}
                gamma={settings.gamma}
                exposure={settings.exposure}
                contrast={settings.contrast}
                saturation={settings.saturation}
                colorSaturation={settings.colorSaturation}
                light={settings.light}
                tint={settings.tint}
              />
            )}
            {enabledEffects.bloom && (
              <Bloom 
                intensity={settings.intensity}
                radius={settings.radius}
                mipmapBlur
                luminanceThreshold={0.8}
                luminanceSmoothing={0.05}
                kernelSize={3}
              />
            )}
          </EffectComposer>
        )}
      </Canvas>

      <Controls
        settings={settings}
        onChange={setSettings}
        enabledEffects={enabledEffects}
        onEffectsChange={setEnabledEffects}
      />
      
      <FileUpload onUpload={setModelUrl} />

      <style>{`
        .stats {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
        }
      `}</style>
    </div>
  );
}