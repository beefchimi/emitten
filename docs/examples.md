# Examples

Below are some common use-cases for `Emitten` and `EmittenProtected`.

## Basic usage

The easiest way to use `Emitten` is to simply instantiate it and begin wiring up your logic.

For this use case, you most likely want to use `Emitten` instead of `EmittenProtected`. If you instantiate using `EmittenProtected`, you will not be able to call any `protected` members.

```ts
// Start by defining your “event map”.
// This is an `interface` comprised of
// `eventName -> listener function`.
// This type MUST EXTEND `EmittenMap`.

type EventMap = EmittenMap & {
  change(value: string): void;
  count(value?: number): void;
  collect(values: boolean[]): void;
  rest(value: string, ...more: string[]): void;
  nothing(): void;
};

// Instantiate a new instance, passing the `EventMap`
// as the generic to `Emitten`.
const myEvents = new Emitten<EventMap>();

// Define your callback functions.

// If needed, you can grab the `listener` argument
// types by using the TypeScript `Parameters`
// utility and manually selecting the value
// by `key + index`. Example:
type ChangeValue = Parameters<EventMap['change']>[0];

function handleChange(value: ChangeValue) {
  console.log('change', value);
}

function handleCount(value = 0) {
  console.log('count', value);
}

function handleCollect(values: boolean[]) {
  console.log('collect', values);
}

// Subscribe to the events you are interested in.
myEvents.on('change', handleChange);
myEvents.on('count', handleCount);

// Subscribe to the `collect` event only once. The
// subscription will be automatically removed upon `emit`.
myEvents.once('collect', handleCollect);

// It is not recommended to pass anonymous functions
// like in the example below. In order to remove this,
// you would have to call `.empty()` and clear out
// all of the events from this instance.
myEvents.on('count', (value) => {
  console.log('2nd count listener', value);
});

// However, you can register a listener using
// `.disposable()`, which will return the corresponding
// `.off()` method to make removal easier!
const disposeRest = myEvents.disposable('rest', (value, ...more) => {
  console.log('An anonymous `rest` function', value, ...more);
});

// Lastly, an example of `listener` without any arguments.
// Since `once` will remove itself after `emit`, it is
// fine to pass anonymous functions.
myEvents.once('nothing', () => {
  console.log('Nothing!');
});

// We can now start emitting events!

myEvents.emit('change', 'hello');
myEvents.emit('count');
myEvents.emit('count', 1);
myEvents.emit('collect', [true, false, true]);
myEvents.emit('rest', '1st string', '2nd string', '3rd string');
myEvents.emit('nothing');

// Since the `handleCollect` function was registered with `.once()`,
// this 2nd call to `.emit('collect')` will not be received by anything.
myEvents.emit('collect', [true, false, true]);

// Attempting to `emit` an `eventName` that does
// not exist in the `EventMap`, or passing a `value`
// that is not compatible with the defined event’s
// value type, will result in a TypeScript error.
myEvents.emit('nope');
myEvents.emit('change', '1st string', '2nd string');
myEvents.emit('count', true);
myEvents.emit('nothing', 'something');

// Can manually remove an individual listener by reference.
myEvents.off('change', handleChange);

// Or manually call a returned `dispose` function.
disposeRest();

// Or you can completely empty out all events + listeners.
myEvents.empty();
```

## Extending the class

Since “derived classes” have access to the `protected` members of their “base class”, you can utilize `EmittenProtected` to both utilize `protected` members while also keeping them `protected` when instantiating your new `class`.

```ts
type ExtendedEventMap = EmittenMap & {
  custom(value: string): void;
  other(value: number): void;
};

class ExtendedEmitten extends EmittenProtected<ExtendedEventMap> {
  // If required, you can selectively expose any `protected` members.
  // Otherwise, if you want all members to be `public`, you can
  // extend the `Emitten` class instead.

  public get activeEvents() {
    // Must use the `method`, since `super` cannot
    // be called on an accessor.
    return super.getActiveEvents();
  }

  public on<K extends keyof ExtendedEventMap>(
    eventName: K,
    listener: ExtendedEventMap[K],
  ) {
    super.on(eventName, listener);
  }

  public off<K extends keyof ExtendedEventMap>(
    eventName: K,
    listener: ExtendedEventMap[K],
  ) {
    super.off(eventName, listener);
  }

  public emit<K extends keyof ExtendedEventMap>(
    eventName: K,
    ...values: Parameters<ExtendedEventMap[K]>
  ) {
    super.emit(eventName, ...values);
  }

  report() {
    return this.activeEvents;
  }
}

const extended = new ExtendedEmitten();

extended.on('custom', (value) => {
  console.log('value', value);
});

extended.report();

extended.emit('custom', 'hello');

// We did not expose `.empty()`, so we will
// receive a TypeScript error attempting to call this.
extended.empty();
```

## Another example

We can of course create classes that do not extend `Emitten`, and instead create a `private` instance of `Emitten` to perform event actions on.

```ts
type AnotherMap = EmittenMap & {
  change(value: string): void;
  count(value?: number): void;
  names(value: string, ...more: string[]): void;
};

class AnotherExample {
  #id = 'DefaultId';
  #counter = 0;
  #names: string[] = [];

  // Would not be able to call any methods
  // if we had used `EmittenProtected`.
  #events = new Emitten<EventMap>();

  #handleChange: AnotherMap['change'];
  #handleCount: AnotherMap['count'];
  #handleNames: AnotherMap['names'];

  constructor() {
    this.#handleChange = (value) => {
      this.#id = value.length > 0 ? value : this.#id;
      console.log('#handleChange', value);
    };

    this.#handleCount = (value) => {
      if (this.#counter >= 4) {
        this.#events.off('count', this.#handleCount);
      } else {
        this.#counter++;
      }

      console.log('#handleCount', value);
    };

    this.#handleNames = (value, ...rest) => {
      const collected = [value, ...rest];
      this.#names = [...this.#names, ...collected];
      console.log('#handleNames', collected);
    };

    this.#events.on('change', this.#handleChange);

    // Registering the same `listener` on the same `event`
    // will not create duplicate entries. When `count` is
    // emitted, we will see only one call to `#handleCount()`.
    this.#events.on('count', this.#handleCount);
    this.#events.on('count', this.#handleCount);
    this.#events.on('count', this.#handleCount);

    this.#events.on('names', this.#handleNames);
  }

  get currentId() {
    return this.#id;
  }

  get currentCount() {
    return this.#counter;
  }

  get currentOther() {
    return this.#names;
  }

  get events() {
    return this.#events.activeEvents;
  }

  change(value: string) {
    this.#events.emit('change', value);
  }

  count() {
    this.#events.emit('count', this.#counter);
  }

  names(value: string, ...more: string[]) {
    this.#events.emit('names', value, ...more);
  }

  destroy() {
    console.log('Removing all listeners from newThinger...');
    this.#events.empty();
  }
}

const myExample = new AnotherExample();
const otherCollection = [
  ['first'],
  ['hello', 'world'],
  [],
  ['one', 'two', 'three'],
  ['this', 'that'],
  ['last'],
];

document.addEventListener('click', () => {
  const otherData = otherCollection[myExample.currentCount] ?? [];

  myExample.change('clicked');
  myExample.count();
  myExample.names(...otherData);

  if (myExample.currentOther.length > otherCollection.length) {
    console.log('Events BEFORE emptying:', myExample.events);
    myExample.destroy();
    console.log('Events AFTER emptying:', myExample.events);
  }

  console.log('myExample.currentId', myExample.currentId);
  console.log('myExample.currentCount', myExample.currentCount);
  console.log('myExample.currentOther', myExample.currentOther);
});
```
