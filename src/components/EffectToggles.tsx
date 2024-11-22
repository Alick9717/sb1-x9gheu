import React from 'react';

interface EffectTogglesProps {
  enabled: {
    bloom: boolean;
    colorAdjustment: boolean;
  };
  onChange: (enabled: { bloom: boolean; colorAdjustment: boolean }) => void;
}

export default function EffectToggles({ enabled, onChange }: EffectTogglesProps) {
  return (
    <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-md p-4 rounded-lg text-white">
      <h2 className="text-lg font-bold mb-4">Effect Toggles</h2>
      <div className="space-y-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={enabled.bloom}
            onChange={(e) => onChange({ ...enabled, bloom: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
          />
          <span>Bloom Effect</span>
        </label>
        
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={enabled.colorAdjustment}
            onChange={(e) => onChange({ ...enabled, colorAdjustment: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
          />
          <span>Color Adjustment</span>
        </label>
      </div>
    </div>
  );
}