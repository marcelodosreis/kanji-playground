import type { EngineGameObj, MapEngineGameObj } from "./engine.type";

export type Map = MapEngineGameObj;

export interface BossBarrier extends EngineGameObj {
    opacity: number;
}