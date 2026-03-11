import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const ServerRoom = () => {
  const gridRef = useRef();

  // Subtle grid pulse if we wanted, but static is fine for the floor
  return (
    <group>
      {/* Dark Metallic Floor with a grid pattern */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#A9A9A9" metalness={0.2} roughness={0.8} />
      </mesh>
      
      {/* Grid overlay for professional aesthetic */}
      <gridHelper args={[40, 40, '#4b5563', '#6b7280']} position={[0, -0.49, 0]} />

      {/* Glass-paned walls (Back) */}
      <mesh position={[0, 4, -10]} receiveShadow>
        <planeGeometry args={[40, 10]} />
        <meshPhysicalMaterial 
          color="#0f172a" 
          transparent={true} 
          opacity={0.3} 
          roughness={0.1} 
          metalness={0.9} 
          transmission={0.5} 
        />
      </mesh>

      {/* Glass-paned walls (Left) */}
      <mesh position={[-15, 4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[40, 10]} />
        <meshPhysicalMaterial 
          color="#0f172a" 
          transparent={true} 
          opacity={0.3} 
          roughness={0.1} 
          metalness={0.9} 
          transmission={0.5} 
        />
      </mesh>
      
      {/* Glass-paned walls (Right) */}
      <mesh position={[15, 4, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[40, 10]} />
        <meshPhysicalMaterial 
          color="#0f172a" 
          transparent={true} 
          opacity={0.3} 
          roughness={0.1} 
          metalness={0.9} 
          transmission={0.5} 
        />
      </mesh>
    </group>
  );
};

export default ServerRoom;
