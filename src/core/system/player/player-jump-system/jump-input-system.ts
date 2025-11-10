import type { Engine } from "../../../../types/engine.type";
import type { Player } from "../../../../types/player.interface";

type JumpInputParams = {
  engine: Engine;
  player: Player;
  onJumpPressed: () => void;
  onJumpReleased: () => void;
};

const JUMP_KEY = "x";

export function PlayerJumpInputSystem({
  engine,
  player,
  onJumpPressed,
  onJumpReleased,
}: JumpInputParams) {
  const isJumpKey = (key: string): boolean => {
    return key === JUMP_KEY;
  };

  const handleKeyDown = (key: string): void => {
    if (!isJumpKey(key)) {
      return;
    }
    onJumpPressed();
  };

  const handleKeyRelease = (key: string): void => {
    if (!isJumpKey(key)) {
      return;
    }
    onJumpReleased();
  };

  player.controlHandlers.push(engine.onKeyDown(handleKeyDown));
  player.controlHandlers.push(engine.onKeyRelease(handleKeyRelease));
}