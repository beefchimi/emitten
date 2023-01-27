# Future

This document describes some of the follow-up tasks I have in mind.

## Stricter callback argument

I seem to have gotten close to successfully typing the `...values` argument for `EmittenListener`, but I am still failing to:

**Figure out how to correctly type a custom `EventMap`:**

- Currently, I get an error on the generic for `new Emitten<EventMap>()`:
  - `Type 'EventMap' does not satisfy the constraint 'EmittenMap'.`
  - `Index signature for type 'string' is missing in type 'EventMap'`

**Figure out how to limit the number of `values`:**

This _could be resolved_ once I figure out the error above. But currently - while I do get some better typing on my listener arguments - I seem to get inconsistent type complains when passing arguments:

```ts
interface EventMap {
  hello(value: string): void;
  count(value: number): void;
  multi(one: string, two: number, three?: boolean): void;
  single(value?: boolean): void;
  all(): void;
}

// Double check that this works as expected.
menuEvents.on('hello', (one, two, three) => {});

// The extra arguments may not always get reported?
menuEvents.emit('hello', 'Hello World', 123);
menuEvents.emit('multi', '1', 2, false, 'hello', true);
```

But, it might be that using a `type` instead of `interface` will work:

```ts
type EventMap = EmittenMap & {
  hello(value: string): void;
  count(value: number): void;
  multi(one: string, two: number, three?: boolean): void;
  single(value?: boolean): void;
  all(): void;
};

const menuEvents = new Emitten<EventMap>();
```

## No dynamic delete

I got sloppy and used the `delete` keyword... I need to remove the `@typescript-eslint/no-dynamic-delete` override and filter that `object` properly.

## Write tests

I have not actually authored any tests yet... but I plan to use `vitest` once I’m ready.

## Figure out the right `peerDependencies`

I might need to add `typescript` as a peer dep.

Also, `@changesets` should be moved to `devDeps`.

## Remove `disposable` in favour of `on`

I can probably jsut return the `.off` within `.on`... I don't think we need a separate `disposable` method.

## Revisit loose equality checks

There are some `null` checks in `EmittenProtected` I wan't to more thoroughly check.
