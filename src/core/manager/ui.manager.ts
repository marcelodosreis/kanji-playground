import type { Engine } from "../../types/engine.interface";
import { HealthBarSystem } from "../system/health-bar.system";

type SetupUIParams = {
  engine: Engine;
};

export class UIManager {
  public static setup({ engine }: SetupUIParams): void {
    HealthBarSystem({ engine });
  }
}
