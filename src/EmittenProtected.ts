import type {
  EmittenLibrary,
  EmittenCommonFn,
  EmittenDisposeFn,
  EmittenEmitFn,
} from './types';

export class EmittenProtected<TEventMap> {
  #multiLibrary: EmittenLibrary<TEventMap> = {};
  #singleLibrary: EmittenLibrary<TEventMap> = {};

  protected get activeEvents() {
    const multiKeys = Object.keys(this.#multiLibrary);
    const singleKeys = Object.keys(this.#singleLibrary);

    const dedupedKeys = new Set([...multiKeys, ...singleKeys]);

    return [...dedupedKeys];
  }

  protected off: EmittenCommonFn<TEventMap> = (eventName, listener) => {
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
  };

  protected on: EmittenCommonFn<TEventMap> = (eventName, listener) => {
    if (this.#multiLibrary[eventName] == null) {
      this.#multiLibrary[eventName] = new Set();
    }

    this.#multiLibrary[eventName]?.add(listener);
  };

  protected once: EmittenCommonFn<TEventMap> = (eventName, listener) => {
    if (this.#singleLibrary[eventName] == null) {
      this.#singleLibrary[eventName] = new Set();
    }

    this.#singleLibrary[eventName]?.add(listener);
  };

  protected disposable: EmittenDisposeFn<TEventMap> = (eventName, listener) => {
    this.on(eventName, listener);

    return () => {
      this.off(eventName, listener);
    };
  };

  protected emit: EmittenEmitFn<TEventMap> = (eventName, value) => {
    const multiSet = this.#multiLibrary[eventName];
    const singleSet = this.#singleLibrary[eventName];

    multiSet?.forEach((listener) => {
      listener(value);
    });

    singleSet?.forEach((listener) => {
      listener(value);
    });

    delete this.#singleLibrary[eventName];
  };

  protected empty = () => {
    this.#every(this.#multiLibrary);
    this.#every(this.#singleLibrary);
  };

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
