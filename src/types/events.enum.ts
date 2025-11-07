import { BURNER_ANIMATIONS } from "./animations.enum";

export enum BOSS_EVENTS {
  IDLE = BURNER_ANIMATIONS.IDLE,
  RUN = BURNER_ANIMATIONS.RUN,
  FIRE = BURNER_ANIMATIONS.FIRE,
  OPEN_FIRE = BURNER_ANIMATIONS.OPEN_FIRE,
  SHUT_FIRE = BURNER_ANIMATIONS.SHUT_FIRE,
  EXPLODE = BURNER_ANIMATIONS.EXPLODE,
}

export enum FLYING_ENEMY_EVENTS {
  PATROL_RIGHT = "patrol_right",
  PATROL_LEFT = "patrol_left",
  ALERT = "alert",
  ATTACK = "attack",
  RETURN = "return",
  EXPLODE = "explode",
}

export enum ENGINE_DEFAULT_EVENTS {
  HEAL = "heal",
  HURT = "hurt",
}
