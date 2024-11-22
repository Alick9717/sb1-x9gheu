import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import * as THREE from 'three';

const ColorAdjustmentShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'gamma': { value: 1.0 },
    'exposure': { value: 1.0 },
    'contrast': { value: 1.0 },
    'saturation': { value: 1.0 },
    'redSaturation': { value: 1.0 },
    'yellowSaturation': { value: 1.0 },
    'highlights': { value: 0.0 },
    'shadows': { value: 0.0 },
    'whites': { value: 0.0 },
    'blacks': { value: 0.0 },
    'tintColor': { value: new THREE.Color(1, 1, 1) },
    'tintStrength': { value: 0.0 }
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float gamma;
    uniform float exposure;
    uniform float contrast;
    uniform float saturation;
    uniform float redSaturation;
    uniform float yellowSaturation;
    uniform float highlights;
    uniform float shadows;
    uniform float whites;
    uniform float blacks;
    uniform vec3 tintColor;
    uniform float tintStrength;
    varying vec2 vUv;

    vec3 rgb2hsv(vec3 c) {
      vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
      vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
      vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
      float d = q.x - min(q.w, q.y);
      float e = 1.0e-10;
      return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
    }

    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    vec3 adjustTones(vec3 color) {
      float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
      
      float highlightsMask = smoothstep(0.5, 1.0, luminance);
      color += (highlights / 100.0) * highlightsMask;
      
      float shadowsMask = smoothstep(0.5, 0.0, luminance);
      color += (shadows / 100.0) * shadowsMask;
      
      float whitesMask = smoothstep(0.8, 1.0, luminance);
      color += (whites / 100.0) * whitesMask;
      
      float blacksMask = smoothstep(0.2, 0.0, luminance);
      color += (blacks / 100.0) * blacksMask;
      
      return clamp(color, 0.0, 1.0);
    }

    vec3 applyTint(vec3 color, vec3 tint, float strength) {
      vec3 tintHsv = rgb2hsv(tint);
      vec3 colorHsv = rgb2hsv(color);
      colorHsv.x = mix(colorHsv.x, tintHsv.x, strength);
      colorHsv.y = mix(colorHsv.y, tintHsv.y * colorHsv.y, strength);
      return hsv2rgb(colorHsv);
    }

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec3 color = texel.rgb;

      // Apply exposure
      color *= pow(2.0, exposure - 1.0);

      // Apply contrast
      color = (color - 0.5) * contrast + 0.5;

      // Apply color adjustments
      vec3 hsv = rgb2hsv(color);
      
      // Apply color-specific saturation
      float redRange = smoothstep(0.917, 1.0, hsv.x) + smoothstep(0.0, 0.083, hsv.x);
      float yellowRange = smoothstep(0.139, 0.194, hsv.x);
      float satMult = mix(
        1.0,
        mix(redSaturation, yellowSaturation, yellowRange),
        max(redRange, yellowRange)
      );
      hsv.y *= saturation * satMult;
      
      color = hsv2rgb(hsv);

      // Apply tint
      color = applyTint(color, tintColor, tintStrength);

      // Apply tone adjustments
      color = adjustTones(color);

      // Apply gamma correction
      color = pow(color, vec3(1.0 / gamma));

      gl_FragColor = vec4(color, texel.a);
    }
  `
};

export class ColorAdjustmentPass extends ShaderPass {
  constructor(options = {}) {
    super(ColorAdjustmentShader);
    this.updateUniforms(options);
  }

  updateUniforms(options) {
    if (!options) return;

    if (options.colorSaturation) {
      this.uniforms.redSaturation.value = options.colorSaturation.red / 100;
      this.uniforms.yellowSaturation.value = options.colorSaturation.yellow / 100;
    }
    
    if (options.light) {
      this.uniforms.highlights.value = options.light.highlights;
      this.uniforms.shadows.value = options.light.shadows;
      this.uniforms.whites.value = options.light.whites;
      this.uniforms.blacks.value = options.light.blacks;
    }
    
    if (options.tint) {
      if (options.tint.color) {
        const color = options.tint.color.substring(1);
        const r = parseInt(color.substring(0, 2), 16) / 255;
        const g = parseInt(color.substring(2, 4), 16) / 255;
        const b = parseInt(color.substring(4, 6), 16) / 255;
        this.uniforms.tintColor.value.setRGB(r, g, b);
      }
      if (options.tint.strength !== undefined) {
        this.uniforms.tintStrength.value = options.tint.strength / 100;
      }
    }

    const directUpdates = {
      gamma: 'gamma',
      exposure: 'exposure',
      contrast: value => value / 100,
      saturation: value => value / 100
    };

    Object.entries(directUpdates).forEach(([key, handler]) => {
      if (options[key] !== undefined) {
        this.uniforms[key].value = typeof handler === 'function' 
          ? handler(options[key]) 
          : options[key];
      }
    });
  }
}