# Future

This document describes some of the follow-up tasks I have in mind.

## Stricter callback argument

I seem to have gotten close to successfully typing the `...values` argument for `EmittenListener`, but I am still failing to:

**Figure out how to correctly type a custom `EventMap`:**

- Currently, I get an error on the generic for `new Emitten<EventMap>()`:
  - `Type 'EventMap' does not satisfy the constraint 'EmittenMap'.`
  - `Index signature for type 'string' is missing in type 'EventMap'`

```ts
interface EventMap {
  hello(value: string): void;
  count(value: number): void;
  multi(one: string, two: number, three?: boolean): void;
  single(value?: boolean): void;
  all(): void;
}
```

At the moment, I need to make sure the `Generic` passed to `Emitten` always `extends EmittenMap`:

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

It would be nice if I could avoid this.

## No dynamic delete

I got sloppy and used the `delete` keyword... I need to remove the `@typescript-eslint/no-dynamic-delete` override and filter that `object` properly.

## Write tests

I have not actually authored any tests yet... but I plan to use `vitest` once I’m ready.

## Figure out the right `peerDependencies`

I might need to add `typescript` as a peer dep.

Also, `@changesets` should be moved to `devDeps`.

## Revisit loose equality checks

There are some `null` checks in `EmittenProtected` I wan't to more thoroughly check.

## Reconsider some TSConfig/ESLint

I already know that I want to remove the `@typescript-eslint/no-dynamic-delete` fron `.eslintrc`. Additionally, I might want to disable `@typescript-eslint/strict-boolean-expressions`.
