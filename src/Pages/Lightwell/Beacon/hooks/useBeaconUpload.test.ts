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

  it('accepts JSON and optional POC from one file drop', async () => {
    jest.useRealTimers();
    const { result } = renderHook(() => useBeaconUpload());
    const jsonFile = new File([validPayload], 'findings.json', { type: 'application/json' });
    const pocFile = new File(['poc'], 'POC-Reports_2026-09-29.tar.gz', {
      type: 'application/gzip',
    });

    await act(async () => {
      await result.current.uploadProps.onFilesAccepted([jsonFile, pocFile]);
    });

    expect(result.current.uploadProps.jsonFilename).toBe('findings.json');
    expect(result.current.uploadProps.jsonText).toBe(validPayload);
    expect(result.current.uploadProps.pocFile?.name).toBe('POC-Reports_2026-09-29.tar.gz');
    expect(result.current.step).toBe('select');
  });

  it('rejects two JSON files in one drop', async () => {
    const { result } = renderHook(() => useBeaconUpload());
    const first = new File([validPayload], 'a.json', { type: 'application/json' });
    const second = new File([validPayload], 'b.json', { type: 'application/json' });

    await act(async () => {
      result.current.uploadProps.onFilesAccepted([first, second]);
    });

    expect(result.current.step).toBe('error');
    expect(result.current.uploadProps.processError).toMatch(/only one vulnerability findings JSON/i);
  });
});
