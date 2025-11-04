import type { EngineGameObj, MapEngineGameObj } from "./engine";

export type Map = MapEngineGameObj;

export interface BossBarrier extends EngineGameObj {
    opacity: number;
}