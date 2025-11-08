import type { EngineGameObj } from "../../../types/engine.type";

export function bindHoverTriggers(container: EngineGameObj) {
  container.onHover(() => {
    container.trigger("hoverenter");
  });
  container.onHoverEnd(() => {
    container.trigger("hoverleave");
  });
}
