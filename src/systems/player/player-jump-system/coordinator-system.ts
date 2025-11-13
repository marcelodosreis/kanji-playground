import type { Player } from "../../../types/player.interface";
import { PlayerFirstJumpSystem } from "./first-jump-system";
import { PlayerDoubleJumpSystem } from "./double-jump-system";

type JumpCoordinatorParams = {
  player: Player;
  onJumpExecuted: () => void;
};

export function PlayerJumpCoordinatorSystem({
  player,
  onJumpExecuted,
}: JumpCoordinatorParams) {
  const firstJumpSystem = PlayerFirstJumpSystem({
    player,
    onJumpExecuted: () => {
      doubleJumpSystem.notifyFirstJumpExecuted();
      onJumpExecuted();
    },
  });

  const doubleJumpSystem = PlayerDoubleJumpSystem({
    player,
    onJumpExecuted,
    getLastJumpTimestamp: firstJumpSystem.getLastJumpTimestamp,
    getLastReleaseTimestamp: firstJumpSystem.getLastReleaseTimestamp,
  });

  const handleJumpPress = (): void => {
    const didFirstJump = firstJumpSystem.executeFirstJump();
    if (didFirstJump) {
      return;
    }

    const didDoubleJump = doubleJumpSystem.executeDoubleJump();
    if (didDoubleJump) {
      return;
    }
  };

  const handleJumpRelease = (): void => {
    firstJumpSystem.handleJumpRelease();
  };

  const resetEachFrame = (): void => {
    firstJumpSystem.resetEachFrame();
    doubleJumpSystem.resetEachFrame();
  };

  return {
    handleJumpPress,
    handleJumpRelease,
    resetEachFrame,
  };
}
