# Future

This document describes some of the follow-up tasks I have in mind.

## Write tests

I have not actually authored any tests yet... but I plan to use `vitest` once I’m ready.

## Figure out the right `peerDependencies`

I might need to add `typescript` as a peer dep.

Also, `@changesets` should be moved to `devDeps`.

## No dynamic delete

I got sloppy and used the `delete` keyword... I need to remove the `@typescript-eslint/no-dynamic-delete` override and filter that `object` properly.

## Revisit loose equality checks

There are some `null` checks in `EmittenProtected` I wan't to more thoroughly check.

## Reconsider some TSConfig/ESLint

I already know that I want to remove the `@typescript-eslint/no-dynamic-delete` fron `.eslintrc`. Additionally, I might want to disable `@typescript-eslint/strict-boolean-expressions`.
