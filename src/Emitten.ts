import {EmittenCommon} from './EmittenCommon';
import type {EmittenMap} from './types';

export class Emitten<T extends EmittenMap> extends EmittenCommon<T> {
  public emit<K extends keyof T>(eventName: K, ...values: Parameters<T[K]>) {
    super.emit(eventName, ...values);
  }

  public empty() {
    super.empty();
  }
}
