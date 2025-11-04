import type { EngineGameObj, MapEngineGameObj } from "./engine.interface";

export type Map = MapEngineGameObj;

export interface BossBarrier extends EngineGameObj {
    opacity: number;
}