import React from 'react';

interface GlowControlsProps {
  bloomIntensity: number;
  bloomRadius: number;
  setBloomIntensity: (value: number) => void;
  setBloomRadius: (value: number) => void;
}

export default function GlowControls({
  bloomIntensity,
  bloomRadius,
  setBloomIntensity,
  setBloomRadius,
}: GlowControlsProps) {
  return (
    <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md p-4 rounded-lg text-white">
      <h2 className="text-lg font-bold mb-4">Glow Controls</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-2">
            Intensity: {bloomIntensity.toFixed(1)}
          </label>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={bloomIntensity}
            onChange={(e) => setBloomIntensity(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm mb-2">
            Radius: {bloomRadius.toFixed(1)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={bloomRadius}
            onChange={(e) => setBloomRadius(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
      </div>
    </div>
  );
}