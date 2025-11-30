import React, { useState, useRef, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { Fighter } from './components/Fighter';
import { Stage } from './components/Stage';
import { UI } from './components/UI';
import { 
  PLAYER_1_CONTROLS, 
  PLAYER_2_CONTROLS, 
  MAX_HP 
} from './types';

// Camera controller wrapper to follow the action
const CameraController: React.FC<{ p1Ref: React.RefObject<Group>, p2Ref: React.RefObject<Group> }> = ({ p1Ref, p2Ref }) => {
  const vec = new Vector3();
  
  useFrame((state: any) => {
    if (p1Ref.current && p2Ref.current) {
      // Find midpoint between players
      const p1Pos = p1Ref.current.position;
      const p2Pos = p2Ref.current.position;
      
      const midX = (p1Pos.x + p2Pos.x) / 2;
      
      // Calculate distance to determine zoom
      const distance = p1Pos.distanceTo(p2Pos);
      const zoomZ = Math.max(6, distance * 0.7 + 5); 

      // Smooth camera movement (Height adjusted for taller models)
      state.camera.position.lerp(vec.set(midX, 3.5, zoomZ), 0.1);
      state.camera.lookAt(midX, 1.5, 0);
    }
  });
  return null;
}

const App: React.FC = () => {
  const [hp1, setHp1] = useState(MAX_HP);
  const [hp2, setHp2] = useState(MAX_HP);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  
  // Hit visual feedback state
  const [p1Hit, setP1Hit] = useState(false);
  const [p2Hit, setP2Hit] = useState(false);

  const p1Ref = useRef<Group>(null);
  const p2Ref = useRef<Group>(null);

  const handleAttack = useCallback((attackerId: 1 | 2, damage: number) => {
    if (winner) return;

    if (attackerId === 1) {
      setHp2(prev => {
        const newVal = Math.max(0, prev - damage);
        if (newVal === 0) setWinner(1);
        return newVal;
      });
      // Trigger Hit Visual
      setP2Hit(true);
      setTimeout(() => setP2Hit(false), 150);
    } else {
      setHp1(prev => {
        const newVal = Math.max(0, prev - damage);
        if (newVal === 0) setWinner(2);
        return newVal;
      });
      // Trigger Hit Visual
      setP1Hit(true);
      setTimeout(() => setP1Hit(false), 150);
    }
  }, [winner]);

  const restartGame = () => {
    setHp1(MAX_HP);
    setHp2(MAX_HP);
    setWinner(null);
    setP1Hit(false);
    setP2Hit(false);
    // Reset positions manually if needed
    if (p1Ref.current) { p1Ref.current.position.set(-3, 0, 0); }
    if (p2Ref.current) { p2Ref.current.position.set(3, 0, 0); }
  };

  return (
    <div className="w-full h-screen bg-neutral-900 relative">
      <UI 
        hp1={hp1} 
        hp2={hp2} 
        winner={winner} 
        onRestart={restartGame} 
      />
      
      <Canvas shadows camera={{ position: [0, 4, 10], fov: 45 }}>
        <Stage />
        
        <Fighter 
          ref={p1Ref}
          playerId={1}
          startPosition={[-3, 0, 0]}
          color="#3b82f6" // Blue
          controls={PLAYER_1_CONTROLS}
          opponentRef={p2Ref}
          onAttack={(dmg) => handleAttack(1, dmg)}
          isGameOver={!!winner}
          isHit={p1Hit}
        />

        <Fighter 
          ref={p2Ref}
          playerId={2}
          startPosition={[3, 0, 0]}
          color="#ef4444" // Red
          controls={PLAYER_2_CONTROLS}
          opponentRef={p1Ref}
          onAttack={(dmg) => handleAttack(2, dmg)}
          isGameOver={!!winner}
          isHit={p2Hit}
        />

        <CameraController p1Ref={p1Ref} p2Ref={p2Ref} />
      </Canvas>
    </div>
  );
};

export default App;