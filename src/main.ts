import { engine } from "./lib/engine";
import { room001 } from "./scenes/room-001";
import { room002 } from "./scenes/room-002";

engine.scene("intro", () => null);
engine.scene("room001", () => room001(engine));
engine.scene("room002", () => room002(engine));

engine.go("room001");