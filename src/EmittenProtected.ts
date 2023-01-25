import type {EmittenListener, EmittenLibrary} from './types';

export class EmittenProtected<T> {
  #multiLibrary: EmittenLibrary<T> = {};
  #singleLibrary: EmittenLibrary<T> = {};

  protected get activeEvents() {
    const multiKeys = Object.keys(this.#multiLibrary);
    const singleKeys = Object.keys(this.#singleLibrary);

    const dedupedKeys = new Set([...multiKeys, ...singleKeys]);

    return [...dedupedKeys];
  }

  protected off<TKey extends keyof T>(
    eventName: TKey,
    listener: EmittenListener<T[TKey]>,
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

  protected on<TKey extends keyof T>(
    eventName: TKey,
    listener: EmittenListener<T[TKey]>,
  ) {
    if (this.#multiLibrary[eventName] == null) {
      this.#multiLibrary[eventName] = new Set();
    }

    this.#multiLibrary[eventName]?.add(listener);
  }

  protected once<TKey extends keyof T>(
    eventName: TKey,
    listener: EmittenListener<T[TKey]>,
  ) {
    if (this.#singleLibrary[eventName] == null) {
      this.#singleLibrary[eventName] = new Set();
    }

    this.#singleLibrary[eventName]?.add(listener);
  }

  protected disposable<TKey extends keyof T>(
    eventName: TKey,
    listener: EmittenListener<T[TKey]>,
  ) {
    this.on(eventName, listener);

    return () => {
      this.off(eventName, listener);
    };
  }

  protected emit<TKey extends keyof T>(eventName: TKey, value?: T[TKey]) {
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
    const every = (library: EmittenLibrary<T>) => {
      for (const eventName in library) {
        if (Object.hasOwn(library, eventName)) {
          library[eventName]?.forEach((listener) => {
            this.off(eventName, listener);
          });
        }
      }
    };

    every(this.#multiLibrary);
    every(this.#singleLibrary);
  }
}
