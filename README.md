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

For more guidance, please take a look at the [`Examples document`](./docs/examples.md).
