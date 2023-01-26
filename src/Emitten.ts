import {EmittenProtected} from './EmittenProtected';

// import type {EmittenCommonFn, EmittenDisposeFn, EmittenEmitFn} from './types';
import type {
  EmittenOffFn,
  EmittenOnFn,
  EmittenOnceFn,
  EmittenDisposableFn,
  EmittenEmitFn,
} from './EmittenProtected';

export class Emitten<TEventMap> extends EmittenProtected<TEventMap> {
  public get activeEvents() {
    return super.activeEvents;
  }

  public off: EmittenOffFn<TEventMap> = (eventName, listener) => {
    super.off(eventName, listener);
  };

  public on: EmittenOnFn<TEventMap> = (eventName, listener) => {
    super.on(eventName, listener);
  };

  public once: EmittenOnceFn<TEventMap> = (eventName, listener) => {
    super.once(eventName, listener);
  };

  public disposable: EmittenDisposableFn<TEventMap> = (eventName, listener) => {
    const result = super.disposable(eventName, listener);
    return result;
  };

  public emit: EmittenEmitFn<TEventMap> = (eventName, value) => {
    super.emit(eventName, value);
  };

  public empty() {
    super.empty();
  }
}
