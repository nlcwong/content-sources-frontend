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

  it('surfaces structural errors for invalid JSON', async () => {
    jest.useRealTimers();
    const { result } = renderHook(() => useBeaconUpload());
    const invalid = new File(['{'], 'bad.json', { type: 'application/json' });

    await act(async () => {
      await result.current.uploadProps.onFilesAccepted([invalid]);
    });
    act(() => {
      result.current.uploadProps.onSubmit();
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    expect(result.current.step).toBe('error');
    expect(result.current.uploadProps.structuralErrors[0].message).toMatch(/Invalid JSON/i);
  });

  it('records one Submitted row per findings JSON after structural pass', async () => {
    jest.useRealTimers();
    const { result } = renderHook(() => useBeaconUpload());
    const first = new File([validPayload], 'a.json', { type: 'application/json' });
    const second = new File([validPayload], 'b.json', { type: 'application/json' });

    await act(async () => {
      await result.current.uploadProps.onFilesAccepted([first, second]);
    });
    act(() => {
      result.current.uploadProps.onSubmit();
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    expect(result.current.step).toBe('received');
    expect(result.current.isReceived).toBe(true);
    expect(result.current.submissionIds).toHaveLength(2);
    expect(result.current.submissionId).toMatch(/^SUB-/);

    const stored = JSON.parse(localStorage.getItem('lightwell-beacon-submissions') ?? '[]');
    expect(stored).toHaveLength(2);
    expect(stored).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          status: 'Submitted, waiting for validation',
          jsonFilename: 'a.json',
          findingCount: 1,
        }),
        expect.objectContaining({
          status: 'Submitted, waiting for validation',
          jsonFilename: 'b.json',
          findingCount: 1,
        }),
      ]),
    );
  });

  it('accepts multiple findings JSON files from one drop', async () => {
    jest.useRealTimers();
    const { result } = renderHook(() => useBeaconUpload());
    const first = new File([validPayload], 'a.json', { type: 'application/json' });
    const second = new File([validPayload], 'b.json', { type: 'application/json' });

    await act(async () => {
      await result.current.uploadProps.onFilesAccepted([first, second]);
    });

    expect(result.current.uploadProps.pendingFiles.map((file) => file.filename)).toEqual([
      'a.json',
      'b.json',
    ]);
    expect(result.current.step).toBe('select');
  });

  it('attaches reproducers to a specific pending findings file', async () => {
    jest.useRealTimers();
    const { result } = renderHook(() => useBeaconUpload());
    const jsonFile = new File([validPayload], 'findings.json', { type: 'application/json' });

    await act(async () => {
      await result.current.uploadProps.onFilesAccepted([jsonFile]);
    });

    const pendingId = result.current.uploadProps.pendingFiles[0].id;
    const first = new File(['a'], 'repro-a.bin');
    const second = new File(['b'], 'repro-b.txt');

    await act(async () => {
      await result.current.uploadProps.onReproducerSelected(pendingId, [first, second]);
    });

    expect(
      result.current.uploadProps.pendingFiles[0].reproducers.map((file) => file.name),
    ).toEqual(['repro-a.bin', 'repro-b.txt']);
  });

  it('rejects non-JSON files in the dropzone', async () => {
    jest.useRealTimers();
    const { result } = renderHook(() => useBeaconUpload());
    const jsonFile = new File([validPayload], 'a.json', { type: 'application/json' });
    const other = new File(['poc'], 'notes.txt', { type: 'text/plain' });

    await act(async () => {
      await result.current.uploadProps.onFilesAccepted([jsonFile, other]);
    });

    expect(result.current.step).toBe('error');
    expect(result.current.uploadProps.processError).toMatch(/Unsupported file type/i);
  });
});
