import type { Engine, EngineGameObj } from "../../types/engine.interface";
import { GLOBAL_STATE } from "../../types/state.interface";
import { state } from "../global-state-controller";

type SetupHealthBarParams = {
  engine: Engine;
};

export class UIManager {
  public static setup({ engine }: SetupHealthBarParams): void {
    const healthBar = this.createHealthBar(engine);
    this.initializeHealthBar(engine, healthBar);
  }

  private static createHealthBar(engine: Engine): EngineGameObj {
    const healthBar = engine.make([
      engine.sprite("healthBar", { frame: 0 }),
      engine.fixed(),
      engine.pos(10, -10),
      engine.scale(3),
      this.createHealthBarBehavior(engine),
    ]);
    return healthBar;
  }

  private static createHealthBarBehavior(engine: Engine) {
    return {
      hpMapping: {
        1: 2,
        2: 1,
        3: 0,
      },
      setEvents(this: EngineGameObj) {
        this.on("update", () => {
          const currentHp = state.current()[GLOBAL_STATE.PLAYER_HP];
          if (currentHp === 0) {
            engine.destroy(this);
            return;
          }
          this.frame = this.hpMapping[currentHp];
        });
      },
    };
  }

  private static initializeHealthBar(
    engine: Engine,
    healthBar: EngineGameObj
  ): void {
    healthBar.setEvents();
    healthBar.trigger("update");
    engine.add(healthBar);
  }
}
