import React, { useState, useEffect, useRef } from 'react';
import AnimatedNumber from './AnimatedNumber';

const FooterHUD = ({ servers, acSystem }) => {
  // Only tracked state is the highlighted server IDs (changes rarely due to hysteresis)
  const [maxIds, setMaxIds] = useState({ temp: null, cpu: null, gpu: null });

  // All hysteresis bookkeeping in refs — no re-render side effects
  const candidatesRef = useRef({ temp: null, cpu: null, gpu: null });
  const currentRef    = useRef({ temp: null, cpu: null, gpu: null });

  useEffect(() => {
    if (!servers || servers.length === 0) return;

    const now = Date.now();
    const absoluteMaxTemp = servers.reduce((p, c) => c.temp      > p.temp      ? c : p);
    const absoluteMaxCpu  = servers.reduce((p, c) => c.cpu       > p.cpu       ? c : p);
    const absoluteMaxGpu  = servers.reduce((p, c) => c.gpu_usage > p.gpu_usage ? c : p);

    const check = (metric, newMaxObj, metricKey) => {
      const currentId = currentRef.current[metric];
      const existingServer = servers.find(s => s.id === currentId);
      const existingVal = existingServer ? existingServer[metricKey] : -Infinity;
      const newVal = newMaxObj[metricKey];

      // Already highlighting this server — stable
      if (newMaxObj.id === currentId) {
        candidatesRef.current[metric] = null;
        return currentId;
      }

      // New max exceeds current by >2%, or no current highlight -> instant flip
      if (!currentId || newVal > existingVal * 1.02) {
        candidatesRef.current[metric] = null;
        currentRef.current[metric] = newMaxObj.id;
        return newMaxObj.id;
      }

      // Track as candidate; flip after 6 seconds of persistence
      const cand = candidatesRef.current[metric];
      if (cand && cand.id === newMaxObj.id) {
        if (now - cand.since >= 6000) {
          candidatesRef.current[metric] = null;
          currentRef.current[metric] = newMaxObj.id;
          return newMaxObj.id;
        }
      } else {
        candidatesRef.current[metric] = { id: newMaxObj.id, since: now };
      }
      return currentId;
    };

    const newTempId = check('temp', absoluteMaxTemp, 'temp');
    const newCpuId  = check('cpu',  absoluteMaxCpu,  'cpu');
    const newGpuId  = check('gpu',  absoluteMaxGpu,  'gpu_usage');

    // Only update state if something actually changed
    setMaxIds(prev => {
      if (prev.temp === newTempId && prev.cpu === newCpuId && prev.gpu === newGpuId) return prev;
      return { temp: newTempId, cpu: newCpuId, gpu: newGpuId };
    });

  }, [servers]); // servers is the only real dep — hysteresis state lives in refs

  if (!servers || servers.length === 0 || !acSystem) return null;

  return (
    <div className="footer-hud">

      {/* Box 1: Thermal Array */}
      <div className="glass-panel hud-box">
        <div className="hud-title">🌡️ Thermal Array</div>
        <div className="hud-content">
          {servers.map(srv => (
            <div key={srv.id} className={`stat-item ${srv.id === maxIds.temp ? 'max-temp' : ''}`}>
              <span className="stat-label">{srv.id}</span>
              <span className="stat-value"><AnimatedNumber value={srv.temp} suffix="°C" decimals={1} /></span>
            </div>
          ))}
        </div>
      </div>

      {/* Box 2: CPU Compute */}
      <div className="glass-panel hud-box">
        <div className="hud-title">💻 CPU Compute</div>
        <div className="hud-content">
          {servers.map(srv => (
            <div key={srv.id} className={`stat-item ${srv.id === maxIds.cpu ? 'max-cpu' : ''}`}>
              <span className="stat-label">{srv.id}</span>
              <span className="stat-value"><AnimatedNumber value={srv.cpu} suffix="%" /></span>
            </div>
          ))}
        </div>
      </div>

      {/* Box 3: GPU Compute */}
      <div className="glass-panel hud-box">
        <div className="hud-title">👾 GPU Compute</div>
        <div className="hud-content">
          {servers.map(srv => (
            <div key={srv.id} className={`stat-item ${srv.id === maxIds.gpu ? 'max-gpu' : ''}`}>
              <span className="stat-label">{srv.id}</span>
              <span className="stat-value"><AnimatedNumber value={srv.gpu_usage} suffix="%" /></span>
            </div>
          ))}
        </div>
      </div>

      {/* Box 4: Cooling System */}
      <div className="glass-panel hud-box">
        <div className="hud-title">❄️ Cooling System</div>
        <div className="hud-content" style={{ flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <span className="stat-label">VZG Ambient:</span>
            <span className="stat-value"><AnimatedNumber value={acSystem.vzg_ambient_c} suffix="°C" decimals={1} /></span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <span className="stat-label">Chiller Load:</span>
            <span className="stat-value" style={{ color: 'var(--neon-blue)' }}><AnimatedNumber value={acSystem.chiller_load} suffix="%" /></span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FooterHUD;
