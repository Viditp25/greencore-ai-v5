import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleSystem = ({ count = 200, color, isExhaust = false, origin, targetData, directionZ = 1 }) => {
  const meshRef = useRef();
  
  // physics map = fan_rpm / 1000
  const targetSpeedScale = targetData ? targetData.fan_rpm / 1000 : 2.5;
  const currentSpeedScaleRef = useRef(targetSpeedScale);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
        const t = Math.random() * 100;
        const factor = 1 + Math.random();
        const speed = 0.05 + Math.random() / 50;
        
        let x, y, z;
        if (isExhaust) {
            // Exhaust particles spawn at rear of servers and drift outwards (+z or -z based on direction)
            x = (Math.random() - 0.5) * 1.5;
            y = (Math.random() - 0.5) * 1.5;
            z = (Math.random() - 0.5) * 0.5;
        } else {
            // Inlet particles spawn inside CRAC tower aperture
            x = (Math.random() - 0.5) * 1.5;
            y = (Math.random() - 0.5) * 1.5;
            z = (Math.random() - 0.5) * 0.5;
        }
        temp.push({ t, factor, speed, x, y, z });
    }
    return temp;
  }, [count, isExhaust]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Smooth momentum vector using lerp (ease-out equivalent in rendering loop)
    // Apply exact 0.8 dampening factor as requested to sync visual "wind" with fan acceleration
    currentSpeedScaleRef.current = THREE.MathUtils.lerp(currentSpeedScaleRef.current, targetSpeedScale, delta * 0.8);
    const speedScale = currentSpeedScaleRef.current;

    particles.forEach((particle, i) => {
      let { x, y, z, factor, speed } = particle;
      particle.t += speed * speedScale * delta * 15;

      if (isExhaust) {
          // Flow away from server into hot aisle
          dummy.position.set(
              x + Math.sin((particle.t / 10) * factor) * 0.2,
              y + (particle.t / 20) * factor,
              z + (particle.t / 5) * speedScale * directionZ
          );
          if (particle.t > 30) particle.t = 0;
      } else {
          // Flow from CRAC unit towards the Cold Aisle (Center). 
          // We use DirectionZ to steer them laterally (X) and forward (Z).
          // Left CRAC is at X=-12, Center is X=0. Flow needs +X movement.
          // Right CRAC is at X=12. Flow needs -X movement.
          // DirectionZ serves as an X modifier here (-1 for Right CRAC, +1 for Left CRAC).
          dummy.position.set(
              x + (particle.t / 5) * speedScale * directionZ,  // Move towards X=0
              y - Math.sin((particle.t / 10) * factor) * 0.5,
              z + (particle.t / 8) * speedScale                // Move out of CRAC (+Z)
          );
          if (particle.t > 60) particle.t = 0; // Reset before they cross the whole room
      }

      dummy.scale.set(0.1, 0.1, 0.1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} position={origin}>
      <sphereGeometry args={[0.5, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.4} />
    </instancedMesh>
  );
};

const AirflowParticles = ({ servers }) => {
    if (!servers || servers.length === 0) return null;
    const maxRPMItem = servers.reduce((prev, current) => (prev.fan_rpm > current.fan_rpm) ? prev : current);

    // Row 1: Flow North to South (+Z exhaust). Exhaust at Z=1.5
    // Row 2: Flow South to North (-Z exhaust). Exhaust at Z=-7.5
    const positions = [
      { id: 0, x: -5, z: 0, dir: 1, exhaustZ: 1.5 }, 
      { id: 1, x: 0,  z: 0, dir: 1, exhaustZ: 1.5 }, 
      { id: 2, x: 5,  z: 0, dir: 1, exhaustZ: 1.5 },
      { id: 3, x: -5, z: -6, dir: -1, exhaustZ: -7.5 }, 
      { id: 4, x: 0,  z: -6, dir: -1, exhaustZ: -7.5 }, 
      { id: 5, x: 5,  z: -6, dir: -1, exhaustZ: -7.5 },
    ];

    return (
        <group>
            {/* Top-Left CRAC Inlet Stream: Flow right (+X) and forward (+Z) */}
            <ParticleSystem 
                count={200} 
                color="#00ccff" 
                origin={[-12, 3, -7]} 
                targetData={maxRPMItem} 
                directionZ={1} 
            />
            {/* Top-Right CRAC Inlet Stream: Flow left (-X) and forward (+Z) */}
            <ParticleSystem 
                count={200} 
                color="#00ccff" 
                origin={[12, 3, -7]} 
                targetData={maxRPMItem} 
                directionZ={-1} 
            />

            {/* The Hot Aisles - Orange Exhaust Streams */}
            {servers.map((srv, idx) => {
                const p = positions[idx];
                return (
                   <ParticleSystem 
                     key={`exhaust-${srv.id}`} 
                     count={50} 
                     color="#ff6600" 
                     isExhaust={true} 
                     origin={[p.x, 1.5, p.exhaustZ]} 
                     targetData={srv} 
                     directionZ={p.dir}
                   />
                );
            })}
        </group>
    );
};

export default AirflowParticles;
