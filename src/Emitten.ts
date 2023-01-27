import {EmittenProtected} from './EmittenProtected';
import type {EmittenListener} from './types';

export class Emitten<TEventMap> extends EmittenProtected<TEventMap> {
  public get activeEvents() {
    return super.getActiveEvents();
  }

  public off<TKey extends keyof TEventMap>(
    eventName: TKey,
    listener: EmittenListener<TEventMap[TKey]>,
  ) {
    super.off(eventName, listener);
  }

  public on<TKey extends keyof TEventMap>(
    eventName: TKey,
    listener: EmittenListener<TEventMap[TKey]>,
  ) {
    super.on(eventName, listener);
  }

  public once<TKey extends keyof TEventMap>(
    eventName: TKey,
    listener: EmittenListener<TEventMap[TKey]>,
  ) {
    super.once(eventName, listener);
  }

  public disposable<TKey extends keyof TEventMap>(
    eventName: TKey,
    listener: EmittenListener<TEventMap[TKey]>,
  ) {
    const result = super.disposable(eventName, listener);
    return result;
  }

  public emit<TKey extends keyof TEventMap>(
    eventName: TKey,
    value?: TEventMap[TKey],
  ) {
    super.emit(eventName, value);
  }

  public empty() {
    super.empty();
  }
}
