import type { Engine } from "../../types/engine.type";
import type { Player } from "../../types/player.interface";
import { isPaused } from "../../utils/is-paused";

type Params = {
  engine: Engine;
  player: Player;
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

const INPUT_KEYS = {
  MOVE_LEFT: "left",
  MOVE_RIGHT: "right",
  JUMP: "x",
  ATTACK: "z",
} as const;

export function PlayerInputSystem({ engine, player }: Params) {
  player.controlHandlers = player.controlHandlers || [];

  const state: InputState = {
    callbacks: {},
  };

  const registerCallbacks = (callbacks: Partial<InputCallbacks>): void => {
    state.callbacks = { ...state.callbacks, ...callbacks };
  };

  const handleKeyDown = (key: string): void => {
    if (isPaused()) return;

    if (key === INPUT_KEYS.MOVE_LEFT && state.callbacks.onMoveLeft) {
      state.callbacks.onMoveLeft();
    }

    if (key === INPUT_KEYS.MOVE_RIGHT && state.callbacks.onMoveRight) {
      state.callbacks.onMoveRight();
    }

    if (key === INPUT_KEYS.JUMP && state.callbacks.onJumpPress) {
      state.callbacks.onJumpPress();
    }
  };

  const handleKeyPress = async (key: string): Promise<void> => {
    if (isPaused()) return;

    if (key === INPUT_KEYS.ATTACK && state.callbacks.onAttack) {
      state.callbacks.onAttack();
    }
  };

  const handleKeyRelease = (key: string): void => {
    if (key === INPUT_KEYS.JUMP && state.callbacks.onJumpRelease) {
      state.callbacks.onJumpRelease();
    }
  };

  const isMovementKeyPressed = (): boolean => {
    return (
      engine.isKeyDown(INPUT_KEYS.MOVE_LEFT) ||
      engine.isKeyDown(INPUT_KEYS.MOVE_RIGHT)
    );
  };

  player.controlHandlers.push(engine.onKeyDown(handleKeyDown));
  player.controlHandlers.push(engine.onKeyPress(handleKeyPress));
  player.controlHandlers.push(engine.onKeyRelease(handleKeyRelease));

  return {
    registerCallbacks,
    isMovementKeyPressed,
  };
}
