import type {EmittenMap, EmittenLibrary} from './types';

export class EmittenProtected<T extends EmittenMap> {
  readonly #multiLibrary: EmittenLibrary<T> = new Map();
  readonly #singleLibrary: EmittenLibrary<T> = new Map();

  protected get activeEvents() {
    // This redundant getter + method are required
    // because you cannot call `super` on an accessor.
    return this.getActiveEvents();
  }

  protected getActiveEvents() {
    const multiKeys = this.#multiLibrary.keys();
    const singleKeys = this.#singleLibrary.keys();

    const dedupedKeys = new Set([...multiKeys, ...singleKeys]);

    return [...dedupedKeys];
  }

  protected off<K extends keyof T>(eventName: K, listener: T[K]) {
    this.#multiLibrary.get(eventName)?.delete(listener);

    if (this.#multiLibrary.get(eventName)?.size === 0) {
      this.#multiLibrary.delete(eventName);
    }

    this.#singleLibrary.get(eventName)?.delete(listener);

    if (this.#singleLibrary.get(eventName)?.size === 0) {
      this.#singleLibrary.delete(eventName);
    }
  }

  protected on<K extends keyof T>(eventName: K, listener: T[K]) {
    if (!this.#multiLibrary.has(eventName)) {
      this.#multiLibrary.set(eventName, new Set());
    }

    // TypeScript doesn't understand that the above
    // condition results in this `.get()` being defined.
    this.#multiLibrary.get(eventName)?.add(listener);

    return () => {
      this.off(eventName, listener);
    };
  }

  protected once<K extends keyof T>(eventName: K, listener: T[K]) {
    if (!this.#singleLibrary.has(eventName)) {
      this.#singleLibrary.set(eventName, new Set());
    }

    // TypeScript doesn't understand that the above
    // condition results in this `.get()` being defined.
    this.#singleLibrary.get(eventName)?.add(listener);
  }

  protected emit<K extends keyof T>(eventName: K, ...values: Parameters<T[K]>) {
    this.#multiLibrary.get(eventName)?.forEach((listener) => {
      listener(...values);
    });

    this.#singleLibrary.get(eventName)?.forEach((listener) => {
      listener(...values);
    });

    this.#singleLibrary.delete(eventName);
  }

  protected empty() {
    this.#every(this.#multiLibrary);
    this.#every(this.#singleLibrary);
  }

  readonly #every = (library: EmittenLibrary<T>) => {
    library.forEach((collection, eventName) => {
      collection.forEach((listener) => {
        this.off(eventName, listener);
      });
    });
  };
}
