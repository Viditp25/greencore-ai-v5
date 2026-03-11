import React, { useState, useEffect, useRef } from 'react';
import Scene from './components/Scene';
import FooterHUD from './components/FooterHUD';

function App() {
  const [telemetry, setTelemetry] = useState({
    servers: [],
    acSystem: null,
    geminiRecs: []
  });
  const telemetryRef = useRef({ servers: [], acSystem: null, geminiRecs: [] });

  const fetchData = async () => {
    try {
      const res = await fetch('/metrics');
      if (res.ok) {
        let data = await res.json();
        
        // Trust the stable backend data, no longer need explicit frontend dampening
        telemetryRef.current = data;
        setTelemetry(data);
      }
    } catch (err) {
      console.error("Failed to fetch API:", err);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();
    // Poll every 5 seconds to match the slower animation
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []); // Run fetch loop independently of selection

  return (
    <>
      {/* 3D Core Rendering Container */}
      <div id="canvas-container" style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1 }}>
        <Scene servers={telemetry.servers} />
      </div>

      {/* HTML HUD Absolute Position Overlays */}
      <div className="hud-container" style={{ zIndex: 10 }}>
        {telemetry.servers && telemetry.acSystem && (
           <FooterHUD servers={telemetry.servers} acSystem={telemetry.acSystem} />
        )}
      </div>
    </>
  );
}

export default App;
