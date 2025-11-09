import type { Boss } from "../../../../types/boss.interface";
import type { Engine } from "../../../../types/engine.type";
import { BOSS_EVENTS } from "../../../../types/events.enum";
import type { Player } from "../../../../types/player.interface";
import { isPaused } from "../../../../utils/is-paused";
import { GLOBAL_STATE_CONTROLLER } from "../../../global-state-controller";
import type { BossStateMachine } from "./boss-state-machine";

type Params = {
  engine: Engine;
  boss: Boss;
  player: Player;
  stateMachine: BossStateMachine;
};

export function BossAttackSystem({ engine, boss, player, stateMachine }: Params) {
  function idleUpdate() {
    if (GLOBAL_STATE_CONTROLLER.current().isPlayerInBossFight) {
      stateMachine.dispatch(BOSS_EVENTS.RUN);
    }
  }

  function runUpdate() {
    if (isPaused()) return;

    boss.flipX = player.pos.x <= boss.pos.x;
    boss.moveTo(
      engine.vec2(player.pos.x, player.pos.y + 12),
      boss.pursuitSpeed
    );

    if (boss.pos.dist(player.pos) < boss.fireRange) {
      stateMachine.dispatch(BOSS_EVENTS.OPEN_FIRE);
    }
  }

  engine.onUpdate(() => {
    if (boss.hp() <= 0 || isPaused()) return;

    if (stateMachine.isIdle()) {
      idleUpdate();
    } else if (stateMachine.isRunning()) {
      runUpdate();
    }
  });
}
