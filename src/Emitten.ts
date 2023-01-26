import {EmittenProtected} from './EmittenProtected';
import type {EmittenCommonFn, EmittenDisposeFn, EmittenEmitFn} from './types';

export class Emitten<TEventMap> extends EmittenProtected<TEventMap> {
  public get activeEvents() {
    return super.activeEvents;
  }

  public off: EmittenCommonFn<TEventMap> = (eventName, listener) => {
    super.off(eventName, listener);
  };

  public on: EmittenCommonFn<TEventMap> = (eventName, listener) => {
    super.on(eventName, listener);
  };

  public once: EmittenCommonFn<TEventMap> = (eventName, listener) => {
    super.once(eventName, listener);
  };

  public disposable: EmittenDisposeFn<TEventMap> = (eventName, listener) => {
    const result = super.disposable(eventName, listener);
    return result;
  };

  public emit: EmittenEmitFn<TEventMap> = (eventName, value) => {
    super.emit(eventName, value);
  };

  public empty = () => {
    super.empty();
  };
}
