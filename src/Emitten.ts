import {EmittenProtected} from './EmittenProtected';

export class Emitten<T> extends EmittenProtected<T> {
  public emit<TKey extends keyof T>(eventName: TKey, value?: T[TKey]) {
    super.emit(eventName, value);
  }

  public empty() {
    super.empty();
  }
}
