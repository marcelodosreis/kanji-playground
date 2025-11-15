import type { Engine } from "../../../types/engine.type";
import type { Player } from "../../../types/player.interface";
import type { PlayerStateMachine } from "../player-state-machine";
import { PlayerStateTransition } from "../player-state-machine";
import type { PlayerSystemWithAPI } from "../../../types/player-system.interface";
import { PlayerFirstJumpSystem } from "./player-first-jump.system";
import { PlayerDoubleJumpSystem } from "./player-double-jump.system";

type Params = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
};

type JumpSystemAPI = {
  handleJumpPress: () => void;
  handleJumpRelease: () => void;
};

const shouldTransitionToJump = (): boolean => true;

export function PlayerJumpSystem({
  engine,
  player,
  stateMachine,
}: Params): PlayerSystemWithAPI<JumpSystemAPI> {
  const onJumpExecuted = (): void => {
    if (shouldTransitionToJump()) {
      stateMachine.transitionTo(PlayerStateTransition.JUMP);
    }
  };

  const firstJumpSystem = PlayerFirstJumpSystem({
    player,
    stateMachine,
    onJumpExecuted: () => {
      doubleJumpSystem.notifyFirstJumpExecuted();
      onJumpExecuted();
    },
  });

  const doubleJumpSystem = PlayerDoubleJumpSystem({
    player,
    stateMachine,
    onJumpExecuted,
    getLastJumpTimestamp: firstJumpSystem.getLastJumpTimestamp,
    getLastReleaseTimestamp: firstJumpSystem.getLastReleaseTimestamp,
  });

  const handleJumpPress = (): void => {
    const didFirstJump = firstJumpSystem.executeFirstJump();
    if (didFirstJump) return;

    const didDoubleJump = doubleJumpSystem.executeDoubleJump();
    if (didDoubleJump) return;
  };

  const handleJumpRelease = (): void => {
    firstJumpSystem.handleJumpRelease();
  };

  const updateJumpState = (): void => {
    firstJumpSystem.updateEachFrame();
    doubleJumpSystem.updateEachFrame();
  };

  const update = (): void => {
    updateJumpState();
  };

  engine.onUpdate(update);

  return {
    handleJumpPress,
    handleJumpRelease,
    update,
  };
}
