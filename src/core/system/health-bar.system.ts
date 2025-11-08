import type { Engine } from "../../types/engine.interface";
import { GLOBAL_STATE } from "../../types/state.interface";
import { HealthBarEntity } from "../entities/health-bar.entity";
import { GLOBAL_STATE_CONTROLLER } from "../global-state-controller";

type Params = {
  engine: Engine;
};

type HPFrameMapping = Record<number, number>;

const HP_FRAME_MAPPING: HPFrameMapping = {
  1: 2,
  2: 1,
  3: 0,
};

const getFrameForHP = (hp: number): number => HP_FRAME_MAPPING[hp] ?? 0;

const shouldDestroyHealthBar = (hp: number): boolean => hp === 0;

export function HealthBarSystem({ engine }: Params): void {
  const healthBar = HealthBarEntity(engine);

  const updateHealthBarFrame = (hp: number): void => {
    if (shouldDestroyHealthBar(hp)) {
      engine.destroy(healthBar);
      return;
    }

    healthBar.frame = getFrameForHP(hp);
  };

  const handleHealthChange = (newHP: number): void => {
    updateHealthBarFrame(newHP);
  };

  GLOBAL_STATE_CONTROLLER.subscribe(GLOBAL_STATE.PLAYER_HP, handleHealthChange);

  const initialHP = GLOBAL_STATE_CONTROLLER.current()[GLOBAL_STATE.PLAYER_HP];
  updateHealthBarFrame(initialHP);

  engine.add(healthBar);
}
