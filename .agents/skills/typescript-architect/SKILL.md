---
name: typescript-architect
description: Advanced TypeScript Architect & Type Soundness Purist. Enforces nominal branded typing, algebraic data types (discriminated unions), compile-time exhaustiveness, monadic Result types, exact optional contracts, and zero type escapes.
---

# Advanced TypeScript Architecture & Type Soundness

This skill defines the mathematical and theoretical standards for TypeScript typing in `popover-trail`.

## 1. Nominal Branded Types & Domain Identity
- Prevent primitive obsession by branding domain keys with unique symbols:
  ```typescript
  declare const __brand: unique symbol;
  export type PopoverKey = string & { readonly [__brand]: 'PopoverKey' };
  ```
- Export factory constructors and custom type guards:
  ```typescript
  export const toPopoverKey = (key: string): PopoverKey => key as PopoverKey;
  export const isPopoverKey = (val: unknown): val is PopoverKey => typeof val === 'string' && val.length > 0;
  ```
- Domain keys must never be mixed (`PopoverKey`, `TriggerId`, `ScopeId`, `SubscriptionId`).

## 2. Algebraic Data Types (ADT) & Discriminated Unions
- Model all multi-state entities as closed disjoint sums:
  $$\mathcal{S} = \mathcal{S}_{\text{idle}} \uplus \mathcal{S}_{\text{opening}} \uplus \mathcal{S}_{\text{open}} \uplus \mathcal{S}_{\text{closing}} \uplus \mathcal{S}_{\text{closed}} \uplus \mathcal{S}_{\text{unmounted}}$$
- Use a single, consistent discriminant property (`status` or `type`).
- Forbid mutually exclusive optional properties on a single object type.

## 3. Total Functions & Exhaustive Pattern Matching
- Every branch over a discriminated union must enforce compile-time exhaustiveness:
  ```typescript
  export const assertNever = (x: never): never => {
    throw new Error(`Unhandled union variant: ${JSON.stringify(x)}`);
  };
  ```
- No silent fallback `default:` branches in state transition logic.

## 4. Monadic Error Modeling (Result Monad)
- Eliminate unchecked runtime exceptions in core domain logic:
  ```typescript
  export type Result<T, E = DomainError> =
    | { readonly ok: true; readonly value: T }
    | { readonly ok: false; readonly error: E };
  ```
- Chain fallible pipelines via Kleisli composition.

## 5. Strict Compiler Flags & Zero Type Escapes
- 0% `any`, 0% unsafe dual assertions (`as unknown as T`), 0% non-null assertions (`!`).
- Enforce `exactOptionalPropertyTypes` (`{ prop?: T }` vs `{ prop?: T | undefined }`).
- Deep immutability for constants: `as const` and `readonly` records.

## 6. Type-Level Verification (`test-d.ts`)
- Validate generic type signatures with static equality assertions:
  ```typescript
  type Expect<T extends true> = T;
  type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;
  ```
