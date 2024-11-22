import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

import GlowingTorus from './objects/GlowingTorus';
import GlowingSphere from './objects/GlowingSphere';
import SceneLights from './scene/SceneLights';
import GlowControls from './controls/GlowControls';
import ModelLoader from './ModelLoader';
import Model from './Model';

export default function GlowScene() {
  const [bloomIntensity, setBloomIntensity] = useState(1.5);
  const [bloomRadius, setBloomRadius] = useState(0.6);
  const [modelUrl, setModelUrl] = useState<string | null>(null);

  return (
    <div className="relative w-full h-screen">
      <Canvas
        shadows
        camera={{ position: [0, 0, 6], fov: 75 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#000816']} />
        <fog attach="fog" args={['#000816', 5, 15]} />
        
        <SceneLights />
        
        {modelUrl ? (
          <Model url={modelUrl} />
        ) : (
          <>
            <GlowingTorus />
            <GlowingSphere position={[2, 0, 0]} />
            <GlowingSphere position={[-2, 0, 0]} />
          </>
        )}
        
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={3}
          maxDistance={10}
        />
        
        <EffectComposer>
          <Bloom
            intensity={bloomIntensity}
            radius={bloomRadius}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
      </Canvas>

      <ModelLoader onModelLoad={setModelUrl} />

      <GlowControls
        bloomIntensity={bloomIntensity}
        bloomRadius={bloomRadius}
        setBloomIntensity={setBloomIntensity}
        setBloomRadius={setBloomRadius}
      />
    </div>
  );
}