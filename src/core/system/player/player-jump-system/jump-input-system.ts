import type { Engine } from "../../../../types/engine.type";
import type { Player } from "../../../../types/player.interface";
import { type PlayerStateMachine } from "../player-state-machine";
import { isPaused } from "../../../../utils/is-paused";

type JumpInputParams = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
  onJumpRequested: () => void;
};

const JUMP_KEY = "x";

export function PlayerJumpInputSystem({
  engine,
  player,
  stateMachine,
  onJumpRequested,
}: JumpInputParams) {
  const isJumpKey = (key: string): boolean => key === JUMP_KEY;

  const canInitiateJump = (): boolean => !isPaused() && stateMachine.canMove();

  const handleJumpKey = async (key: string): Promise<void> => {
    if (isJumpKey(key) && canInitiateJump()) {
      onJumpRequested();
    }
  };

  player.controlHandlers.push(engine.onKeyPress(handleJumpKey));
}
