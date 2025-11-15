import type { Player } from "../../../types/player.interface";
import type { PlayerStateMachine } from "../player-state-machine";
import { PlayerFirstJumpSystem } from "./player-first-jump.system";
import { PlayerDoubleJumpSystem } from "./player-double-jump.system";

type JumpCoordinatorParams = {
  player: Player;
  stateMachine: PlayerStateMachine;
  onJumpExecuted: () => void;
};

export function PlayerJumpCoordinatorSystem({
  player,
  stateMachine,
  onJumpExecuted,
}: JumpCoordinatorParams) {
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

  const updateEachFrame = (): void => {
    firstJumpSystem.updateEachFrame();
    doubleJumpSystem.updateEachFrame();
  };

  return {
    handleJumpPress,
    handleJumpRelease,
    updateEachFrame,
  };
}
