import { useRef } from 'react';
import { useHelper } from '@react-three/drei';
import * as THREE from 'three';

export default function SceneLights() {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  useHelper(lightRef, THREE.DirectionalLightHelper, 1, 'red');

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight
        ref={lightRef}
        position={[10, 10, 10]}
        intensity={1.5}
        castShadow
      />
    </>
  );
}