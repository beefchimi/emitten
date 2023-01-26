# Examples

Below are some common use-cases for `Emitten` and `EmittenProtected`.

## Basic usage

The easiest way to use `Emitten` is to simply instantiate it and begin wiring up your logic.

For this use case, you most likely want to use `Emitten` instead of `EmittenProtected`. If you instantiate using `EmittenProtected`, you will not be able to call any `protected` members.

```ts
import {Emitten} from 'emitten';

// The “event map” that you define.
// This is an object of `eventName` keys,
// and their `callback argument` value.
interface EventMap {
  change: string;
  count: number;
  other: string[];
}

// Instantiate a new instance, passing the `EventMap`
// as the generic to `Emitten`.
const myEvents = new Emitten<EventMap>();

// Define your callbacks...
// `value` needs to be “optional”.

function handleChange(value?: EventMap['change']) {
  console.log('change', value);
}

function handleCount(value?: EventMap['count']) {
  console.log('count', value);
}

function handleOther(value?: EventMap['other']) {
  console.log('other', value);
}

// Subscribe to the `change` and `count` events.
myEvents.on('change', handleChange);
myEvents.on('count', handleCount);

// Not recommended to pass anonymous functions!
// In order to remove this, you will have to call `.empty()`.
myEvents.on('count', (value) => console.log('2nd count listener', value));

// Alternatively, you can register a listener using
// `.disposable()`, which will return the corresponding
// `.off()` method to make removal easier.
const registered = myEvents.disposable('count', (value) =>
  console.log('An anonymous function', value),
);

// The listener can now be removed by calling the return value.
registered();

// Subscribe to the `other` event only once. The
// subscription will be automatically removed upon `emit`.
myEvents.once('other', handleOther);

// The `value` argument of `emit` is optional
// (can be `undefined`) and therefor is not
// required to `emit` an `event`.
myEvents.emit('change');
myEvents.emit('count');
myEvents.emit('other');

myEvents.emit('change', 'hello');
myEvents.emit('count', 2);

// Since the `handleOther` function was registered with `.once()`,
// this 2nd call to `.emit('other')` will not be received by anything.
myEvents.emit('other', ['one', 'two', 'three']);

// Attempting to `emit` an `eventName` that does
// not exist in the `EventMap`, or passing a `value`
// that is not compatible with the defined event’s
// value type, will result in a TypeScript error.
myEvents.emit('nope');
myEvents.emit('count', 'one');

// Can manually remove an individual listener.
myEvents.off('change', handleChange);

// Or can completely empty out all events + listeners.
myEvents.empty();
```

## Extending the class

Since “derived classes” have access to the `protected` members of their “base class”, you can utilize `EmittenProtected` to both utilize `protected` members while also keeping them `protected` when instantiating your new `class`.

```ts
interface ExtendedEventMap {
  custom: string;
  other: number;
}

class ExtendedEmitten extends EmittenProtected<ExtendedEventMap> {
  // If required, you can selectively expose any `protected` members.
  // Otherwise, if you want all members to be `public`, you can
  // extend the `Emitten` class instead.

  public on<TKey extends keyof ExtendedEventMap>(
    eventName: TKey,
    listener: EmittenListener<ExtendedEventMap[TKey]>,
  ) {
    super.on(eventName, listener);
  }

  public off<TKey extends keyof ExtendedEventMap>(
    eventName: TKey,
    listener: EmittenListener<ExtendedEventMap[TKey]>,
  ) {
    super.off(eventName, listener);
  }

  public emit<TKey extends keyof ExtendedEventMap>(
    eventName: TKey,
    value?: ExtendedEventMap[TKey],
  ) {
    super.emit(eventName, value);
  }

  report() {
    return this.activeEvents;
  }
}

const extended = new ExtendedEmitten();

// Since we converted both `.on()` and `.emit()` to be `public`,
// we can safely call them on the instance.

extended.on('custom', (value) => console.log('value', value));
extended.emit('custom', 'hello');

extended.report();

// However, we did not expose `.empty()`, so we will
// receive a TypeScript error attempting to call this.
extended.empty();
```

## Another example

We can of course create classes that do not extend `Emitten`, and instead create a `private` instance of `Emitten` to perform event actions on.

```ts
function assertValue(value?: string): value is string {
  return Boolean(value?.length);
}

class AnotherExample {
  #id = 'DefaultId';
  #counter = 0;
  #names: EventMap['other'] = [];

  // Would not be able to call `.emit()` or `.empty()`
  // if we had used `Emitten`.
  #exampleEvents = new Emitten<EventMap>();

  #handleChange: (value?: EventMap['change']) => void;
  #handleCount: (value?: EventMap['count']) => void;
  #handleOther: (value?: EventMap['other']) => void;

  constructor() {
    this.#handleChange = (value) => {
      this.#id = assertValue(value) ? value : this.#id;
      console.log('#handleChange', value);
    };

    this.#handleCount = (value) => {
      if (this.#counter >= 4) {
        this.#exampleEvents.off('count', this.#handleCount);
      } else {
        this.#counter++;
      }

      console.log('#handleCount', value);
    };

    this.#handleOther = (value) => {
      this.#names = value ? [...this.#names, ...value] : this.#names;
      console.log('#handleOther', value);
    };

    this.#exampleEvents.on('change', this.#handleChange);

    // Registering the same `listener` on the same `event`
    // will not create duplicate entries. When `count` is
    // emitted, we will see only one call to `#handleCount()`.
    this.#exampleEvents.on('count', this.#handleCount);
    this.#exampleEvents.on('count', this.#handleCount);
    this.#exampleEvents.on('count', this.#handleCount);

    this.#exampleEvents.on('other', this.#handleOther);
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
    return this.#exampleEvents.activeEvents;
  }

  change(value: string) {
    this.#exampleEvents.emit('change', value);
  }

  count() {
    this.#exampleEvents.emit('count', this.#counter);
  }

  other(...values: EventMap['other']) {
    this.#exampleEvents.emit('other', values);
  }

  destroy() {
    console.log('Removing all listeners from newThinger...');
    this.#exampleEvents.empty();
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
  myExample.other(...otherData);

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
