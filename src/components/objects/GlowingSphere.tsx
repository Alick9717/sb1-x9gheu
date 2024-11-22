import { Vector3 } from 'three';

interface GlowingSphereProps {
  position: [number, number, number];
}

export default function GlowingSphere({ position }: GlowingSphereProps) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial
        emissive="#40a0ff"
        emissiveIntensity={2}
        roughness={0.2}
        metalness={0.8}
        color="#40a0ff"
      />
    </mesh>
  );
}