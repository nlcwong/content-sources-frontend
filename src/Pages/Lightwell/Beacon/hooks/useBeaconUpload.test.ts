import { renderHook, act } from '@testing-library/react';

import { useBeaconUpload } from './useBeaconUpload';

const validPayload = JSON.stringify({
  findings: [
    {
      vulnerability_id: 'VULN-1',
      packageurl: 'pkg:maven/org.example/lib@1.0.0',
      title: 'Example',
      description: 'Details',
      cvss_severity: 'High',
      cvss_score: 7.5,
    },
  ],
});

describe('useBeaconUpload', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('surfaces structural errors for invalid JSON', () => {
    const { result } = renderHook(() => useBeaconUpload());

    act(() => {
      result.current.uploadProps.onJsonTextChange('{');
    });
    act(() => {
      result.current.uploadProps.onSubmit();
    });
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.step).toBe('error');
    expect(result.current.uploadProps.structuralErrors[0].message).toMatch(/Invalid JSON/i);
  });

  it('records Received with a durable submission id after structural pass', () => {
    const { result } = renderHook(() => useBeaconUpload());

    act(() => {
      result.current.uploadProps.onJsonTextChange(validPayload);
    });
    act(() => {
      result.current.uploadProps.onSubmit();
    });

    expect(result.current.step).toBe('validating');

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.step).toBe('received');
    expect(result.current.isReceived).toBe(true);
    expect(result.current.submissionId).toMatch(/^SUB-/);

    const stored = JSON.parse(localStorage.getItem('lightwell-beacon-submissions') ?? '[]');
    expect(stored).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          status: 'Received',
          findingCount: 1,
          id: result.current.submissionId,
        }),
      ]),
    );
  });
});
