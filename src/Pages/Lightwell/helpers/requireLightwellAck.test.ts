import type { NavigateFunction } from 'react-router-dom';

import { LIGHTWELL_ROUTE } from '../constants';
import { requireLightwellAck } from './requireLightwellAck';

describe('requireLightwellAck', () => {
  it('navigates to the Lightwell root with an optional return path', () => {
    const navigate = jest.fn() as unknown as NavigateFunction;

    requireLightwellAck(navigate, '/lightwell/java-validated');

    expect(navigate).toHaveBeenCalledWith(LIGHTWELL_ROUTE, {
      replace: true,
      state: { from: '/lightwell/java-validated' },
    });
  });

  it('navigates without state when no return path is provided', () => {
    const navigate = jest.fn() as unknown as NavigateFunction;

    requireLightwellAck(navigate);

    expect(navigate).toHaveBeenCalledWith(LIGHTWELL_ROUTE, {
      replace: true,
      state: undefined,
    });
  });
});
