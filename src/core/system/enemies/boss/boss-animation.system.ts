import type { Engine } from "../../../../types/engine.type";
import type { Boss } from "../../../../types/boss.interface";
import { BOSS_EVENTS, ENGINE_DEFAULT_EVENTS } from "../../../../types/events.enum";
import type { BossStateMachine } from "./boss-state-machine";
import { BURNER_ANIMATIONS } from "../../../../types/animations.enum";

type Params = {
  engine: Engine;
  boss: Boss;
  stateMachine: BossStateMachine;
};

export function BossAnimationSystem({ engine, boss, stateMachine }: Params) {
  engine.onUpdate(() => {
    if (boss.hp() <= 0) return;

    const state = stateMachine.getState();

    let desiredAnim: BURNER_ANIMATIONS;

    switch (state) {
      case BOSS_EVENTS.IDLE:
        desiredAnim = BURNER_ANIMATIONS.IDLE;
        break;
      case BOSS_EVENTS.RUN:
        desiredAnim = BURNER_ANIMATIONS.RUN;
        break;
      case BOSS_EVENTS.OPEN_FIRE:
        desiredAnim = BURNER_ANIMATIONS.OPEN_FIRE;
        break;
      case BOSS_EVENTS.FIRE:
        desiredAnim = BURNER_ANIMATIONS.FIRE;
        break;
      case BOSS_EVENTS.SHUT_FIRE:
        desiredAnim = BURNER_ANIMATIONS.SHUT_FIRE;
        break;
      case BOSS_EVENTS.EXPLODE:
        desiredAnim = BURNER_ANIMATIONS.EXPLODE;
        break;
      default:
        desiredAnim = BURNER_ANIMATIONS.IDLE;
    }

    if (desiredAnim && boss.curAnim() !== desiredAnim) {
      boss.play(desiredAnim);
    }
  });

  function onHurt() {
    if (boss.hp() > 0) {

    } else {

      stateMachine.dispatch(BOSS_EVENTS.EXPLODE);
      boss.play(BURNER_ANIMATIONS.EXPLODE);
    }
  }

  function onAnimationEnd(anim: string) {
    switch (anim) {
      case BURNER_ANIMATIONS.OPEN_FIRE:

        stateMachine.dispatch(BOSS_EVENTS.FIRE);
        break;
      case BURNER_ANIMATIONS.SHUT_FIRE:

        stateMachine.dispatch(BOSS_EVENTS.RUN);
        break;
      case BURNER_ANIMATIONS.EXPLODE:

        engine.destroy(boss);
        break;
      default:
        break;
    }
  }

  boss.on(ENGINE_DEFAULT_EVENTS.HURT, onHurt);
  boss.onAnimEnd(onAnimationEnd);
}