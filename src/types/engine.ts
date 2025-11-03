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
} from "kaplay";

export type Engine = KAPLAYCtx;

export type EngineGameObj = GameObj<
  | PosComp
  | SpriteComp
  | AreaComp
  | AnchorComp
  | BodyComp
  | DoubleJumpComp
  | OpacityComp
  | HealthComp
>;

export type EngineEventCtrl = KEventController;
