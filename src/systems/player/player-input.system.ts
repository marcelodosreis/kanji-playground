import type { Engine } from "../../types/engine.type";
import type { Player } from "../../types/player.interface";
import type { PlayerStateMachine } from "./player-state-machine";
import { isPaused } from "../../utils/is-paused";
import { PLAYER_CONFIG } from "../../constansts/player.constat";
import type { PlayerSystemWithAPI } from "../../types/player-system.interface";

type Params = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
};

type InputCallbacks = {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onJumpPress: () => void;
  onJumpRelease: () => void;
  onAttack: () => void;
};

type InputState = {
  callbacks: Partial<InputCallbacks>;
};

const KEYS = PLAYER_CONFIG.input.keys;

export function PlayerInputSystem({
  engine,
  player,
}: Params): PlayerSystemWithAPI<{
  registerCallbacks: (callbacks: Partial<InputCallbacks>) => void;
  isMovementKeyPressed: () => boolean;
}> {
  player.controlHandlers = player.controlHandlers || [];

  const state: InputState = {
    callbacks: {},
  };

  const registerCallbacks = (callbacks: Partial<InputCallbacks>): void => {
    state.callbacks = { ...state.callbacks, ...callbacks };
  };

  const handleKeyDown = (key: string): void => {
    if (isPaused()) return;

    if (key === KEYS.moveLeft && state.callbacks.onMoveLeft) {
      state.callbacks.onMoveLeft();
    }

    if (key === KEYS.moveRight && state.callbacks.onMoveRight) {
      state.callbacks.onMoveRight();
    }

    if (key === KEYS.jump && state.callbacks.onJumpPress) {
      state.callbacks.onJumpPress();
    }
  };

  const handleKeyPress = async (key: string): Promise<void> => {
    if (isPaused()) return;

    if (key === KEYS.attack && state.callbacks.onAttack) {
      state.callbacks.onAttack();
    }
  };

  const handleKeyRelease = (key: string): void => {
    if (key === KEYS.jump && state.callbacks.onJumpRelease) {
      state.callbacks.onJumpRelease();
    }
  };

  const isMovementKeyPressed = (): boolean => {
    return engine.isKeyDown(KEYS.moveLeft) || engine.isKeyDown(KEYS.moveRight);
  };

  player.controlHandlers.push(engine.onKeyDown(handleKeyDown));
  player.controlHandlers.push(engine.onKeyPress(handleKeyPress));
  player.controlHandlers.push(engine.onKeyRelease(handleKeyRelease));

  return {
    registerCallbacks,
    isMovementKeyPressed,
  };
}
