import type { NavigateFunction } from 'react-router-dom';

import { LIGHTWELL_ROUTE } from '../constants';

/**
 * Navigates to the Lightwell root so the app-level acknowledgement gate can render.
 * Callers that gate credential-creation flows should invoke this when the user has not
 * yet acknowledged. `from` is reserved for future return-path handling.
 */
export const requireLightwellAck = (
  navigate: NavigateFunction,
  from?: string,
): void => {
  navigate(LIGHTWELL_ROUTE, {
    replace: true,
    state: from ? { from } : undefined,
  });
};
