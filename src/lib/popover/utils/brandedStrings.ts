/**
 * Smart Constructors and Runtime Invariant Validation for Branded Strings.
 *
 * @module utils/brandedStrings
 */

import {
  type Brand,
  type PopoverKey,
  type ParentKey,
  type OwnerId,
  type StackGroupId,
  type TriggerId,
  type ScopeId,
  type SubscriptionId,
  type StorageKey,
  type ChannelId,
  type CacheKey,
  type Unbrand,
  createBrand,
} from '../types/branded';

/**
 * Higher-order factory creating smart constructor and type guard for a branded string domain entity.
 *
 * @template B - Brand discriminator name.
 * @param brandName - Entity name for error reporting and brand identification.
 */
export function createBrandedIdentity<B extends string>(brandName: B) {
  return {
    toBrand: <S extends string = string>(val: S | Unbrand<Brand<S, B>>): Brand<S, B> => {
      if (typeof val !== 'string' || val.trim().length === 0) {
        throw new TypeError(`[popover-trail]: ${brandName} must be a non-empty string.`);
      }
      return createBrand<S, B>(val as S);
    },
    isBrand: (val: unknown): val is Brand<string, B> =>
      typeof val === 'string' && val.trim().length > 0,
  };
}


const popoverKeyIdentity = createBrandedIdentity('PopoverKey');
/** Smart constructor for `PopoverKey`. Validates non-empty trimmed string. */
export const toPopoverKey: <K extends string = string>(key: K) => PopoverKey<K> =
  popoverKeyIdentity.toBrand;
/** Type guard predicate checking if a value is a valid non-empty PopoverKey. */
export const isPopoverKey: (value: unknown) => value is PopoverKey =
  popoverKeyIdentity.isBrand;

const parentKeyIdentity = createBrandedIdentity('ParentKey');
/** Smart constructor for `ParentKey`. */
export const toParentKey: <K extends string = string>(key: K) => ParentKey<K> =
  parentKeyIdentity.toBrand;
/** Type guard predicate checking if a value is a valid non-empty ParentKey. */
export const isParentKey: (value: unknown) => value is ParentKey =
  parentKeyIdentity.isBrand;

const ownerIdIdentity = createBrandedIdentity('OwnerId');
/** Smart constructor for `OwnerId`. */
export const toOwnerId: <O extends string = string>(ownerId: O) => OwnerId<O> =
  ownerIdIdentity.toBrand;
/** Type guard predicate checking if a value is a valid non-empty OwnerId. */
export const isOwnerId: (value: unknown) => value is OwnerId =
  ownerIdIdentity.isBrand;

const stackGroupIdIdentity = createBrandedIdentity('StackGroupId');
/** Smart constructor for `StackGroupId`. */
export const toStackGroupId: <G extends string = string>(groupId: G) => StackGroupId<G> =
  stackGroupIdIdentity.toBrand;
/** Type guard predicate checking if a value is a valid non-empty StackGroupId. */
export const isStackGroupId: (value: unknown) => value is StackGroupId =
  stackGroupIdIdentity.isBrand;

const triggerIdIdentity = createBrandedIdentity('TriggerId');
/** Smart constructor for `TriggerId`. */
export const toTriggerId: <T extends string = string>(id: T) => TriggerId<T> =
  triggerIdIdentity.toBrand;
/** Type guard predicate checking if a value is a valid non-empty TriggerId. */
export const isTriggerId: (value: unknown) => value is TriggerId =
  triggerIdIdentity.isBrand;

const scopeIdIdentity = createBrandedIdentity('ScopeId');
/** Smart constructor for `ScopeId`. */
export const toScopeId: <T extends string = string>(id: T) => ScopeId<T> =
  scopeIdIdentity.toBrand;
/** Type guard predicate checking if a value is a valid non-empty ScopeId. */
export const isScopeId: (value: unknown) => value is ScopeId =
  scopeIdIdentity.isBrand;

const subscriptionIdIdentity = createBrandedIdentity('SubscriptionId');
/** Smart constructor for `SubscriptionId`. */
export const toSubscriptionId: <T extends string = string>(id: T) => SubscriptionId<T> =
  subscriptionIdIdentity.toBrand;
/** Type guard predicate checking if a value is a valid non-empty SubscriptionId. */
export const isSubscriptionId: (value: unknown) => value is SubscriptionId =
  subscriptionIdIdentity.isBrand;

const storageKeyIdentity = createBrandedIdentity('StorageKey');
/** Smart constructor for `StorageKey`. */
export const toStorageKey: <T extends string = string>(key: T) => StorageKey<T> =
  storageKeyIdentity.toBrand;
/** Type guard predicate checking if a value is a valid non-empty StorageKey. */
export const isStorageKey: (value: unknown) => value is StorageKey =
  storageKeyIdentity.isBrand;

const channelIdIdentity = createBrandedIdentity('ChannelId');
/** Smart constructor for `ChannelId`. */
export const toChannelId: <T extends string = string>(id: T) => ChannelId<T> =
  channelIdIdentity.toBrand;
/** Type guard predicate checking if a value is a valid non-empty ChannelId. */
export const isChannelId: (value: unknown) => value is ChannelId =
  channelIdIdentity.isBrand;

const cacheKeyIdentity = createBrandedIdentity('CacheKey');
/** Smart constructor for `CacheKey`. Validates non-empty trimmed string. */
export const toCacheKey: <K extends string = string>(key: K) => CacheKey<K> =
  cacheKeyIdentity.toBrand;
/** Type guard predicate checking if a value is a valid non-empty CacheKey. */
export const isCacheKey: (value: unknown) => value is CacheKey =
  cacheKeyIdentity.isBrand;
