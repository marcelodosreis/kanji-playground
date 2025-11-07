export type StateName = string;

export type StateConfig<Context> = {
  onEnter?: (ctx: Context) => Promise<void> | void;
  onUpdate?: (ctx: Context) => void;
  transitions: {
    [event: string]: StateName | ((ctx: Context) => StateName | null);
  };
};

export type StateMachineConfig<Context> = {
  initial: StateName;
  states: {
    [state in StateName]: StateConfig<Context>;
  };
};

export class StateMachine<Context> {
  private config: StateMachineConfig<Context>;
  private currentState: StateName;
  private context: Context;

  constructor(config: StateMachineConfig<Context>, context: Context) {
    this.config = config;
    this.currentState = config.initial;
    this.context = context;
    this.enterState(this.currentState);
  }

  enterState(state: StateName) {
    this.currentState = state;
    const stateConfig = this.config.states[state];
    if (stateConfig.onEnter) stateConfig.onEnter(this.context);
  }

  update() {
    const stateConfig = this.config.states[this.currentState];
    if (stateConfig.onUpdate) stateConfig.onUpdate(this.context);
  }

  dispatch(event: string) {
    const stateConfig = this.config.states[this.currentState];
    const transition = stateConfig.transitions[event];
    if (typeof transition === "string") {
      this.enterState(transition);
    } else if (typeof transition === "function") {
      const nextState = transition(this.context);
      if (nextState) this.enterState(nextState);
    }
  }

  getState() {
    return this.currentState;
  }
}
