import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3, MeshStandardMaterial, Mesh } from 'three';
import { PlayerControls, MOVEMENT_SPEED, JUMP_FORCE, GRAVITY } from '../types';

interface FighterProps {
  startPosition: [number, number, number];
  color: string;
  controls: PlayerControls;
  playerId: 1 | 2;
  opponentRef: React.RefObject<Group>;
  onAttack: (damage: number) => void;
  isGameOver: boolean;
  isHit: boolean;
}

export const Fighter = React.forwardRef<Group, FighterProps>(({ 
  startPosition, 
  color, 
  controls, 
  playerId,
  opponentRef,
  onAttack,
  isGameOver,
  isHit
}, ref) => {
  const internalRef = useRef<Group>(null);
  React.useImperativeHandle(ref, () => internalRef.current as Group);

  // Physics state
  const velocity = useRef(new Vector3(0, 0, 0));
  const isJumping = useRef(false);
  const keys = useRef<{ [key: string]: boolean }>({});
  
  // Animation state
  const [attacking, setAttacking] = useState(false);
  const attackCooldown = useRef(false);

  // Body Part Refs for Animation
  const rightArmRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const torsoRef = useRef<Group>(null);
  
  // Materials Ref for Hit Effect
  const materialRefs = useRef<MeshStandardMaterial[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      
      if (e.code === controls.attack && !isGameOver && !attackCooldown.current) {
        setAttacking(true);
        attackCooldown.current = true;
        
        setTimeout(() => {
          setAttacking(false);
          attackCooldown.current = false;
        }, 300);

        if (internalRef.current && opponentRef.current) {
            const myPos = internalRef.current.position;
            const oppPos = opponentRef.current.position;
            const dist = myPos.distanceTo(oppPos);
            
            if (dist < 2.0) {
                const directionToOpponent = oppPos.x - myPos.x;
                const facing = internalRef.current.rotation.y === 0 ? 1 : -1;
                
                if ((facing === 1 && directionToOpponent > 0) || (facing === -1 && directionToOpponent < 0)) {
                    onAttack(10);
                }
            }
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [controls, isGameOver, onAttack, opponentRef]);

  useFrame((state) => {
    if (!internalRef.current || isGameOver) return;

    const group = internalRef.current;
    const time = state.clock.getElapsedTime();
    
    // --- Physics ---
    let moving = false;
    if (keys.current[controls.left]) {
      group.position.x -= MOVEMENT_SPEED;
      moving = true;
    }
    if (keys.current[controls.right]) {
      group.position.x += MOVEMENT_SPEED;
      moving = true;
    }

    if (group.position.x < -8) group.position.x = -8;
    if (group.position.x > 8) group.position.x = 8;

    if (keys.current[controls.jump] && !isJumping.current) {
      velocity.current.y = JUMP_FORCE;
      isJumping.current = true;
    }

    group.position.y += velocity.current.y;
    velocity.current.y -= GRAVITY;

    // Floor Collision (Floor is at y=0 visually now)
    if (group.position.y <= startPosition[1]) {
      group.position.y = startPosition[1];
      velocity.current.y = 0;
      isJumping.current = false;
    }

    // --- Facing ---
    if (opponentRef.current) {
       if (group.position.x < opponentRef.current.position.x) {
           group.rotation.y = 0;
       } else {
           group.rotation.y = Math.PI;
       }
    }

    // --- Animations ---
    
    // 1. Walking Animation
    if (moving && !isJumping.current) {
        const speed = 15;
        if(rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(time * speed) * 0.5;
        if(leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time * speed + Math.PI) * 0.5;
        
        if(rightArmRef.current && !attacking) rightArmRef.current.rotation.x = Math.sin(time * speed + Math.PI) * 0.3;
        if(leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(time * speed) * 0.3;
    } else if (!isJumping.current) {
        // Idle
        const breathe = Math.sin(time * 3) * 0.02;
        if(torsoRef.current) torsoRef.current.position.y = 0.85 + breathe;
        
        if(rightLegRef.current) rightLegRef.current.rotation.x = 0;
        if(leftLegRef.current) leftLegRef.current.rotation.x = 0;
        if(rightArmRef.current && !attacking) rightArmRef.current.rotation.x = 0;
        if(leftArmRef.current) leftArmRef.current.rotation.x = 0;
    } else {
        // Jump pose
        if(rightLegRef.current) rightLegRef.current.rotation.x = 0.4;
        if(leftLegRef.current) leftLegRef.current.rotation.x = -0.2;
    }

    // 2. Attack Animation
    if (rightArmRef.current) {
        if (attacking) {
            // Punch forward
            rightArmRef.current.rotation.x = -Math.PI / 2; // Raise arm
            rightArmRef.current.position.z = 0.5; // Extend forward
        } else if (!moving) {
            rightArmRef.current.position.z = 0;
            // Guard position
            rightArmRef.current.rotation.x = -0.5;
            rightArmRef.current.rotation.z = 0.5;
        } else {
             rightArmRef.current.position.z = 0;
             // Reset rotation Z if strictly walking
             rightArmRef.current.rotation.z = 0; 
        }
    }

    // 3. Hit Effect
    materialRefs.current.forEach(mat => {
        if (mat) {
             if (isHit) {
                mat.emissive.setHex(0xffffff);
                mat.emissiveIntensity = 1;
            } else {
                mat.emissive.setHex(0x000000);
                mat.emissiveIntensity = 0;
            }
        }
    });

  });

  const skinColor = "#e0ac69";
  
  // Helper to collect materials for flashing
  const registerMaterial = (el: any) => {
     if (el && !materialRefs.current.includes(el)) {
         materialRefs.current.push(el);
     }
  };

  return (
    <group ref={internalRef} position={startPosition}>
      {/* Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 16]} />
        <meshBasicMaterial color="black" opacity={0.4} transparent />
      </mesh>

      <group ref={torsoRef} position={[0, 0.85, 0]}>
          {/* Torso */}
          <mesh castShadow position={[0, 0.1, 0]}>
            <boxGeometry args={[0.4, 0.5, 0.25]} />
            <meshStandardMaterial ref={registerMaterial} color={color} />
          </mesh>
          
          {/* Head Group */}
          <group position={[0, 0.5, 0]}>
             <mesh castShadow>
                <boxGeometry args={[0.25, 0.3, 0.25]} />
                <meshStandardMaterial ref={registerMaterial} color={skinColor} />
             </mesh>
             {/* Bandana */}
             <mesh position={[0, 0.1, 0]}>
                <boxGeometry args={[0.26, 0.08, 0.26]} />
                <meshStandardMaterial ref={registerMaterial} color={color} />
             </mesh>
             {/* Face details */}
             <mesh position={[0.08, 0.02, 0.13]}>
                 <boxGeometry args={[0.04, 0.04, 0.01]} />
                 <meshStandardMaterial color="black" />
             </mesh>
             <mesh position={[-0.08, 0.02, 0.13]}>
                 <boxGeometry args={[0.04, 0.04, 0.01]} />
                 <meshStandardMaterial color="black" />
             </mesh>
          </group>

          {/* Right Arm (Punching Arm) */}
          <group ref={rightArmRef} position={[0.3, 0.2, 0]}>
              <mesh position={[0, -0.25, 0]}>
                  <boxGeometry args={[0.12, 0.5, 0.12]} />
                  <meshStandardMaterial ref={registerMaterial} color={skinColor} />
              </mesh>
              <mesh position={[0, -0.5, 0]}> {/* Fist */}
                  <boxGeometry args={[0.15, 0.15, 0.15]} />
                  <meshStandardMaterial ref={registerMaterial} color="#888" />
              </mesh>
          </group>

          {/* Left Arm */}
          <group ref={leftArmRef} position={[-0.3, 0.2, 0]}>
              <mesh position={[0, -0.25, 0]}>
                  <boxGeometry args={[0.12, 0.5, 0.12]} />
                  <meshStandardMaterial ref={registerMaterial} color={skinColor} />
              </mesh>
              <mesh position={[0, -0.5, 0]}> {/* Fist */}
                  <boxGeometry args={[0.15, 0.15, 0.15]} />
                  <meshStandardMaterial ref={registerMaterial} color="#888" />
              </mesh>
          </group>
      </group>

      {/* Hips/Belt */}
      <mesh position={[0, 0.6, 0]}>
         <boxGeometry args={[0.42, 0.15, 0.26]} />
         <meshStandardMaterial ref={registerMaterial} color="#222" />
      </mesh>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.12, 0.55, 0]}>
         <mesh position={[0, -0.3, 0]}>
             <boxGeometry args={[0.16, 0.6, 0.18]} />
             <meshStandardMaterial ref={registerMaterial} color="#333" />
         </mesh>
         <mesh position={[0, -0.65, 0.05]}> {/* Shoe */}
             <boxGeometry args={[0.18, 0.15, 0.28]} />
             <meshStandardMaterial ref={registerMaterial} color="black" />
         </mesh>
      </group>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.12, 0.55, 0]}>
         <mesh position={[0, -0.3, 0]}>
             <boxGeometry args={[0.16, 0.6, 0.18]} />
             <meshStandardMaterial ref={registerMaterial} color="#333" />
         </mesh>
         <mesh position={[0, -0.65, 0.05]}> {/* Shoe */}
             <boxGeometry args={[0.18, 0.15, 0.28]} />
             <meshStandardMaterial ref={registerMaterial} color="black" />
         </mesh>
      </group>

    </group>
  );
});