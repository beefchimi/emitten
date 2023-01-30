# Examples

Below are some common use-cases for `Emitten` and `EmittenProtected`.

## Basic usage

The easiest way to use `Emitten` is to simply instantiate it and begin wiring up your logic.

For this use case, you most likely want to use `Emitten` instead of `EmittenProtected`. If you instantiate using `EmittenProtected`, you will not be able to call any `protected` members.

```ts
// Start by defining your “event map”.
// This is a `Record` type comprised of
// `eventName -> listener function`.

// It is recommended to use the `type` keyword instead of `interface`!
// There is an important distinction... using `type`, you will:
// 1. Not need to `extend` from `EmittenMap`.
// 2. Automatically receive type-safety for `event` names.

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type EventMap = {
  change(value: string): void;
  count(value?: number): void;
  collect(values: boolean[]): void;
  rest(required: string, ...optional: string[]): void;
  nothing(): void;
};

// If you do prefer using `interface`, just know that:
// 1. You MUST `extend` from `EmittenMap`.
// 2. You will NOT receive type-safety for `event` names.
export interface AltMap extends EmittenMap {
  change(value: string): void;
  count(value?: number): void;
  collect(values: boolean[]): void;
  rest(required: string, ...optional: string[]): void;
  nothing(): void;
}

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

// However, `.on()` will return the corresponding “dispose”
// for that listener. Simply capture the “disposable” and
// call it when you are ready to remove that listener.
const disposeRest = myEvents.on('rest', (required, ...optional) => {
  console.log('An anonymous `rest` function', required, ...optional);
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
myEvents.on('nope', () => {});
myEvents.off('nope', () => {});
myEvents.emit('nope');

myEvents.emit('change', '1st string', '2nd string');
myEvents.emit('count', true);
myEvents.emit('rest');
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
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type ExtendedEventMap = {
  custom(value: string): void;
  other(value: number): void;
};

class ExtendedEmitten extends EmittenProtected<ExtendedEventMap> {
  // If required, you can selectively expose any `protected` members.
  // Otherwise, if you want all members to be `public`, you can
  // extend the `Emitten` class instead.

  public on<K extends keyof ExtendedEventMap>(
    eventName: K,
    listener: ExtendedEventMap[K],
  ) {
    const dispose = super.on(eventName, listener);
    return dispose;
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
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type AnotherMap = {
  change(value: string): void;
  count(value?: number): void;
  names(...values: string[]): void;
  diverse(first: string, second: number, ...last: boolean[]): void;
};

class AnotherExample {
  #id = 'DefaultId';
  #counter = 0;
  #names: string[] = [];

  // Would not be able to call any methods
  // if we had used `EmittenProtected`.
  #events = new Emitten<AnotherMap>();

  #handleChange: AnotherMap['change'];
  #handleCount: AnotherMap['count'];
  #handleNames: AnotherMap['names'];
  #handleDiverse: AnotherMap['diverse'];

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

    this.#handleNames = (...values) => {
      this.#names = [...this.#names, ...values];
      console.log('#handleNames', values);
    };

    this.#handleDiverse = (first, second, ...last) => {
      console.log('#handleDiverse > first', first);
      console.log('#handleDiverse > second', second);
      console.log('#handleDiverse > last', last);
    };

    this.#events.on('change', this.#handleChange);
    this.#events.on('count', this.#handleCount);
    this.#events.on('names', this.#handleNames);

    // Registering the same `listener` on the same `event`
    // will not create duplicate entries. When `diverse` is
    // emitted, we will see only one call to `#handleDiverse()`.
    this.#events.on('diverse', this.#handleDiverse);
    this.#events.on('diverse', this.#handleDiverse);
    this.#events.on('diverse', this.#handleDiverse);
    this.#events.on('diverse', this.#handleDiverse);
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

  names(...values: string[]) {
    this.#events.emit('names', ...values);
  }

  diverse(first: string, second: number, ...last: boolean[]) {
    this.#events.emit('diverse', first, second, ...last);
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
  myExample.diverse(
    'call to diverse',
    myExample.currentCount,
    true,
    false,
    true,
    false,
  );

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
