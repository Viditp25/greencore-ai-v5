import React from 'react';

const CRACTower = ({ position, rotation }) => {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.5, 6, 2.5]} />
        <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.3} />
      </mesh>
      
      {/* Cooling Vents / Grille */}
      <mesh position={[0, 1.5, 1.26]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial color="#00ccff" transparent opacity={0.8} emissive="#00ccff" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Tower Light Indicator */}
      <mesh position={[0, 2.8, 1.26]}>
        <planeGeometry args={[0.8, 0.2]} />
        <meshBasicMaterial color="#00ff99" />
      </mesh>
    </group>
  );
};

export default CRACTower;
