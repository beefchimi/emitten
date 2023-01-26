# Future

This document describes some of the follow-up tasks I have in mind.

## Stricter callback argument

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

## No dynamic delete

I got sloppy and used the `delete` keyword... I need to remove the `@typescript-eslint/no-dynamic-delete` override and filter that `object` properly.

## Write tests

I have not actually authored any tests yet... but I plan to use `vitest` once I’m ready.

## Figure out the right `peerDependencies`

I might need to add `typescript` as a peer dep.
