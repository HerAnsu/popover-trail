import { isDevEnv } from '../validators';

export interface PopoverLogger {
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

export const logger: PopoverLogger = {
  debug: (...args: unknown[]) => {
    if (isDevEnv()) {
      console.debug(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (isDevEnv()) {
      console.info(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDevEnv()) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};
