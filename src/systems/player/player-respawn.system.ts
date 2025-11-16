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
  isScreenFadeOnAtom,
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

const shouldRespawnWithFullLife = (hp: number): boolean =>
  hp <= RESPAWN_CONFIG.minHpForFullRespawn;

const isDeathAnimationComplete = (anim: string, frame: number): boolean =>
  AnimationChecks.isExplode(anim) &&
  AnimationFrameChecks.isAtFrame(frame, RESPAWN_CONFIG.explodeLastFrame);

export function PlayerRespawnSystem({
  engine,
  player,
  destinationName,
  previousSceneData,
}: Params): PlayerSystemWithAPI<RespawnSystemAPI> {
  const setPlayerHp = (hp: number) => store.set(playerHpAtom, hp);
  const getPlayerHp = () => store.get(playerHpAtom);

  const exitBossFight = () => {
    store.set(isPlayerInBossFightAtom, false);
  };

  const respawnAtStart = async () => {
    store.set(isScreenFadeOnAtom, true);
    exitBossFight();
    await engine.wait(1);
    engine.go(LEVEL_SCENES.ROOM_001, { exitName: null });
    setPlayerHp(store.get(maxPlayerHpAtom));
    store.set(isScreenFadeOnAtom, false);
  };

  const respawnAtCurrentRoom = () => {
    setPlayerHp(getPlayerHp() - 1);
    engine.go(destinationName, previousSceneData);
  };

  const handleOutOfBounds = async () => {
    const playerHp = getPlayerHp();
    if (shouldRespawnWithFullLife(playerHp)) {
      setPlayerHp(playerHp - 1);
      await respawnAtStart();
    } else {
      respawnAtCurrentRoom();
    }
  };

  const handleDeathAnimation = async (anim: string) => {
    if (!isDeathAnimationComplete(anim, player.animFrame)) return;
    await respawnAtStart();
  };

  player.on("outOfBounds", handleOutOfBounds);
  player.onAnimEnd(handleDeathAnimation);

  return {
    handleOutOfBounds,
    handleDeathAnimation,
  };
}
