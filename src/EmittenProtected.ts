import type {EmittenListener, EmittenLibrary} from './types';

export type EmittenOffFn<T> = EmittenProtected<T>['off'];
export type EmittenOnFn<T> = EmittenProtected<T>['on'];
export type EmittenOnceFn<T> = EmittenProtected<T>['once'];
export type EmittenDisposableFn<T> = EmittenProtected<T>['disposable'];
export type EmittenEmitFn<T> = EmittenProtected<T>['emit'];

export class EmittenProtected<TEventMap> {
  #multiLibrary: EmittenLibrary<TEventMap> = {};
  #singleLibrary: EmittenLibrary<TEventMap> = {};

  protected get activeEvents() {
    const multiKeys = Object.keys(this.#multiLibrary);
    const singleKeys = Object.keys(this.#singleLibrary);

    const dedupedKeys = new Set([...multiKeys, ...singleKeys]);

    return [...dedupedKeys];
  }

  protected off<TKey extends keyof TEventMap>(
    eventName: TKey,
    listener: EmittenListener<TEventMap[TKey]>,
  ) {
    const multiSet = this.#multiLibrary[eventName];
    const singleSet = this.#singleLibrary[eventName];

    if (multiSet != null) {
      multiSet.delete(listener);
      if (multiSet.size === 0) delete this.#multiLibrary[eventName];
    }

    if (singleSet != null) {
      singleSet.delete(listener);
      if (singleSet.size === 0) delete this.#singleLibrary[eventName];
    }
  }

  protected on<TKey extends keyof TEventMap>(
    eventName: TKey,
    listener: EmittenListener<TEventMap[TKey]>,
  ) {
    if (this.#multiLibrary[eventName] == null) {
      this.#multiLibrary[eventName] = new Set();
    }

    this.#multiLibrary[eventName]?.add(listener);
  }

  protected once<TKey extends keyof TEventMap>(
    eventName: TKey,
    listener: EmittenListener<TEventMap[TKey]>,
  ) {
    if (this.#singleLibrary[eventName] == null) {
      this.#singleLibrary[eventName] = new Set();
    }

    this.#singleLibrary[eventName]?.add(listener);
  }

  protected disposable<TKey extends keyof TEventMap>(
    eventName: TKey,
    listener: EmittenListener<TEventMap[TKey]>,
  ) {
    this.on(eventName, listener);

    return () => {
      this.off(eventName, listener);
    };
  }

  protected emit<TKey extends keyof TEventMap>(
    eventName: TKey,
    value?: TEventMap[TKey],
  ) {
    const multiSet = this.#multiLibrary[eventName];
    const singleSet = this.#singleLibrary[eventName];

    multiSet?.forEach((listener) => {
      listener(value);
    });

    singleSet?.forEach((listener) => {
      listener(value);
    });

    delete this.#singleLibrary[eventName];
  }

  protected empty() {
    this.#every(this.#multiLibrary);
    this.#every(this.#singleLibrary);
  }

  #every = (library: EmittenLibrary<TEventMap>) => {
    for (const eventName in library) {
      if (Object.hasOwn(library, eventName)) {
        library[eventName]?.forEach((listener) => {
          this.off(eventName, listener);
        });
      }
    }
  };
}
