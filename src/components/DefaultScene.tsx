import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function DefaultScene() {
  const torusRef = useRef<THREE.Mesh>(null);
  const nonEmissiveSphereRef = useRef<THREE.Mesh>(null);

  // Memoize geometries and materials
  const geometries = useMemo(() => ({
    torus: new THREE.TorusKnotGeometry(1, 0.4, 128, 32),
    sphere: new THREE.SphereGeometry(0.5, 32, 32)
  }), []);

  const materials = useMemo(() => ({
    emissiveTorus: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ff4060'),
      emissive: new THREE.Color('#ff4060'),
      emissiveIntensity: 2,
      roughness: 0.2,
      metalness: 0.8,
      toneMapped: false
    }),
    nonEmissiveSphere: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#40a0ff'),
      roughness: 0.2,
      metalness: 0.8,
      toneMapped: true,
      emissiveIntensity: 0
    }),
    emissiveSphere: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#40a0ff'),
      emissive: new THREE.Color('#40a0ff'),
      emissiveIntensity: 2,
      roughness: 0.2,
      metalness: 0.8,
      toneMapped: false
    })
  }), []);

  useFrame((state) => {
    if (torusRef.current) {
      torusRef.current.rotation.x += 0.01;
      torusRef.current.rotation.y += 0.01;
    }
  });

  // Cleanup function
  useEffect(() => {
    return () => {
      Object.values(geometries).forEach(geometry => geometry.dispose());
      Object.values(materials).forEach(material => material.dispose());
    };
  }, [geometries, materials]);

  return (
    <group>
      <mesh ref={torusRef} castShadow geometry={geometries.torus} material={materials.emissiveTorus} />
      
      <mesh ref={nonEmissiveSphereRef} position={[-2, 0, 0]} castShadow 
            geometry={geometries.sphere} material={materials.nonEmissiveSphere} />
      
      <mesh position={[2, 0, 0]} castShadow 
            geometry={geometries.sphere} material={materials.emissiveSphere} />
    </group>
  );
}