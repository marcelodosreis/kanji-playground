import { PLAYER_ANIMATIONS } from "../../types/animations.enum";
import type { Engine } from "../../types/engine.type";
import type { Player } from "../../types/player.interface";
import { LEVEL_SCENES } from "../../types/scenes.enum";
import { GLOBAL_STATE } from "../../types/global-state.enum";
import { screenFadeIn } from "../../utils/screen-fade-in";
import { GLOBAL_STATE_CONTROLLER } from "../../core/global-state-controller";

type Params = {
  engine: Engine;
  player: Player;
  destinationName: string;
  previousSceneData: { exitName?: string };
};

const RESPAWN_CONFIG = {
  MIN_HP_FOR_FULL_RESPAWN: 1,
  EXPLODE_LAST_FRAME: 109,
  DEATH_WAIT_SECONDS: 2,
  FADE_DURATION_SECONDS: 0.4,
};

const getHealthState = () => ({
  current: GLOBAL_STATE_CONTROLLER.current()[GLOBAL_STATE.PLAYER_HP],
  max: GLOBAL_STATE_CONTROLLER.current()[GLOBAL_STATE.MAX_PLAYER_HP],
});

const setPlayerHP = (hp: number): void => {
  GLOBAL_STATE_CONTROLLER.set(GLOBAL_STATE.PLAYER_HP, hp);
};

const shouldRespawnWithFullLife = (currentHp: number): boolean =>
  currentHp <= RESPAWN_CONFIG.MIN_HP_FOR_FULL_RESPAWN;

const isExplodeAnimation = (anim: string): boolean =>
  anim === PLAYER_ANIMATIONS.EXPLODE;

export function PlayerRespawnSystem({
  engine,
  player,
  destinationName,
  previousSceneData,
}: Params) {
  const respawnPlayerFullLife = (maxHp: number): void => {
    setPlayerHP(maxHp);
    GLOBAL_STATE_CONTROLLER.set(GLOBAL_STATE.IS_PLAYER_IN_BOSS_FIGHT, false);
    engine.go(LEVEL_SCENES.ROOM_001, { exitName: null });
  };

  const handleOutOfBounds = (): void => {
    const { current, max } = getHealthState();

    if (shouldRespawnWithFullLife(current)) {
      respawnPlayerFullLife(max);
    } else {
      setPlayerHP(current - 1);
      engine.go(destinationName, previousSceneData);
    }
  };

  const handleDeathRespawn = async (anim: string): Promise<void> => {
    if (
      !isExplodeAnimation(anim) ||
      player.animFrame !== RESPAWN_CONFIG.EXPLODE_LAST_FRAME
    ) {
      return;
    }

    const { max } = getHealthState();
    await engine.wait(RESPAWN_CONFIG.DEATH_WAIT_SECONDS);
    await screenFadeIn({
      engine,
      durationSeconds: RESPAWN_CONFIG.FADE_DURATION_SECONDS,
    });
    respawnPlayerFullLife(max);
  };

  player.on("outOfBounds", handleOutOfBounds);
  player.onAnimEnd(handleDeathRespawn);
}
