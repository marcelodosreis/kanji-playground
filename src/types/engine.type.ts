import type {
  KAPLAYCtx,
  GameObj,
  PosComp,
  SpriteComp,
  AreaComp,
  AnchorComp,
  BodyComp,
  DoubleJumpComp,
  OpacityComp,
  HealthComp,
  KEventController,
  OffScreenComp,
  StateComp,
  RectComp,
  ColorComp,
} from "kaplay";

export type Engine = KAPLAYCtx;

export type PlayerEngineGameObj = GameObj<
  | PosComp
  | SpriteComp
  | AreaComp
  | AnchorComp
  | BodyComp
  | DoubleJumpComp
  | OpacityComp
  | HealthComp
>;

export type EnemyEngineGameObj = GameObj<
  | PosComp
  | SpriteComp
  | AreaComp
  | AnchorComp
  | BodyComp
  | OffScreenComp
  | StateComp
  | HealthComp
>;

export type BossEngineGameObj = GameObj<
  | PosComp
  | SpriteComp
  | AreaComp
  | AnchorComp
  | BodyComp
  | StateComp
  | HealthComp
>;

export type BossBarrierEngineGameObj = GameObj<
  | RectComp
  | ColorComp
  | PosComp
  | AreaComp
  | OpacityComp
>;

export type MapEngineGameObj = GameObj<PosComp | SpriteComp>;

export type EngineGameObj = GameObj

export type EngineEventCtrl = KEventController;
