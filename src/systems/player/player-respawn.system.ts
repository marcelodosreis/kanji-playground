import type { Engine } from "../../types/engine.type";
import type { Player } from "../../types/player.interface";
import type { PlayerSystemWithAPI } from "../../types/player-system.interface";
import { LEVEL_SCENES } from "../../types/scenes.enum";
import { GLOBAL_STATE } from "../../types/global-state.enum";
import { screenFadeIn } from "../../utils/screen-fade-in";
import { GLOBAL_STATE_CONTROLLER } from "../../core/global-state-controller";
import {
  AnimationChecks,
  AnimationFrameChecks,
} from "../../utils/animation.utils";
import { PLAYER_CONFIG } from "../../constansts/player.constat";

type Params = {
  engine: Engine;
  player: Player;
  destinationName: string;
  previousSceneData: { exitName?: string };
};

type RespawnSystemAPI = {
  handleOutOfBounds: () => void;
  handleDeathAnimation: (anim: string) => Promise<void>;
};

const RESPAWN_CONFIG = {
  minHpForFullRespawn: PLAYER_CONFIG.respawn.minHpForFullRespawn,
  explodeLastFrame: PLAYER_CONFIG.animation.explodeLastFrame,
  deathWaitSeconds: PLAYER_CONFIG.respawn.deathWaitSeconds,
  fadeDurationSeconds: PLAYER_CONFIG.respawn.fadeDurationSeconds,
  outOfBoundsPenalty: PLAYER_CONFIG.respawn.outOfBoundsPenalty,
};

const exitBossFight = (): void => {
  GLOBAL_STATE_CONTROLLER.set(GLOBAL_STATE.IS_PLAYER_IN_BOSS_FIGHT, false);
};

const shouldRespawnWithFullLife = (currentHp: number): boolean =>
  currentHp <= RESPAWN_CONFIG.minHpForFullRespawn;

const isDeathAnimationComplete = (anim: string, frame: number): boolean =>
  AnimationChecks.isExplode(anim) &&
  AnimationFrameChecks.isAtFrame(frame, RESPAWN_CONFIG.explodeLastFrame);

const delay = (seconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

export function PlayerRespawnSystem({
  engine,
  player,
  destinationName,
  previousSceneData,
}: Params): PlayerSystemWithAPI<RespawnSystemAPI> {
  const respawnAtStartWithFullLife = async (): Promise<void> => {
    exitBossFight();

    await screenFadeIn({
      engine,
      durationSeconds: RESPAWN_CONFIG.fadeDurationSeconds,
    });

    engine.go(LEVEL_SCENES.ROOM_001, { exitName: null });
  };

  const respawnAtCurrentRoom = (): void => {
    engine.go(destinationName, previousSceneData);
  };

  const handleOutOfBounds = async (): Promise<void> => {
    if (shouldRespawnWithFullLife(player.hp())) {
      await respawnAtStartWithFullLife();
    } else {
      respawnAtCurrentRoom();
    }
  };

  const handleDeathAnimation = async (anim: string): Promise<void> => {
    if (!isDeathAnimationComplete(anim, player.animFrame)) {
      return;
    }

    await delay(RESPAWN_CONFIG.deathWaitSeconds);
    await respawnAtStartWithFullLife();
  };

  player.on("outOfBounds", handleOutOfBounds);
  player.onAnimEnd(handleDeathAnimation);

  return {
    handleOutOfBounds,
    handleDeathAnimation,
  };
}
