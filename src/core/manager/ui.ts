import type { Engine, EngineGameObj } from "../../types/engine";
import { state } from "../state";

type SetupHealthBarParams = {
  engine: Engine;
};

export class UIManager {
  static setupHealthBar(params: SetupHealthBarParams): void {
    const healthBar = this.createHealthBar(params.engine);
    this.initializeHealthBar(params.engine, healthBar);
  }

  private static createHealthBar(engine: Engine): EngineGameObj {
    return engine.make([
      engine.sprite("healthBar", { frame: 0 }),
      engine.fixed(),
      engine.pos(10, -10),
      engine.scale(3),
      this.createHealthBarBehavior(engine),
    ]);
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
          const currentHp = state.current().playerHp;
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
