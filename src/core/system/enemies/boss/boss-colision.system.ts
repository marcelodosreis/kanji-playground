import type { Boss } from "../../../../types/boss.interface";
import type { Engine } from "../../../../types/engine.type";
import { ENGINE_DEFAULT_EVENTS } from "../../../../types/events.enum";
import { GLOBAL_STATE } from "../../../../types/global-state.enum";
import type { Player } from "../../../../types/player.interface";
import { HITBOX_TAGS, TAGS } from "../../../../types/tags.enum";
import { createBlink } from "../../../../utils/create-blink";
import { createNotification } from "../../../../utils/create-notification";
import { GLOBAL_STATE_CONTROLLER } from "../../../global-state-controller";

type Params = {
  engine: Engine;
  boss: Boss;
  player: Player;
};

export function BossCollisionSystem({ engine, boss, player }: Params) {
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
      handleBossDefeat(engine, boss);
    }
  }

  function updateGlobalStateOnBossDefeat(): void {
    GLOBAL_STATE_CONTROLLER.set(GLOBAL_STATE.IS_BOSS_DEFEATED, true);
    GLOBAL_STATE_CONTROLLER.set(GLOBAL_STATE.IS_DOUBLE_JUMP_UNLOCKED, true);
  }

  function disableBossCollisions(boss: Boss): void {
    boss.collisionIgnore = [TAGS.PLAYER];
    boss.unuse("body");
  }

  async function showAbilityUnlockedNotification(engine: Engine): Promise<void> {
    await engine.wait(0.5);
    const notification = engine.add(
      createNotification(
        engine,
        "You unlocked a new ability!\nYou can now double jump."
      )
    );
    engine.wait(3, () => notification.close());
  }

  function handleBossDefeat(engine: Engine, boss: Boss): void {
    updateGlobalStateOnBossDefeat();
    disableBossCollisions(boss);
    showAbilityUnlockedNotification(engine);
  }

  boss.onCollide(TAGS.PLAYER, onPlayerCollision);
  boss.onCollide(HITBOX_TAGS.PLAYER_SWORD, onSwordHitboxCollision);
  boss.on(ENGINE_DEFAULT_EVENTS.HURT, onHurt);
}
