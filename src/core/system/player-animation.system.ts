import { PLAYER_ANIMATIONS } from "../../types/animations.enum";
import type { Engine } from "../../types/engine.interface";
import type { Player } from "../../types/player.interface";

type Params = {
  engine: Engine;
  player: Player;
};

export function PlayerAnimationSystem({ engine, player }: Params) {
  function handleFall() {
    if (!player.isAttacking) player.play(PLAYER_ANIMATIONS.FALL)
  }

  function handleGround() {
    if (!player.isAttacking) player.play(PLAYER_ANIMATIONS.IDLE)
  }

  function handleHeadbutt() {
    if (!player.isAttacking) player.play(PLAYER_ANIMATIONS.FALL)
  }

  function handleKeyRelease() {
    const anim = player.curAnim()
    if (
      anim !== PLAYER_ANIMATIONS.IDLE &&
      anim !== PLAYER_ANIMATIONS.JUMP &&
      anim !== PLAYER_ANIMATIONS.FALL &&
      anim !== PLAYER_ANIMATIONS.ATTACK
    ) {
      player.play(PLAYER_ANIMATIONS.IDLE)
    }
  }

  player.onFall(handleFall)
  player.onFallOff(handleFall)
  player.onGround(handleGround)
  player.onHeadbutt(handleHeadbutt)
  player.controlHandlers.push(engine.onKeyRelease(handleKeyRelease))
}
