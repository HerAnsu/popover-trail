import { isDevEnv, warnDevDetails } from './warningEngine';

/** PT-109: Validates cascade offset step. */
export function validateCascadeStep(step: number | undefined): void {
  if (!isDevEnv() || step === undefined) return;

  if (typeof step !== 'number' || step < 0 || step > 200) {
    warnDevDetails(true, {
      code: 'PT-109',
      message: `Cascade offset step of ${step}px is outside valid range (0px to 200px).`,
    });
  }
}

/** PT-110: Validates default offset gap. */
export function validateDefaultOffset(offset: number | undefined): void {
  if (!isDevEnv() || offset === undefined) return;

  if (typeof offset !== 'number' || offset < 0 || offset > 500) {
    warnDevDetails(true, {
      code: 'PT-110',
      message: `Default offset gap of ${offset}px is outside valid range (0px to 500px).`,
    });
  }
}

/** PT-111: Validates base z-index. */
export function validateBaseZIndex(zIndex: number | undefined): void {
  if (!isDevEnv() || zIndex === undefined) return;

  if (typeof zIndex !== 'number' || zIndex < 0) {
    warnDevDetails(true, {
      code: 'PT-111',
      message: `Base z-index of ${zIndex} is invalid (must be a positive number).`,
    });
  }
}

/** PT-112: Validates exit transition duration. */
export function validateExitDuration(duration: number | undefined): void {
  if (!isDevEnv() || duration === undefined) return;

  if (typeof duration !== 'number' || duration < 0 || duration > 10000) {
    warnDevDetails(true, {
      code: 'PT-112',
      message: `Exit transition duration of ${duration}ms is outside valid range (0ms to 10000ms).`,
    });
  }
}

/** PT-113: Validates provider resolver initialization. */
export function validateProviderResolver(hasResolver: boolean): void {
  if (!isDevEnv()) return;

  if (!hasResolver) {
    warnDevDetails(true, {
      code: 'PT-113',
      message:
        '<PopoverProvider> was instantiated without a "resolveData" callback or "schema" prop.',
    });
  }
}

/** PT-115: Validates maximum cascade depth. */
export function validateCascadeDepth(depth: number): void {
  if (!isDevEnv()) return;

  if (depth > 10) {
    warnDevDetails(true, {
      code: 'PT-115',
      message: `Deep popover cascade stack detected (depth = ${depth}). High cascade depth may impair UI usability.`,
    });
  }
}

/** PT-126: Validates createPopoverTrail factory placement. */
export function validateFactoryPlacement(isInsideRender?: boolean): void {
  if (!isDevEnv() || !isInsideRender) return;

  warnDevDetails(true, {
    code: 'PT-126',
    message:
      'createPopoverTrail() should be called at top-level module scope, not inside a React component render pass.',
  });
}

/** PT-127: Validates store instance provided to createPopoverController. */
export function validateStoreControllerInstance(store: unknown): void {
  if (!isDevEnv()) return;

  if (!store || typeof (store as { getState?: unknown }).getState !== 'function') {
    warnDevDetails(true, {
      code: 'PT-127',
      message: 'createPopoverController() received an invalid or undefined Zustand store instance.',
    });
  }
}
