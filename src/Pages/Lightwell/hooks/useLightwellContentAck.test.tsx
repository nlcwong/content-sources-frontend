import {
  LIGHTWELL_ACK_TEXT_VERSION,
  LIGHTWELL_CONTENT_ACKNOWLEDGED_LABEL,
} from '../constants';
import { parseLightwellContentAck } from './useLightwellContentAck';

describe('parseLightwellContentAck', () => {
  it('returns false when preferences are missing', () => {
    expect(parseLightwellContentAck(undefined)).toBe(false);
    expect(parseLightwellContentAck([])).toBe(false);
  });

  it('returns true when acknowledgement matches the current text version', () => {
    expect(
      parseLightwellContentAck([
        {
          label: LIGHTWELL_CONTENT_ACKNOWLEDGED_LABEL,
          value: JSON.stringify({
            acknowledged: true,
            textVersion: LIGHTWELL_ACK_TEXT_VERSION,
          }),
        },
      ]),
    ).toBe(true);
  });

  it('returns false when text version does not match', () => {
    expect(
      parseLightwellContentAck([
        {
          label: LIGHTWELL_CONTENT_ACKNOWLEDGED_LABEL,
          value: JSON.stringify({
            acknowledged: true,
            textVersion: 'v0',
          }),
        },
      ]),
    ).toBe(false);
  });

  it('returns false when preference value is invalid JSON', () => {
    expect(
      parseLightwellContentAck([
        {
          label: LIGHTWELL_CONTENT_ACKNOWLEDGED_LABEL,
          value: 'not-json',
        },
      ]),
    ).toBe(false);
  });
});
