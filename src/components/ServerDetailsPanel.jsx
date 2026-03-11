import React, { useState, useEffect, useRef } from 'react';

const useLerpedValue = (targetValue, dampening = 0.05) => {
  const [current, setCurrent] = useState(targetValue || 0);
  const currentRef = useRef(targetValue || 0);
  const rafRef = useRef(null);
  const hasInit = useRef(false);

  useEffect(() => {
    if (targetValue === undefined || targetValue === null) return;
    
    if (!hasInit.current) {
      currentRef.current = targetValue;
      setCurrent(targetValue);
      hasInit.current = true;
      return;
    }

    const tick = () => {
      currentRef.current += (targetValue - currentRef.current) * dampening;
      setCurrent(currentRef.current);
      
      if (Math.abs(targetValue - currentRef.current) > 0.1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        currentRef.current = targetValue;
        setCurrent(targetValue);
      }
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetValue, dampening]);

  return current;
};

const ServerDetailsPanel = ({ server }) => {
  const [showRaw, setShowRaw] = useState(false);

  const lerpedCpu = useLerpedValue(server?.cpu);
  const lerpedGpu = useLerpedValue(server?.gpu_usage);
  const lerpedTemp = useLerpedValue(server?.temp);
  const lerpedFan = useLerpedValue(server?.fan_rpm);
  const lerpedPower = useLerpedValue(server?.power);

  return (
    <div className={`server-sidebar glass-panel ${server ? 'sidebar-visible' : ''}`}>
      {server ? (
        <>
          <div className="sidebar-header">
            <span>{server.id}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={() => setShowRaw(!showRaw)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#94a3b8',
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {showRaw ? 'UI' : '{ JSON }'}
              </button>
              <div className={`status-indicator ${server.temp > 70 ? 'status-red' : 'status-green'}`}></div>
            </div>
          </div>
          
          {showRaw ? (
            <div className="sidebar-raw" style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', overflowX: 'auto' }}>
              <pre style={{ fontSize: '0.7rem', color: '#00ff99', fontFamily: '"JetBrains Mono", monospace', margin: 0 }}>
                {JSON.stringify(server, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="sidebar-grid">
              <div className="sidebar-item">
                <span className="sidebar-label">CPU Compute</span>
                <span className="sidebar-val">{lerpedCpu.toFixed(0)}%</span>
              </div>
              <div className="sidebar-item">
                <span className="sidebar-label">GPU Workload</span>
                <span className="sidebar-val">{lerpedGpu.toFixed(0)}%</span>
              </div>
              <div className="sidebar-item">
                <span className="sidebar-label">Thermal Index</span>
                <span className="sidebar-val" style={{ color: server.temp > 70 ? 'var(--neon-red)' : 'var(--text-primary)'}}>
                  {lerpedTemp.toFixed(1)}°C
                </span>
              </div>
              <div className="sidebar-item">
                <span className="sidebar-label">Exhaust Fan</span>
                <span className="sidebar-val">{(Math.round(lerpedFan / 10) * 10).toFixed(0)} RPM</span>
              </div>
              <div className="sidebar-item" style={{ gridColumn: 'span 2' }}>
                <span className="sidebar-label">Active Workload</span>
                <span className="sidebar-val">{server.workload}</span>
              </div>
              <div className="sidebar-item" style={{ gridColumn: 'span 2' }}>
                <span className="sidebar-label">Energy Draw</span>
                <span className="sidebar-val" style={{ color: 'var(--neon-green)'}}>{lerpedPower.toFixed(0)}W</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="sidebar-empty">
          <span>Select or Hover over a Server to view real-time metrics.</span>
        </div>
      )}
    </div>
  );
};

export default ServerDetailsPanel;
