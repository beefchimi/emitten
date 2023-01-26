import type {EmittenMap, EmittenLibraryPartial} from './types';

export class EmittenProtected<TEventMap extends EmittenMap> {
  #multiLibrary: EmittenLibraryPartial<TEventMap> = {};
  #singleLibrary: EmittenLibraryPartial<TEventMap> = {};

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

  protected off<TKey extends keyof TEventMap>(
    eventName: TKey,
    listener: TEventMap[TKey],
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
    listener: TEventMap[TKey],
  ) {
    if (this.#multiLibrary[eventName] == null) {
      this.#multiLibrary[eventName] = new Set();
    }

    this.#multiLibrary[eventName]?.add(listener);
  }

  protected once<TKey extends keyof TEventMap>(
    eventName: TKey,
    listener: TEventMap[TKey],
  ) {
    if (this.#singleLibrary[eventName] == null) {
      this.#singleLibrary[eventName] = new Set();
    }

    this.#singleLibrary[eventName]?.add(listener);
  }

  protected disposable<TKey extends keyof TEventMap>(
    eventName: TKey,
    listener: TEventMap[TKey],
  ) {
    this.on(eventName, listener);

    return () => {
      this.off(eventName, listener);
    };
  }

  protected emit<TKey extends keyof TEventMap>(
    eventName: TKey,
    ...values: Parameters<TEventMap[TKey]>
  ) {
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

  #every = (library: EmittenLibraryPartial<TEventMap>) => {
    for (const eventName in library) {
      if (Object.hasOwn(library, eventName)) {
        library[eventName]?.forEach((listener) => {
          this.off(eventName, listener);
        });
      }
    }
  };
}
