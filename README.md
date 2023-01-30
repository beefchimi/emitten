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
import type {EmittenMap} from 'emitten';

type EventMap = EmittenMap & {
  change(value: string): void;
  count(value?: number): void;
  collect(...values: boolean[]): void;
};

const myEmitter = new Emitten<EventMap>();

const dispose = myEmitter.on('change', (value) => {});
myEmitter.emit('change', 'Hello world');

dispose();
```

For more guidance, please take a look at the [`Examples document`](./docs/examples.md).
