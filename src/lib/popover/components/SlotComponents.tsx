import type { TrailEntry } from '../types';

export interface PinButtonProps {
  isPinned: boolean;
  onClick: () => void;
  keyId: string;
  entry?: TrailEntry;
}

export interface CloseButtonProps {
  onClick: () => void;
  keyId: string;
  entry?: TrailEntry;
}

export interface LoadingSpinnerProps {
  keyId: string;
  entry?: TrailEntry;
}

export interface ErrorFallbackProps {
  error: Error;
  onRetry: () => void;
  keyId: string;
  entry?: TrailEntry;
}

/**
 * Standard accessible Pin/Unpin button slot component.
 */
export function DefaultPinButton({ isPinned, onClick }: PinButtonProps) {
  return (
    <button
      type="button"
      className={`popover-pin-btn ${isPinned ? 'pinned' : ''}`}
      onClick={onClick}
      aria-label={isPinned ? 'Unpin popover' : 'Pin popover'}>
      {isPinned ? '📌' : '📍'}
    </button>
  );
}

/**
 * Standard accessible Close button slot component.
 */
export function DefaultCloseButton({ onClick }: CloseButtonProps) {
  return (
    <button
      type="button"
      className="popover-close-btn"
      onClick={onClick}
      aria-label="Close popover">
      ✕
    </button>
  );
}

/**
 * Standard accessible Loading spinner slot component.
 */
export function DefaultLoadingSpinner({ keyId }: LoadingSpinnerProps) {
  return (
    <div className="popover-loading" aria-label={`Loading popover ${keyId}`}>
      <span className="popover-spinner" />
    </div>
  );
}

/**
 * Standard accessible Error fallback slot component.
 */
export function DefaultErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <div className="popover-error" role="alert">
      <p>{error.message || 'Failed to load content'}</p>
      <button type="button" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}
