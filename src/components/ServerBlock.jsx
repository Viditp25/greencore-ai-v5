import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const ServerBlock = ({ position, data }) => {
  const fanRef = useRef();

  if (!data) return null;

  const safeCpu = data?.cpu || 0;
  const safeGpu = data?.gpu_usage || 0;
  const safeTemp = data?.temp || 0;
  const safeFan = data?.fan_rpm || 0;
  const safePower = data?.power || 0;

  const isHighLoad = data.temp > 70;
  const glowColor = isHighLoad ? '#ff3366' : '#00ff99';
  
  // Physics map relative to fan RPM: speed = rpm / 1000
  const fanSpeed = data.fan_rpm / 1000;
  
  // Track current speed to simulate mechanical inertia
  const currentSpeedRef = useRef(fanSpeed);

  useFrame((state, delta) => {
    // Apply 0.8 dampening factor to lerp towards the target fan speed for GSAP ease-out effect
    currentSpeedRef.current = THREE.MathUtils.lerp(currentSpeedRef.current, fanSpeed, delta * 0.8);

    if (fanRef.current) {
      fanRef.current.rotation.z -= currentSpeedRef.current * delta;
    }
  });

  return (
    <group position={position}>
      {/* Floating HTML Dialog */}
      <Html position={[0, 4, 0]} center className="server-floating-dialog">
        <div className="floating-header">
          <span>{data.id}</span>
          <div className={`status-indicator ${data.temp > 70 ? 'status-red' : 'status-green'}`}></div>
        </div>
        <div className="floating-grid">
          <div className="floating-item">
            <span className="floating-label">CPU Compute</span>
            <span className="floating-val">{safeCpu.toFixed(0)}%</span>
          </div>
          <div className="floating-item">
            <span className="floating-label">GPU Workload</span>
            <span className="floating-val">{safeGpu.toFixed(0)}%</span>
          </div>
          <div className="floating-item">
            <span className="floating-label">Thermal Index</span>
            <span className="floating-val" style={{ color: data.temp > 70 ? 'var(--neon-red)' : 'var(--text-primary)'}}>
              {safeTemp.toFixed(1)}°C
            </span>
          </div>
          <div className="floating-item">
            <span className="floating-label">Exhaust Fan</span>
            <span className="floating-val">{(Math.round(safeFan / 10) * 10).toFixed(0)} RPM</span>
          </div>
          <div className="floating-item" style={{ gridColumn: 'span 2' }}>
            <span className="floating-label">Active Workload</span>
            <span className="floating-val">{data.workload}</span>
          </div>
          <div className="floating-item" style={{ gridColumn: 'span 2' }}>
            <span className="floating-label">Energy Draw</span>
            <span className="floating-val" style={{ color: 'var(--neon-green)'}}>{safePower.toFixed(0)}W</span>
          </div>
        </div>
      </Html>

      {/* Monolithic Server Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 3, 2.5]} />
        <meshStandardMaterial color="#4A4A4A" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Front Panel Lights */}
      <mesh position={[0, 1, 1.26]}>
        <planeGeometry args={[1.2, 0.2]} />
        <meshBasicMaterial color={glowColor} />
      </mesh>
      
      {/* Simulated Fan (Rear) */}
      <group position={[0, 0, -1.26]} ref={fanRef}>
        <mesh>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color="#334155" wireframe={true} />
        </mesh>
      </group>

      {/* Red Pulse Base Glow if High Load */}
      {isHighLoad && (
        <mesh position={[0, -1.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.5, 3.5]} />
          <meshBasicMaterial color="#ff3366" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
};

export default ServerBlock;
