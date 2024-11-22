import { forwardRef } from 'react'
import { Effect, BlendFunction } from 'postprocessing'
import { Uniform } from 'three'
import { extend, useFrame } from '@react-three/fiber'

const fragmentShader = `
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

  float getColorSaturation(vec3 hsv) {
    float redRange = smoothstep(0.917, 1.0, hsv.x) + smoothstep(0.0, 0.083, hsv.x);
    float yellowRange = smoothstep(0.139, 0.194, hsv.x);
    float satMult = mix(
      1.0,
      mix(redSaturation / 100.0, yellowSaturation / 100.0, yellowRange),
      max(redRange, yellowRange)
    );
    return satMult;
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
    
    // Blend hue and saturation based on tint strength
    colorHsv.x = mix(colorHsv.x, tintHsv.x, strength);
    colorHsv.y = mix(colorHsv.y, tintHsv.y * colorHsv.y, strength);
    
    return hsv2rgb(colorHsv);
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec3 color = inputColor.rgb;

    // Apply exposure adjustment
    color *= pow(2.0, exposure - 1.0);

    // Apply contrast adjustment
    color = clamp((color - 0.5) * contrast + 0.5, 0.0, 1.0);

    // Apply Camera RAW-like adjustments
    color = adjustTones(color);

    // Convert to HSV for saturation adjustments
    vec3 hsv = rgb2hsv(color);
    
    // Apply color-specific saturation
    float colorSatMult = getColorSaturation(hsv);
    hsv.y *= saturation / 100.0 * colorSatMult;
    
    // Convert back to RGB
    color = hsv2rgb(hsv);

    // Apply tint
    color = applyTint(color, tintColor, tintStrength);

    // Apply gamma correction
    color = pow(color, vec3(1.0 / gamma));

    outputColor = vec4(color, inputColor.a);
  }
`

class ColorAdjustmentEffect extends Effect {
  constructor() {
    super('ColorAdjustmentEffect', fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map([
        ['gamma', new Uniform(1.0)],
        ['exposure', new Uniform(1.0)],
        ['contrast', new Uniform(1.0)],
        ['saturation', new Uniform(100.0)],
        ['redSaturation', new Uniform(100.0)],
        ['yellowSaturation', new Uniform(100.0)],
        ['highlights', new Uniform(0.0)],
        ['shadows', new Uniform(0.0)],
        ['whites', new Uniform(0.0)],
        ['blacks', new Uniform(0.0)],
        ['tintColor', new Uniform([1.0, 1.0, 1.0])],
        ['tintStrength', new Uniform(0.0)]
      ])
    })
  }
}

extend({ ColorAdjustmentEffect })

interface ColorAdjustmentProps {
  gamma?: number;
  exposure?: number;
  contrast?: number;
  saturation?: number;
  colorSaturation?: {
    red: number;
    yellow: number;
  };
  light?: {
    highlights: number;
    shadows: number;
    whites: number;
    blacks: number;
  };
  tint?: {
    color: string;
    strength: number;
  };
}

export const ColorAdjustment = forwardRef<any, ColorAdjustmentProps>(({
  gamma = 1.0,
  exposure = 1.0,
  contrast = 100,
  saturation = 100,
  colorSaturation = { red: 100, yellow: 100 },
  light = { highlights: 0, shadows: 0, whites: 0, blacks: 0 },
  tint = { color: '#ffffff', strength: 0 }
}, ref) => {
  useFrame(() => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.uniforms.get('gamma').value = gamma;
      ref.current.uniforms.get('exposure').value = exposure;
      ref.current.uniforms.get('contrast').value = contrast / 100;
      ref.current.uniforms.get('saturation').value = saturation;
      ref.current.uniforms.get('redSaturation').value = colorSaturation.red;
      ref.current.uniforms.get('yellowSaturation').value = colorSaturation.yellow;
      ref.current.uniforms.get('highlights').value = light.highlights;
      ref.current.uniforms.get('shadows').value = light.shadows;
      ref.current.uniforms.get('whites').value = light.whites;
      ref.current.uniforms.get('blacks').value = light.blacks;

      // Convert hex color to RGB
      const color = tint.color.substring(1);
      const r = parseInt(color.substring(0, 2), 16) / 255;
      const g = parseInt(color.substring(2, 4), 16) / 255;
      const b = parseInt(color.substring(4, 6), 16) / 255;
      ref.current.uniforms.get('tintColor').value = [r, g, b];
      ref.current.uniforms.get('tintStrength').value = tint.strength / 100;
    }
  });

  return <colorAdjustmentEffect ref={ref} />
})