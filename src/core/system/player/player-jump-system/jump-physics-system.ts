import type { Player } from "../../../../types/player.interface";
import { GLOBAL_STATE } from "../../../../types/global-state.enum";
import { GLOBAL_STATE_CONTROLLER } from "../../../global-state-controller";

type PhysicsState = {
  savedVelocityX: number;
  savedVelocityY: number;
  originalGravityScale: number;
};

type JumpPhysicsParams = {
  player: Player;
};

export function PlayerJumpPhysicsSystem({ player }: JumpPhysicsParams) {
  const physicsState: PhysicsState = {
    savedVelocityX: 0,
    savedVelocityY: 0,
    originalGravityScale: player.gravityScale,
  };

  const savePhysicsState = (): void => {
    physicsState.savedVelocityX = player.vel.x;
    physicsState.savedVelocityY = player.vel.y;
    physicsState.originalGravityScale = player.gravityScale;
  };

  const restorePhysicsState = (): void => {
    player.vel.x = physicsState.savedVelocityX;
    player.vel.y = physicsState.savedVelocityY;
    player.gravityScale = physicsState.originalGravityScale;
  };

  const freezePhysics = (): void => {
    player.vel.x = 0;
    player.vel.y = 0;
    player.gravityScale = 0;
  };

  const handlePauseChange = (isPaused: boolean): void => {
    if (isPaused) {
      savePhysicsState();
      freezePhysics();
    } else {
      restorePhysicsState();
    }
  };

  GLOBAL_STATE_CONTROLLER.subscribe(GLOBAL_STATE.IS_PAUSED, handlePauseChange);

  return {
    handlePauseChange,
  };
}
