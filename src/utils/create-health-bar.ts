import { engine } from "../core/engine";
import { state } from "../core/state";
import type { Engine, EngineGameObj } from "../types/engine";

function createHealthBar(engine: Engine) {
  return engine.make([
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
}

export const healthBar = createHealthBar(engine);
