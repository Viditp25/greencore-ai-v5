import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

const ServerBlock = ({ position, data, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const fanRef = useRef();

  if (!data) return null;

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

  // Automatically update the sidebar if this is the currently selected server and data updates
  useEffect(() => {
    if (hovered && onClick) {
      onClick(data);
    }
  }, [data, hovered, onClick]);

  return (
    <group position={position}>
      {/* Monolithic Server Body */}
      <mesh 
        castShadow 
        receiveShadow 
        onPointerOver={(e) => { 
          e.stopPropagation(); 
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => { 
          e.stopPropagation(); 
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick(data);
        }}
      >
        <boxGeometry args={[1.5, 3, 2.5]} />
        <meshStandardMaterial color={hovered ? "#6b7280" : "#4A4A4A"} metalness={0.8} roughness={0.3} />
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
