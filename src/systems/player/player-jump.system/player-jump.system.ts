import type { Engine } from "../../../types/engine.type";
import type { Player } from "../../../types/player.interface";
import { type PlayerStateMachine } from "../player-state-machine";
import { PlayerJumpCoordinatorSystem } from "./player-jump-coordinator.system";
import { PlayerJumpAnimationSystem } from "./player-jump-animation.system";
import { PlayerJumpPhysicsSystem } from "./player-jump-physics.system";

type JumpSystemParams = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
};

export function PlayerJumpSystem({
  engine,
  player,
  stateMachine,
}: JumpSystemParams) {
  const animationSystem = PlayerJumpAnimationSystem({ player, stateMachine });
  PlayerJumpPhysicsSystem({ player });

  const coordinatorSystem = PlayerJumpCoordinatorSystem({
    player,
    onJumpExecuted: () => {
      stateMachine.dispatch("JUMP");
    },
  });

  engine.onUpdate(() => {
    coordinatorSystem.resetEachFrame();
    animationSystem.updateAnimationState();
  });

  return {
    handleJumpPress: coordinatorSystem.handleJumpPress,
    handleJumpRelease: coordinatorSystem.handleJumpRelease,
  };
}
