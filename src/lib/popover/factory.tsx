import {
  PopoverProvider as CorePopoverProvider,
  PopoverPortal as CorePopoverPortal,
  usePopover as coreUsePopover,
  usePopoverActions as coreUsePopoverActions,
  usePopoverContext as coreUsePopoverContext,
  PopoverTrigger as CorePopoverTrigger,
  type UsePopoverResult,
} from './index';
import type { PopoverProviderProps } from './context';
import type { PopoverTriggerProps } from './components/PopoverTrigger';

/**
 * Creates a pre-typed set of components and hooks bound to specific TData, TContext, and TPopoverKey types.
 * Helps eliminate generic boilerplate throughout the application codebase.
 *
 * @template TData - The resolved data payload type.
 * @template TContext - The global shared context type.
 * @template TPopoverKey - Union of valid popover keys.
 * @returns An object containing the typed Provider, Trigger, and state hooks.
 */
export function createPopoverTrail<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>() {
  /**
   * Type-safe PopoverProvider component pre-bound to your data and context shapes.
   *
   * @param props - Provider configuration properties.
   * @returns The provider element wrapping children.
   */
  function PopoverProvider(props: PopoverProviderProps<TData, TContext>) {
    return (
      <CorePopoverProvider {...(props as unknown as PopoverProviderProps)} />
    );
  }
  PopoverProvider.displayName = 'PopoverProvider';

  /**
   * Type-safe PopoverTrigger component pre-bound to your popover keys.
   *
   * @param props - Trigger configuration properties.
   * @returns The cloned React element with event handlers.
   */
  function PopoverTrigger(props: PopoverTriggerProps<TPopoverKey>) {
    return <CorePopoverTrigger {...props} />;
  }
  PopoverTrigger.displayName = 'PopoverTrigger';

  return {
    PopoverProvider,
    PopoverPortal: CorePopoverPortal,
    PopoverTrigger,
    /**
     * Type-safe usePopover selector hook pre-bound to your data and context shapes.
     *
     * @param key - The unique identifier key of the popover card.
     * @returns Unified data values and pre-bound action wrappers.
     */
    usePopover: (key: TPopoverKey): UsePopoverResult<TData> =>
      coreUsePopover<TData, TContext>(key),
    /**
     * Type-safe usePopoverActions hook pre-bound to your data and context shapes.
     *
     * @returns Object containing type-safe dispatch actions.
     */
    usePopoverActions: () => coreUsePopoverActions<TData, TContext>(),
    /**
     * Type-safe usePopoverContext hook pre-bound to your context shape.
     *
     * @returns The active context object.
     */
    usePopoverContext: () => coreUsePopoverContext<TContext>(),
  };
}
