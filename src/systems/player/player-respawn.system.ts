import type { Engine } from "../../types/engine.type";
import type { Player } from "../../types/player.interface";
import type { PlayerSystemWithAPI } from "../../types/player-system.interface";
import { LEVEL_SCENES } from "../../types/scenes.enum";
import {
  AnimationChecks,
  AnimationFrameChecks,
} from "../../utils/animation.utils";
import { PLAYER_CONFIG } from "../../constansts/player.constat";
import {
  isPlayerInBossFightAtom,
  maxPlayerHpAtom,
  playerHpAtom,
  store,
} from "../../stores";

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
  store.set(isPlayerInBossFightAtom, false);
};

const shouldRespawnWithFullLife = (currentHp: number): boolean =>
  currentHp <= RESPAWN_CONFIG.minHpForFullRespawn;

const isDeathAnimationComplete = (anim: string, frame: number): boolean =>
  AnimationChecks.isExplode(anim) &&
  AnimationFrameChecks.isAtFrame(frame, RESPAWN_CONFIG.explodeLastFrame);

export function PlayerRespawnSystem({
  engine,
  player,
  destinationName,
  previousSceneData,
}: Params): PlayerSystemWithAPI<RespawnSystemAPI> {
  const respawnAtStartWithFullLife = async (): Promise<void> => {
    exitBossFight();

    engine.go(LEVEL_SCENES.ROOM_001, { exitName: null });
    store.set(playerHpAtom, store.get(maxPlayerHpAtom));
  };

  const respawnAtCurrentRoom = (): void => {
    store.set(playerHpAtom, store.get(playerHpAtom) - 1);
    engine.go(destinationName, previousSceneData);
  };

  const handleOutOfBounds = async (): Promise<void> => {
    if (shouldRespawnWithFullLife(store.get(playerHpAtom))) {
      respawnAtStartWithFullLife();
    } else {
      respawnAtCurrentRoom();
    }
  };

  const handleDeathAnimation = async (anim: string): Promise<void> => {
    if (!isDeathAnimationComplete(anim, player.animFrame)) {
      return;
    }

    await respawnAtStartWithFullLife();
  };

  player.on("outOfBounds", handleOutOfBounds);
  player.onAnimEnd(handleDeathAnimation);

  return {
    handleOutOfBounds,
    handleDeathAnimation,
  };
}
