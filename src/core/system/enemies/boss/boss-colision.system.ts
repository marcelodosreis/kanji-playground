import type { Boss } from "../../../../types/boss.interface";
import type { Engine } from "../../../../types/engine.type";
import {
  BOSS_EVENTS,
  ENGINE_DEFAULT_EVENTS,
} from "../../../../types/events.enum";
import { GLOBAL_STATE } from "../../../../types/global-state.enum";
import type { Player } from "../../../../types/player.interface";
import { HITBOX_TAGS, TAGS } from "../../../../types/tags.enum";
import { createBlink } from "../../../../utils/create-blink";
import { createNotification } from "../../../../utils/create-notification";
import { GLOBAL_STATE_CONTROLLER } from "../../../global-state-controller";
import type { BossStateMachine } from "./boss-state-machine";

type Params = {
  engine: Engine;
  boss: Boss;
  player: Player;
  stateMachine: BossStateMachine;
};

export function BossCollisionSystem({ engine, boss, player, stateMachine }: Params) {
  function onPlayerCollision(): void {
    if (boss.hp() <= 0 || boss.isKnockedBack) return;
    player.hurt(1, boss);
  }

  function onSwordHitboxCollision(): void {
    boss.hurt(1);
  }

  function onHurt(): void {
    createBlink(engine, boss);

    if (boss.hp() <= 0) {
      explode();
    }
  }

  function explode(): void {
    GLOBAL_STATE_CONTROLLER.set(GLOBAL_STATE.IS_BOSS_DEFEATED, true);
    GLOBAL_STATE_CONTROLLER.set(GLOBAL_STATE.IS_DOUBLE_JUMB_UNLOCKED, true);

    stateMachine.dispatch(BOSS_EVENTS.EXPLODE);

    boss.play("explode");

    boss.collisionIgnore = [TAGS.PLAYER];
    boss.unuse("body");

    const notification = engine.add(
      createNotification(
        engine,
        "You unlocked a new ability!\nYou can now double jump."
      )
    );
    engine.wait(3, () => notification.close());
  }

  boss.onCollide(TAGS.PLAYER, onPlayerCollision);
  boss.onCollide(HITBOX_TAGS.PLAYER_SWORD, onSwordHitboxCollision);
  boss.on(ENGINE_DEFAULT_EVENTS.HURT, onHurt);
}