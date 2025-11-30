import React from 'react';
import { Environment, Stars } from '@react-three/drei';

export const Stage: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[5, 10, 7]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[1024, 1024]} 
      />
      <pointLight position={[-10, 5, -5]} intensity={0.8} color="#ff0055" />
      <pointLight position={[10, 5, -5]} intensity={0.8} color="#0055ff" />

      {/* Background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Floor Grid - Set to y=0 so characters stand ON it */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.4} />
      </mesh>
      
      <gridHelper args={[100, 50, 0x555555, 0x222222]} position={[0, 0.01, 0]} />

      {/* Background Decor */}
      <mesh position={[0, 3, -12]}>
        <boxGeometry args={[25, 6, 2]} />
        <meshStandardMaterial color="#050505" />
      </mesh>

      {/* Pillars */}
      <mesh position={[-8, 3, -10]}>
         <cylinderGeometry args={[1, 1, 6, 16]} />
         <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[8, 3, -10]}>
         <cylinderGeometry args={[1, 1, 6, 16]} />
         <meshStandardMaterial color="#333" />
      </mesh>
      
      <Environment preset="city" />
    </>
  );
};