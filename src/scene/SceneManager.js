import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ColorAdjustmentPass } from './ColorAdjustmentPass.js';

class SceneManager {
  constructor() {
    this.canvas = document.querySelector('#scene');
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupLights();
    this.setupControls();
    this.setupPostProcessing();
    this.setupEventListeners();
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#000816');
    
    // Create a large shadow volume
    const shadowVolume = new THREE.Box3(
      new THREE.Vector3(-100, -100, -100),
      new THREE.Vector3(100, 100, 100)
    );
    this.scene.add(new THREE.Box3Helper(shadowVolume, 0xffffff));
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 2, 5);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  setupLights() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 3.6);
    this.directionalLight.position.set(10, 10, 10);
    this.directionalLight.castShadow = true;
    
    // Increase shadow map size and quality
    this.directionalLight.shadow.mapSize.width = 4096;
    this.directionalLight.shadow.mapSize.height = 4096;
    this.directionalLight.shadow.camera.near = 0.1;
    this.directionalLight.shadow.camera.far = 500;
    this.directionalLight.shadow.camera.left = -100;
    this.directionalLight.shadow.camera.right = 100;
    this.directionalLight.shadow.camera.top = 100;
    this.directionalLight.shadow.camera.bottom = -100;
    this.directionalLight.shadow.bias = -0.001;
    this.directionalLight.shadow.normalBias = 0.02;
    this.directionalLight.shadow.radius = 7;

    this.scene.add(this.directionalLight);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 300;
  }

  setupPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.2, // intensity
      0.1, // radius
      0.8  // threshold
    );
    this.composer.addPass(this.bloomPass);

    this.colorAdjustmentPass = new ColorAdjustmentPass({
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
    this.composer.addPass(this.colorAdjustmentPass);
  }

  setupEventListeners() {
    window.addEventListener('resize', this.handleResize.bind(this));
    window.addEventListener('controlsUpdate', this.handleControlsUpdate.bind(this));
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }

  handleControlsUpdate(event) {
    const { type, value } = event.detail;
    this.updateControls(type, value);
  }

  updateControls(type, value) {
    switch(type) {
      case 'bloomIntensity':
        this.bloomPass.strength = value;
        break;
      case 'bloomRadius':
        this.bloomPass.radius = value;
        break;
      case 'directionalLightIntensity':
        this.directionalLight.intensity = value;
        break;
      case 'ambientLightIntensity':
        this.ambientLight.intensity = value;
        break;
      case 'colorSaturation':
      case 'light':
      case 'tint':
      case 'gamma':
      case 'exposure':
      case 'contrast':
      case 'saturation':
        this.colorAdjustmentPass.updateUniforms({ [type]: value });
        break;
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.composer.render();
  }
}

// Create and export a single instance
export const sceneManager = new SceneManager();