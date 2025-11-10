import type { Engine } from "../../../../types/engine.type";
import type { Player } from "../../../../types/player.interface";
import { type PlayerStateMachine } from "../player-state-machine";
import { PlayerJumpInputSystem } from "./jump-input-system";
import { PlayerJumpCoordinatorSystem } from "./coordinator-system";
import { PlayerJumpAnimationSystem } from "./jump-animation-system";
import { PlayerJumpPhysicsSystem } from "./jump-physics-system";

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
  player.controlHandlers = player.controlHandlers || [];

  const animationSystem = PlayerJumpAnimationSystem({ player, stateMachine });
  PlayerJumpPhysicsSystem({ player });

  const coordinatorSystem = PlayerJumpCoordinatorSystem({
    player,
    onJumpExecuted: () => {
      stateMachine.dispatch("JUMP");
    },
  });

  PlayerJumpInputSystem({
    engine,
    player,
    onJumpPressed: coordinatorSystem.handleJumpPress,
    onJumpReleased: coordinatorSystem.handleJumpRelease,
  });

  engine.onUpdate(() => {
    coordinatorSystem.resetEachFrame();
    animationSystem.updateAnimationState();
  });
}
