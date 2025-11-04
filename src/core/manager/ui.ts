import type { Engine, EngineGameObj } from "../../types/engine";
import { healthBar } from "../../utils/create-health-bar";

type SetupHealthBarParams = {
  engine: Engine;
};

export class UIManager {
  static setupHealthBar(params: SetupHealthBarParams): void {
    const { engine } = params;

    const hb: EngineGameObj = healthBar;
    hb.setEvents();
    hb.trigger("update");
    engine.add(hb);
  }
}
