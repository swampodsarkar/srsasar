export interface PlayerControls {
  left: string;
  right: string;
  jump: string;
  attack: string;
}

export interface PlayerState {
  hp: number;
  position: [number, number, number];
  isAttacking: boolean;
  isHit: boolean;
  facing: 1 | -1; // 1 for right, -1 for left
}

export const PLAYER_1_CONTROLS: PlayerControls = {
  left: 'KeyA',
  right: 'KeyD',
  jump: 'KeyW',
  attack: 'Space',
};

export const PLAYER_2_CONTROLS: PlayerControls = {
  left: 'ArrowLeft',
  right: 'ArrowRight',
  jump: 'ArrowUp',
  attack: 'Enter',
};

export const MAX_HP = 100;
export const ATTACK_DAMAGE = 10;
export const MOVEMENT_SPEED = 0.15;
export const JUMP_FORCE = 0.25;
export const GRAVITY = 0.01;
export const GROUND_Y = -1.5;
export const ATTACK_RANGE = 2.5;