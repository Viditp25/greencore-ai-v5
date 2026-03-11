import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import ServerRoom from './ServerRoom';
import ServerBlock from './ServerBlock';
import CRACTower from './CRACTower';
import AirflowParticles from './AirflowParticles';

const Scene = ({ servers }) => {
    // Alibaba-trace hour simulate: Day/night dimming based on current machine time.
    // 12PM = Max Light (1), 12AM = Min Light (0.1)
    const hour = new Date().getHours();
    const isNight = hour >= 18 || hour <= 6;
    const ambientIntensity = isNight ? 0.2 : 0.8;

    const serverPositions = [
        [-5, 1.5, 0], [0, 1.5, 0], [5, 1.5, 0],    // SRV 01, 02, 03
        [-5, 1.5, -6], [0, 1.5, -6], [5, 1.5, -6]  // SRV 04, 05, 06
    ];

    return (
        <Canvas 
            shadows 
            gl={{ antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: true }}
            style={{ width: '100%', height: '100%', display: 'block' }}
        >
            <color attach="background" args={['#1A1A1D']} />
            <PerspectiveCamera makeDefault position={[0, 8, 12]} fov={50} />
            <OrbitControls 
                enablePan={true} 
                enableZoom={true} 
                enableRotate={true}
                maxPolarAngle={Math.PI / 2 - 0.05} // Prevent going below floor
            />
            
            <ambientLight intensity={ambientIntensity} color="#ffffff" />
            <directionalLight 
                castShadow 
                position={[10, 20, 10]} 
                intensity={isNight ? 1.0 : 3.0} 
                color="#e2e8f0" 
            />

            <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

            <ServerRoom />
            
            {/* 6 Server Blocks */}
            {servers && servers.map((srv, i) => (
                <ServerBlock key={srv.id} position={serverPositions[i]} data={srv} />
            ))}

            {/* 2 CRAC Towers */}
            <CRACTower position={[-12, 3, -8]} rotation={[0, Math.PI / 4, 0]} />
            <CRACTower position={[12, 3, -8]} rotation={[0, -Math.PI / 4, 0]} />

            {/* Airflow Physics Loop */}
            <AirflowParticles servers={servers} />

            {/* Subtle Env Reflection */}
            <Environment preset="night" />
        </Canvas>
    );
};

export default Scene;
