# Emitten

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

> `Emitten` is a very basic event emitter for TypeScript.

This simple `class` allows you to subscribe/unsubscribe to a defined library of events.

## Get started

Add `Emitten` to your project.

```sh
# Using NPM
npm install emitten

# Or some other package manager, such as Yarn
yarn add emitten
```

Import and start emit’in!

```ts
// Import the fully public Emitten variant.
// Alternatively, use the fully protected variant: EmittenProtected
// Or, the partially protected variant: EmittenCommon
import {Emitten} from 'emitten';

// Define your “event map” of `eventName: listener(args)` pairs.
// Both the `eventName` and the `args` from the `listener` are
// captured by TypeScript to assert type-safety!
type EventMap = {
  change(value: string): void;
  count(value?: number): void;
  collect(...values: boolean[]): void;
  // Method signature style could also look like:
  other: (required: string, ...optional: string[]) => void;
};

// Instantiate, passing `EventMap` as a generic.
const myEmitter = new Emitten<EventMap>();

// By referencing the `EventMap` you created,
// you can assign the correct type to your listeners.
const handleChange: EventMap['change'] = (value) => {};

// Register a subscription!
myEmitter.on('change', handleChange);

// Emit an event! The arguments accepted
// by `.emit()` will be correctly typed.
myEmitter.emit('change', 'Hello world');

// Remove a subscription!
myEmitter.off('change', handleChange);

// Register a subscription only once! The listener
// will be automatically removed after a single `emit`.
myEmitter.once('count', (value = 0) => {});
myEmitter.emit('count', 123);

// Capture and manually call the removal function!
// The arguments accepted by any listener will correctly
// correspond with the registered `eventName`.
const dispose = myEmitter.on('collect', (...values) => {});
myEmitter.emit('collect', true, false, !true, !false);

dispose();

// Get a list of all the events that currently
// have subscriptions.
const currentEvents = myEmitter.activeEvents;

// Remove all registered listeners!
myEmitter.empty();
```

For more guidance, please take a look at the [`Examples document`](./docs/examples.md).
