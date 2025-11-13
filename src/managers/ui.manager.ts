import type { Engine, EngineGameObj } from "../types/engine.type";
import { GLOBAL_STATE } from "../types/global-state.enum";
import { HealthBarEntity } from "../entities/health-bar.entity";
import { GLOBAL_STATE_CONTROLLER } from "../core/global-state-controller";

type SetupUIParams = {
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

export class UIManager {
  private readonly engine: Engine;
  private healthBar: EngineGameObj | null = null;

  private constructor(params: SetupUIParams) {
    this.engine = params.engine;
  }

  public static setup(params: SetupUIParams): void {
    const manager = new UIManager(params);
    manager.initialize();
  }

  private initialize(): void {
    this.healthBarSystem();
  }

  private healthBarSystem(): void {
    this.healthBar = HealthBarEntity(this.engine);
    this.engine.add(this.healthBar);

    const healthBar = this.healthBar;

    const updateHealthBarFrame = (hp: number): void => {
      if (shouldDestroyHealthBar(hp)) {
        this.engine.destroy(healthBar);
        return;
      }

      healthBar.frame = getFrameForHP(hp);
    };

    const handleHealthChange = (newHP: number): void => {
      updateHealthBarFrame(newHP);
    };

    GLOBAL_STATE_CONTROLLER.subscribe(
      GLOBAL_STATE.PLAYER_HP,
      handleHealthChange
    );

    const initialHP = GLOBAL_STATE_CONTROLLER.current()[GLOBAL_STATE.PLAYER_HP];
    updateHealthBarFrame(initialHP);
  }
}
