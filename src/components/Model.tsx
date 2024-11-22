import { useEffect } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { Center } from '@react-three/drei';

interface ModelProps {
  url: string;
}

export default function Model({ url }: ModelProps) {
  const { scene, camera } = useThree();
  const gltf = useLoader(GLTFLoader, url, loader => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);
  });

  useEffect(() => {
    if (gltf) {
      // Reset camera position when new model is loaded
      camera.position.set(0, 0, 6);
      camera.lookAt(0, 0, 0);
      
      // Add emissive material to the model for glow effect
      gltf.scene.traverse((child: any) => {
        if (child.isMesh) {
          child.material.emissive = child.material.color;
          child.material.emissiveIntensity = 0.5;
        }
      });
    }
  }, [gltf, camera]);

  return (
    <Center>
      <primitive object={gltf.scene} scale={2} />
    </Center>
  );
}