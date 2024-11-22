import React from 'react';

interface Settings {
  intensity: number;
  radius: number;
  directionalLight: {
    intensity: number;
    color: string;
  };
  ambientLight: {
    intensity: number;
    color: string;
  };
  backgroundColor: string;
  gamma: number;
  exposure: number;
  contrast: number;
  saturation: number;
  colorSaturation: {
    red: number;
    yellow: number;
  };
  light: {
    highlights: number;
    shadows: number;
    whites: number;
    blacks: number;
  };
  tint: {
    color: string;
    strength: number;
  };
}

interface ControlsProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
  enabledEffects?: {
    bloom: boolean;
    colorAdjustment: boolean;
    directionalLight: boolean;
    ambientLight: boolean;
    colorSaturation: boolean;
  };
  onEffectsChange?: (effects: any) => void;
}

export default function Controls({ settings, onChange, enabledEffects, onEffectsChange }: ControlsProps) {
  return (
    <div className="absolute top-4 right-4 bg-black/50 p-4 rounded-lg text-white max-h-[90vh] overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Scene Controls</h2>
      
      <div className="space-y-6">
        {/* Color Tint Controls */}
        <div className="space-y-4">
          <h3 className="text-md font-semibold">Color Tint</h3>
          <div>
            <label className="block text-sm mb-2">Tint Color</label>
            <input
              type="color"
              value={settings.tint.color}
              onChange={(e) => onChange({
                ...settings,
                tint: {
                  ...settings.tint,
                  color: e.target.value
                }
              })}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">
              Tint Strength: {settings.tint.strength}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.tint.strength}
              onChange={(e) => onChange({
                ...settings,
                tint: {
                  ...settings.tint,
                  strength: Number(e.target.value)
                }
              })}
              className="w-full accent-blue-500"
            />
          </div>
        </div>

        {/* Camera RAW Light Controls */}
        <div className="space-y-4">
          <h3 className="text-md font-semibold">Light</h3>
          <div>
            <label className="block text-sm mb-2">
              Highlights: {settings.light.highlights}
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={settings.light.highlights}
              onChange={(e) => onChange({
                ...settings,
                light: {
                  ...settings.light,
                  highlights: Number(e.target.value)
                }
              })}
              className="w-full accent-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">
              Shadows: {settings.light.shadows}
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={settings.light.shadows}
              onChange={(e) => onChange({
                ...settings,
                light: {
                  ...settings.light,
                  shadows: Number(e.target.value)
                }
              })}
              className="w-full accent-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">
              Whites: {settings.light.whites}
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={settings.light.whites}
              onChange={(e) => onChange({
                ...settings,
                light: {
                  ...settings.light,
                  whites: Number(e.target.value)
                }
              })}
              className="w-full accent-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">
              Blacks: {settings.light.blacks}
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={settings.light.blacks}
              onChange={(e) => onChange({
                ...settings,
                light: {
                  ...settings.light,
                  blacks: Number(e.target.value)
                }
              })}
              className="w-full accent-blue-500"
            />
          </div>
        </div>

        {/* Effect Toggles */}
        {enabledEffects && onEffectsChange && (
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Effect Toggles</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={enabledEffects.bloom}
                  onChange={(e) => onEffectsChange({ ...enabledEffects, bloom: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span>Bloom Effect</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={enabledEffects.colorAdjustment}
                  onChange={(e) => onEffectsChange({ ...enabledEffects, colorAdjustment: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span>Color Adjustment</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={enabledEffects.directionalLight}
                  onChange={(e) => onEffectsChange({ ...enabledEffects, directionalLight: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span>Directional Light</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={enabledEffects.ambientLight}
                  onChange={(e) => onEffectsChange({ ...enabledEffects, ambientLight: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span>Ambient Light</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={enabledEffects.colorSaturation}
                  onChange={(e) => onEffectsChange({ ...enabledEffects, colorSaturation: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span>Color Saturation</span>
              </label>
            </div>
          </div>
        )}

        {/* Color Saturation Controls */}
        {(!enabledEffects || enabledEffects.colorSaturation) && (
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Color Saturation</h3>
            <div>
              <label className="block text-sm mb-2">
                Red: {settings.colorSaturation.red}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={settings.colorSaturation.red}
                onChange={(e) => onChange({
                  ...settings,
                  colorSaturation: {
                    ...settings.colorSaturation,
                    red: Number(e.target.value)
                  }
                })}
                className="w-full accent-red-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">
                Yellow: {settings.colorSaturation.yellow}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={settings.colorSaturation.yellow}
                onChange={(e) => onChange({
                  ...settings,
                  colorSaturation: {
                    ...settings.colorSaturation,
                    yellow: Number(e.target.value)
                  }
                })}
                className="w-full accent-yellow-500"
              />
            </div>
          </div>
        )}

        {/* Post Processing Controls */}
        {(!enabledEffects || enabledEffects.colorAdjustment) && (
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Post Processing</h3>
            <div>
              <label className="block text-sm mb-2">
                Gamma: {settings.gamma.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.1"
                max="4"
                step="0.1"
                value={settings.gamma}
                onChange={(e) => onChange({
                  ...settings,
                  gamma: Number(e.target.value)
                })}
                className="w-full accent-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">
                Exposure: {settings.exposure.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.exposure}
                onChange={(e) => onChange({
                  ...settings,
                  exposure: Number(e.target.value)
                })}
                className="w-full accent-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">
                Contrast: {settings.contrast}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={settings.contrast}
                onChange={(e) => onChange({
                  ...settings,
                  contrast: Number(e.target.value)
                })}
                className="w-full accent-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">
                Global Saturation: {settings.saturation}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={settings.saturation}
                onChange={(e) => onChange({
                  ...settings,
                  saturation: Number(e.target.value)
                })}
                className="w-full accent-blue-500"
              />
            </div>
          </div>
        )}

        {/* Bloom Controls */}
        {(!enabledEffects || enabledEffects.bloom) && (
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Bloom Effect</h3>
            <div>
              <label className="block text-sm mb-2">
                Intensity: {settings.intensity.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={settings.intensity}
                onChange={(e) => onChange({
                  ...settings,
                  intensity: Number(e.target.value)
                })}
                className="w-full accent-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">
                Radius: {settings.radius.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.radius}
                onChange={(e) => onChange({
                  ...settings,
                  radius: Number(e.target.value)
                })}
                className="w-full accent-blue-500"
              />
            </div>
          </div>
        )}

        {/* Directional Light Controls */}
        {(!enabledEffects || enabledEffects.directionalLight) && (
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Directional Light</h3>
            <div>
              <label className="block text-sm mb-2">
                Intensity: {settings.directionalLight.intensity.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={settings.directionalLight.intensity}
                onChange={(e) => onChange({
                  ...settings,
                  directionalLight: {
                    ...settings.directionalLight,
                    intensity: Number(e.target.value)
                  }
                })}
                className="w-full accent-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Color</label>
              <input
                type="color"
                value={settings.directionalLight.color}
                onChange={(e) => onChange({
                  ...settings,
                  directionalLight: {
                    ...settings.directionalLight,
                    color: e.target.value
                  }
                })}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Ambient Light Controls */}
        {(!enabledEffects || enabledEffects.ambientLight) && (
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Ambient Light</h3>
            <div>
              <label className="block text-sm mb-2">
                Intensity: {settings.ambientLight.intensity.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.ambientLight.intensity}
                onChange={(e) => onChange({
                  ...settings,
                  ambientLight: {
                    ...settings.ambientLight,
                    intensity: Number(e.target.value)
                  }
                })}
                className="w-full accent-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Color</label>
              <input
                type="color"
                value={settings.ambientLight.color}
                onChange={(e) => onChange({
                  ...settings,
                  ambientLight: {
                    ...settings.ambientLight,
                    color: e.target.value
                  }
                })}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Background Color */}
        <div className="space-y-4">
          <h3 className="text-md font-semibold">Background</h3>
          <div>
            <label className="block text-sm mb-2">Color</label>
            <input
              type="color"
              value={settings.backgroundColor}
              onChange={(e) => onChange({
                ...settings,
                backgroundColor: e.target.value
              })}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}