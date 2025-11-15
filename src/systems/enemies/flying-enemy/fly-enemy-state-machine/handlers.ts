import { FLYING_ENEMY_EVENTS } from "../../../../types/events.enum";
import type { FlyingEnemyContextWithMachine } from ".";

export const createStateHandlers = () => ({
  [FLYING_ENEMY_EVENTS.IDLE]: (_ctx: FlyingEnemyContextWithMachine): void => {},

  [FLYING_ENEMY_EVENTS.PATROL_RIGHT]: (
    _ctx: FlyingEnemyContextWithMachine
  ): void => {},

  [FLYING_ENEMY_EVENTS.PATROL_LEFT]: (
    _ctx: FlyingEnemyContextWithMachine
  ): void => {},

  [FLYING_ENEMY_EVENTS.ALERT]: (
    _ctx: FlyingEnemyContextWithMachine
  ): void => {},

  [FLYING_ENEMY_EVENTS.ATTACK]: (
    _ctx: FlyingEnemyContextWithMachine
  ): void => {},

  [FLYING_ENEMY_EVENTS.RETURN]: (
    _ctx: FlyingEnemyContextWithMachine
  ): void => {},

  [FLYING_ENEMY_EVENTS.EXPLODE]: (ctx: FlyingEnemyContextWithMachine): void => {
    ctx.enemy.collisionIgnore = ["player"];
    ctx.enemy.unuse("body");
  },
});
