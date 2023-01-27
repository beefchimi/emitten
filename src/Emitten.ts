import {EmittenProtected} from './EmittenProtected';
import type {EmittenMap} from './types';

export class Emitten<T extends EmittenMap> extends EmittenProtected<T> {
  public get activeEvents() {
    return super.getActiveEvents();
  }

  public off<K extends keyof T>(eventName: K, listener: T[K]) {
    super.off(eventName, listener);
  }

  public on<K extends keyof T>(eventName: K, listener: T[K]) {
    super.on(eventName, listener);
  }

  public once<K extends keyof T>(eventName: K, listener: T[K]) {
    super.once(eventName, listener);
  }

  public disposable<K extends keyof T>(eventName: K, listener: T[K]) {
    const result = super.disposable(eventName, listener);
    return result;
  }

  public emit<K extends keyof T>(eventName: K, ...values: Parameters<T[K]>) {
    super.emit(eventName, ...values);
  }

  public empty() {
    super.empty();
  }
}
