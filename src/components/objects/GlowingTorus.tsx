import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function GlowingTorus() {
  const torusRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (torusRef.current) {
      torusRef.current.rotation.x += 0.01;
      torusRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={torusRef}>
      <torusKnotGeometry args={[1, 0.3, 128, 32]} />
      <meshStandardMaterial
        emissive="#ff4060"
        emissiveIntensity={2}
        roughness={0.2}
        metalness={0.8}
        color="#ff4060"
      />
    </mesh>
  );
}