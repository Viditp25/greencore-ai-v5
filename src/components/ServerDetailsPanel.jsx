import React, { useState, useEffect, useRef } from 'react';

// Removed useLerpedValue hook to enforce strict 5-second snapping

const ServerDetailsPanel = ({ server }) => {
  const [showRaw, setShowRaw] = useState(false);

  const safeCpu = server?.cpu || 0;
  const safeGpu = server?.gpu_usage || 0;
  const safeTemp = server?.temp || 0;
  const safeFan = server?.fan_rpm || 0;
  const safePower = server?.power || 0;

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
                <span className="sidebar-val">{safeCpu.toFixed(0)}%</span>
              </div>
              <div className="sidebar-item">
                <span className="sidebar-label">GPU Workload</span>
                <span className="sidebar-val">{safeGpu.toFixed(0)}%</span>
              </div>
              <div className="sidebar-item">
                <span className="sidebar-label">Thermal Index</span>
                <span className="sidebar-val" style={{ color: server.temp > 70 ? 'var(--neon-red)' : 'var(--text-primary)'}}>
                  {safeTemp.toFixed(1)}°C
                </span>
              </div>
              <div className="sidebar-item">
                <span className="sidebar-label">Exhaust Fan</span>
                <span className="sidebar-val">{(Math.round(safeFan / 10) * 10).toFixed(0)} RPM</span>
              </div>
              <div className="sidebar-item" style={{ gridColumn: 'span 2' }}>
                <span className="sidebar-label">Active Workload</span>
                <span className="sidebar-val">{server.workload}</span>
              </div>
              <div className="sidebar-item" style={{ gridColumn: 'span 2' }}>
                <span className="sidebar-label">Energy Draw</span>
                <span className="sidebar-val" style={{ color: 'var(--neon-green)'}}>{safePower.toFixed(0)}W</span>
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
