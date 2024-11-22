import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraLightProps {
  intensity?: number;
  color?: string;
  distance?: number;
}

export default function CameraLight({ 
  intensity = 1.0, 
  color = '#ffffff',
  distance = 3
}: CameraLightProps) {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const { camera } = useThree();
  const lightPosition = new THREE.Vector3();
  
  useFrame(() => {
    if (lightRef.current) {
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      
      lightPosition.copy(camera.position)
        .sub(cameraDirection.multiplyScalar(distance));
      
      lightRef.current.position.copy(lightPosition);
      lightRef.current.target.position.copy(camera.position);
      lightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <directionalLight
      ref={lightRef}
      intensity={intensity}
      color={color}
      castShadow
      shadow-mapSize={[4096, 4096]} // High resolution shadows
      shadow-bias={-0.001}
      shadow-normalBias={0.02}
      shadow-camera-near={0.1}
      shadow-camera-far={500} // Extended shadow distance
      shadow-camera-left={-100} // Extended shadow width
      shadow-camera-right={100}
      shadow-camera-top={100} // Extended shadow height
      shadow-camera-bottom={-100}
      shadow-radius={7} // Soft shadows
    >
      <orthographicCamera 
        attach="shadow-camera"
        args={[-100, 100, 100, -100, 0.1, 500]}
      />
    </directionalLight>
  );
}