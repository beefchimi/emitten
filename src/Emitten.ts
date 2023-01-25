import {EmittenProtected} from './EmittenProtected';

export class Emitten<T> extends EmittenProtected<T> {
  readonly PublicFn = this.EventFn;

  public off: typeof this.PublicFn = (eventName, listener) => {
    super.off(eventName, listener);
  };

  public emit<TKey extends keyof T>(eventName: TKey, value?: T[TKey]) {
    super.emit(eventName, value);
  }

  public empty() {
    super.empty();
  }
}
