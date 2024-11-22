import { useEffect, useState } from 'react';

export default function PerformanceMonitor() {
  const [memory, setMemory] = useState({
    jsHeapSizeLimit: 0,
    totalJSHeapSize: 0,
    usedJSHeapSize: 0
  });

  useEffect(() => {
    const updateMemory = () => {
      // Get memory info if available
      const memoryInfo = (performance as any).memory || {
        jsHeapSizeLimit: 0,
        totalJSHeapSize: 0,
        usedJSHeapSize: 0
      };

      setMemory({
        jsHeapSizeLimit: Math.round(memoryInfo.jsHeapSizeLimit / 1048576), // Convert to MB
        totalJSHeapSize: Math.round(memoryInfo.totalJSHeapSize / 1048576),
        usedJSHeapSize: Math.round(memoryInfo.usedJSHeapSize / 1048576)
      });
    };

    const interval = setInterval(updateMemory, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-4 left-24 bg-black/30 backdrop-blur-md p-4 rounded-lg text-white">
      <h2 className="text-lg font-bold mb-4">Memory Usage</h2>
      <div className="space-y-2">
        <div className="space-y-1 text-sm">
          <div>Used Heap: {memory.usedJSHeapSize} MB</div>
          <div>Total Heap: {memory.totalJSHeapSize} MB</div>
          <div>Heap Limit: {memory.jsHeapSizeLimit} MB</div>
        </div>
      </div>
    </div>
  );
}