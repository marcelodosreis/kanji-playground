import type { Engine } from "../../../../types/engine.type";
import type { Player } from "../../../../types/player.interface";
import { type PlayerStateMachine } from "../player-state-machine";
import { PlayerJumpInputSystem } from "./jump-input-system";
import { PlayerJumpLogicSystem } from "./jump-logic-system";
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


  PlayerJumpPhysicsSystem({ player });
  const animationSystem = PlayerJumpAnimationSystem({ player, stateMachine });

  const logicSystem = PlayerJumpLogicSystem({
    player,
    onJumpExecuted: () => {
      stateMachine.dispatch("JUMP");
    },
  });

  PlayerJumpInputSystem({
    engine,
    player,
    stateMachine,
    onJumpRequested: logicSystem.handleJumpRequest,
  });

  engine.onUpdate(() => {
    logicSystem.resetJumpsOnLanding();
    animationSystem.updateAnimationState();
  });
}
