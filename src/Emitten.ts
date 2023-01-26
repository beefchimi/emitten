import {EmittenProtected} from './EmittenProtected';
import type {EmittenMap} from './types';

export class Emitten<
  TEventMap extends EmittenMap,
> extends EmittenProtected<TEventMap> {
  public get activeEvents() {
    return super.getActiveEvents();
  }

  public off<TKey extends keyof TEventMap>(
    eventName: TKey,
    listener: TEventMap[TKey],
  ) {
    super.off(eventName, listener);
  }

  public on<TKey extends keyof TEventMap>(
    eventName: TKey,
    listener: TEventMap[TKey],
  ) {
    super.on(eventName, listener);
  }

  public once<TKey extends keyof TEventMap>(
    eventName: TKey,
    listener: TEventMap[TKey],
  ) {
    super.once(eventName, listener);
  }

  public disposable<TKey extends keyof TEventMap>(
    eventName: TKey,
    listener: TEventMap[TKey],
  ) {
    const result = super.disposable(eventName, listener);
    return result;
  }

  public emit<TKey extends keyof TEventMap>(
    eventName: TKey,
    ...values: Parameters<TEventMap[TKey]>
  ) {
    super.emit(eventName, ...values);
  }

  public empty() {
    super.empty();
  }
}
