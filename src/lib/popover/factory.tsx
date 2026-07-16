import {
  PopoverProvider as CorePopoverProvider,
  PopoverPortal as CorePopoverPortal,
  usePopover as coreUsePopover,
  usePopoverActions as coreUsePopoverActions,
  usePopoverContext as coreUsePopoverContext,
  PopoverTrigger as CorePopoverTrigger,
} from './index';
import type { PopoverProviderProps } from './context';
import type { PopoverTriggerProps } from './components/PopoverTrigger';

/**
 * Creates a pre-typed set of components and hooks bound to specific TData and TContext types.
 * Helps eliminate generic boilerplate throughout the application codebase.
 *
 * @template TData - The resolved data payload type.
 * @template TContext - The global shared context type.
 */
export function createPopoverTrail<TData = unknown, TContext = unknown>() {
  function PopoverProvider(props: PopoverProviderProps<TData, TContext>) {
    return <CorePopoverProvider {...(props as any)} />;
  }

  function PopoverTrigger(props: PopoverTriggerProps) {
    return <CorePopoverTrigger {...props} />;
  }

  function usePopover(key: string) {
    return coreUsePopover<TData, TContext>(key);
  }

  function usePopoverActions() {
    return coreUsePopoverActions<TData, TContext>();
  }

  function usePopoverContext() {
    return coreUsePopoverContext<TContext>();
  }

  return {
    PopoverProvider,
    PopoverPortal: CorePopoverPortal,
    PopoverTrigger,
    usePopover,
    usePopoverActions,
    usePopoverContext,
  };
}
