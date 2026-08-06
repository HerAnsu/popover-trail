import { describe, it, expect } from 'vitest';
import * as storeReducers from './storeReducers';

describe('storeReducers facade', () => {
  it('re-exports pure state reducer functions', () => {
    expect(storeReducers.openRootState).toBeDefined();
    expect(storeReducers.pushNestedState).toBeDefined();
    expect(storeReducers.closeFromState).toBeDefined();
    expect(storeReducers.togglePinState).toBeDefined();
    expect(storeReducers.bringToFrontPatch).toBeDefined();
  });
});
