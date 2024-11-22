import { useEffect, useRef, useMemo } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { Center } from '@react-three/drei';
import * as THREE from 'three';

interface LoadedModelProps {
  url: string;
}

export default function LoadedModel({ url }: LoadedModelProps) {
  const { scene: threeScene, gl } = useThree();
  const modelRef = useRef<THREE.Group>();
  
  // Memoize environment map creation
  const environmentMap = useMemo(() => {
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    pmremGenerator.compileEquirectangularShader();

    const renderTarget = pmremGenerator.fromScene(
      new THREE.Scene().add(
        new THREE.Mesh(
          new THREE.SphereGeometry(5, 64, 32),
          new THREE.MeshBasicMaterial({
            color: new THREE.Color(0.1, 0.1, 0.15),
            side: THREE.BackSide,
          })
        )
      ),
      0.01
    );

    pmremGenerator.dispose();
    return renderTarget.texture;
  }, [gl]);

  useEffect(() => {
    threeScene.environment = environmentMap;
    threeScene.background = new THREE.Color(0x000816);

    return () => {
      environmentMap.dispose();
    };
  }, [environmentMap, threeScene]);

  // Memoize loaders configuration
  const loaders = useMemo(() => {
    // Configure Draco loader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    dracoLoader.setDecoderConfig({ type: 'js' });

    // Configure KTX2 loader
    const ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath('https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/jsm/libs/basis/');
    ktx2Loader.detectSupport(gl);

    return { dracoLoader, ktx2Loader };
  }, [gl]);

  const gltf = useLoader(GLTFLoader, url, (loader) => {
    loader.setDRACOLoader(loaders.dracoLoader);
    loader.setKTX2Loader(loaders.ktx2Loader);
  });

  // Validate and process buffers
  useEffect(() => {
    if (gltf?.scene) {
      gltf.scene.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          const geometry = child.geometry;
          
          // Validate and fix buffer attributes
          if (geometry) {
            Object.entries(geometry.attributes).forEach(([key, attribute]) => {
              if (attribute instanceof THREE.BufferAttribute || attribute instanceof THREE.InterleavedBufferAttribute) {
                if (!attribute.array || attribute.array.byteLength === 0) {
                  console.warn(`Invalid buffer for attribute ${key}, removing...`);
                  geometry.deleteAttribute(key);
                }
              }
            });

            // Ensure geometry has required attributes
            if (!geometry.attributes.position) {
              console.error('Geometry missing position attribute');
              return;
            }

            // Recompute geometry attributes if needed
            if (!geometry.attributes.normal) {
              geometry.computeVertexNormals();
            }
            
            geometry.computeBoundingSphere();
            geometry.computeBoundingBox();
          }
        }
      });
    }
  }, [gltf]);

  // Memoize material processing
  const processedMaterials = useMemo(() => {
    if (!gltf?.scene) return new Map();
    
    const materials = new Map();

    gltf.scene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        const processMaterial = (material: THREE.Material) => {
          if (!material || materials.has(material.uuid)) {
            return materials.get(material.uuid);
          }

          if (material instanceof THREE.MeshStandardMaterial) {
            // Keep original material properties unless explicitly set as reflective/transparent
            const isMirror = material.metalness > 0.9 && material.roughness < 0.1;
            const isReflective = material.metalness > 0.7 && material.roughness < 0.2;
            const isTransparent = material.transparent && material.opacity < 0.9;

            // Create new material while preserving original properties
            const newMaterial = new THREE.MeshStandardMaterial({
              // Preserve original colors and maps
              color: material.color,
              map: material.map,
              normalMap: material.normalMap,
              roughnessMap: material.roughnessMap,
              metalnessMap: material.metalnessMap,
              alphaMap: material.alphaMap,
              emissiveMap: material.emissiveMap,
              emissive: material.emissive,
              emissiveIntensity: material.emissiveIntensity,

              // Preserve or adjust material properties
              metalness: isReflective ? material.metalness : Math.min(material.metalness, 0.5),
              roughness: isMirror ? material.roughness : Math.max(material.roughness, 0.3),
              transparent: isTransparent,
              opacity: material.opacity,
              side: material.side || THREE.FrontSide,

              // Environment map settings
              envMapIntensity: isReflective ? 1.5 : 1.0,
            });

            // Handle emissive properties
            if (material.emissive && material.emissiveIntensity > 0) {
              newMaterial.emissive = material.emissive;
              newMaterial.emissiveIntensity = material.emissiveIntensity;
              newMaterial.toneMapped = false;
            }

            materials.set(material.uuid, newMaterial);
            return newMaterial;
          }
          
          materials.set(material.uuid, material);
          return material;
        };

        try {
          if (Array.isArray(child.material)) {
            child.material = child.material.map(processMaterial);
          } else if (child.material) {
            child.material = processMaterial(child.material);
          } else {
            // Create default material if none exists
            child.material = new THREE.MeshStandardMaterial({
              color: new THREE.Color(0x808080),
              roughness: 0.5,
              metalness: 0.5
            });
          }

          // Shadow settings
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.shadow) {
            child.shadow.bias = -0.001;
            child.shadow.normalBias = 0.02;
            child.shadow.radius = 4;
            child.shadow.blurSamples = 8;
          }

          // Set render order based on transparency
          child.renderOrder = child.material.transparent ? 1 : 0;
        } catch (error) {
          console.error('Error processing material:', error);
        }
      }
    });

    return materials;
  }, [gltf]);

  useEffect(() => {
    return () => {
      // Cleanup materials
      processedMaterials.forEach((material) => {
        if (material?.dispose) {
          material.dispose();
        }
      });
      
      if (gltf?.scene) {
        gltf.scene.traverse((child: any) => {
          if (child.geometry?.dispose) {
            child.geometry.dispose();
          }
          if (child.material?.dispose) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat: THREE.Material) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
      
      // Dispose of loaders when component unmounts
      loaders.dracoLoader.dispose();
      loaders.ktx2Loader.dispose();
    };
  }, [gltf, processedMaterials, loaders]);

  // Handle loading errors
  if (!gltf || !gltf.scene) {
    console.error('Failed to load model');
    return null;
  }

  return (
    <Center>
      <primitive ref={modelRef} object={gltf.scene} />
    </Center>
  );
}