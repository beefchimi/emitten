# Emitten

> `Emitten` is a very basic event emitter for TypeScript.

This simple `class` allows you to subscribe/unsubscribe to a defined library of events.

## Get started

Add `Emitten` to your project.

```sh
npm install emitten
```

Import and start emit’in!

```ts
import {Emitten} from 'emitten';

interface EventMap {
  change: string;
  count: number;
  other: string[];
}

const myEmitter = new Emitten<EventMap>();

myEmitter.on('change', someFunction);
myEmitter.emit('change', 'Hello world');
```

## Examples

Below are some common use-cases for `Emitten` and `EmittenProtected`.

### Basic usage

The easiest way to use `Emitten` is to simply instantiate it and begin wiring up your logic.

For this use case, you most likely want to use `Emitten` instead of `EmittenProtected`. If you instantiate using `EmittenProtected`, you will not be able to call any `protected` members, such as `.emit()` or `.empty()`.

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

### Extending the class

Since “derived classes” have access to the `protected` members of their “base class”, you can utilize `EmittenProtected` to both utilize `protected` members while also keeping them `protected` when instantiating your new `class`.

```ts
interface ExtendedEventMap {
  custom: string;
  other: number;
}

class ExtendedEmitten extends EmittenProtected<ExtendedEventMap> {
  constructor() {
    // `ExtendedEmitten` now has all of the `properties`,
    // `accessors`, and `methods` from `EmittenProtected`.
    super();
  }

  // If required, you can expose any `protected` members.
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

extended.on('custom', (value) => console.log('value', value));
extended.report();

// Since we converted `.emit()` to a `public` member,
// we can safely call this on the instance.
extended.emit('custom', 'hello');

// However, we did not expose `.empty()`, so we will
// receive a TypeScript error attempting to call this.
extended.empty();
```

### Another example

We can of course create classes that do not extend `Emitten`, and instead create a `private` instance of `Emitten` to perform event actions on.

```ts
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
      this.#id = value?.length ? value : this.#id;
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

## Future

**Stricter callback argument:**

It would be nice to make it so the `value` argument isn't optional.

```ts
// I might register a listener that will ALWAYS
// pass an argument of a specific type.
function handleChange(data: SomeObject) {
  return Object.keys(data);
}

// I will get a type error here, because `data`
// was not marked as “optional”.
myEvents.on('change', handleChange);

// Calling `emit` does not require a 2nd argument.
myEvents.emit('change');
```

I would like to find a way to type the `EventMap` generic passed to `Emitten` to that you have more control over how the values are typed.

```ts
// Not sure if the `EmittenListener` type needs to change,
// but it is possible it changes to something like:
type EmittenListener<T> = (...values: T[]) => void;

// Then `EventMap` can maybe look something like this:
interface EventMap {
  change: (value: string, other?: boolean) => void;
  count: (value: number) => void;
  other: (value: string[]) => void;
}

// Then the `emit` method maybe looks something like this:
function emit<TKey extends keyof T>(
  eventName: TKey,
  value: Parameters<T[TKey]>,
) {}
```

This will require some experimentation.

**Private iterator:**

It would be nice to have a `every()` method to iterate over all `listeners` for each `event` within a `library`.

This isn’t so please though, as `.bind(this)` ends up being required when calling `.empty()`.

```ts
protected empty() {
  this.#every(this.#multiLibrary, this.off.bind(this));
  this.#every(this.#singleLibrary, this.off.bind(this));
}

#every(
  library: EmittenLibrary<T>,
  callback: <TKey extends keyof T>(
    eventName: TKey,
    listener: EmittenListener<T[TKey]>,
  ) => void,
) {
  for (const eventName in library) {
    if (Object.prototype.hasOwnProperty.call(library, eventName)) {
      library[eventName]?.forEach((listener) =>
        callback(eventName, listener),
      );
    }
  }
}
```

**No dynamic delete:**

I got sloppy and used the `delete` keyword... I need to remove the `@typescript-eslint/no-dynamic-delete` override and filter that `object` properly.
