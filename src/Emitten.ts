import {EmittenProtected} from './EmittenProtected';
import type {EmittenMap} from './types';

export class Emitten<T extends EmittenMap> extends EmittenProtected<T> {
  public get activeEvents() {
    return this.getActiveEvents();
  }

  public off<K extends keyof T>(eventName: K, listener: T[K]) {
    super.off(eventName, listener);
  }

  public on<K extends keyof T>(eventName: K, listener: T[K]) {
    const dispose = super.on(eventName, listener);
    return dispose;
  }

  public once<K extends keyof T>(eventName: K, listener: T[K]) {
    super.once(eventName, listener);
  }

  public emit<K extends keyof T>(eventName: K, ...values: Parameters<T[K]>) {
    super.emit(eventName, ...values);
  }

  public empty() {
    super.empty();
  }
}
