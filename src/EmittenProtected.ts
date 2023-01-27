import type {EmittenMap, EmittenLibraryPartial} from './types';

export class EmittenProtected<T extends EmittenMap> {
  #multiLibrary: EmittenLibraryPartial<T> = {};
  #singleLibrary: EmittenLibraryPartial<T> = {};

  protected get activeEvents() {
    // This redundant getter + method are required
    // because you cannot call `super` on an accessor.
    return this.getActiveEvents();
  }

  protected getActiveEvents() {
    const multiKeys = Object.keys(this.#multiLibrary);
    const singleKeys = Object.keys(this.#singleLibrary);

    const dedupedKeys = new Set([...multiKeys, ...singleKeys]);

    return [...dedupedKeys];
  }

  protected off<K extends keyof T>(eventName: K, listener: T[K]) {
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

  protected on<K extends keyof T>(eventName: K, listener: T[K]) {
    if (this.#multiLibrary[eventName] == null) {
      this.#multiLibrary[eventName] = new Set();
    }

    this.#multiLibrary[eventName]?.add(listener);
  }

  protected once<K extends keyof T>(eventName: K, listener: T[K]) {
    if (this.#singleLibrary[eventName] == null) {
      this.#singleLibrary[eventName] = new Set();
    }

    this.#singleLibrary[eventName]?.add(listener);
  }

  protected disposable<K extends keyof T>(eventName: K, listener: T[K]) {
    this.on(eventName, listener);

    return () => {
      this.off(eventName, listener);
    };
  }

  protected emit<K extends keyof T>(eventName: K, ...values: Parameters<T[K]>) {
    const multiSet = this.#multiLibrary[eventName];
    const singleSet = this.#singleLibrary[eventName];

    multiSet?.forEach((listener) => {
      listener(...values);
    });

    singleSet?.forEach((listener) => {
      listener(...values);
    });

    delete this.#singleLibrary[eventName];
  }

  protected empty() {
    this.#every(this.#multiLibrary);
    this.#every(this.#singleLibrary);
  }

  #every = (library: EmittenLibraryPartial<T>) => {
    for (const eventName in library) {
      if (Object.hasOwn(library, eventName)) {
        library[eventName]?.forEach((listener) => {
          this.off(eventName, listener);
        });
      }
    }
  };
}
