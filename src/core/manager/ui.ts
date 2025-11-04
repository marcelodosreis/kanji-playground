import type { Engine, EngineGameObj } from "../../types/engine";
import { state } from "../state";

type SetupHealthBarParams = {
  engine: Engine;
};

export class UIManager {
  static setupHealthBar(params: SetupHealthBarParams): void {
    const { engine } = params;

    const healthBar = engine.make([
      engine.sprite("healthBar", { frame: 0 }),
      engine.fixed(),
      engine.pos(10, -10),
      engine.scale(3),
      {
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
      },
    ]);

    const hb: EngineGameObj = healthBar;
    hb.setEvents();
    hb.trigger("update");
    engine.add(hb);
  }
}
