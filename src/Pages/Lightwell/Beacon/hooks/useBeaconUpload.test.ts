import { renderHook, act } from '@testing-library/react';

import { useBeaconUpload } from './useBeaconUpload';
import { BEACON_UPLOAD_MAX_FILE_SIZE_BYTES } from '../uploadTypes';

describe('useBeaconUpload', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('rejects files over the size limit', () => {
    const { result } = renderHook(() => useBeaconUpload());
    const largeFile = new File(['x'], 'big.csv', { type: 'text/csv' });
    Object.defineProperty(largeFile, 'size', { value: BEACON_UPLOAD_MAX_FILE_SIZE_BYTES + 1 });

    act(() => {
      result.current.uploadProps.onDropAccepted([largeFile]);
    });

    expect(result.current.uploadProps.fileError).toMatch(/size limit/i);
    expect(result.current.step).toBe('select');
  });

  it('completes a mock upload for a valid file', () => {
    const { result } = renderHook(() => useBeaconUpload());
    const file = new File(['cve,package'], 'vulns.csv', { type: 'text/csv' });

    act(() => {
      result.current.uploadProps.onDropAccepted([file]);
    });

    expect(result.current.step).toBe('uploading');

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(result.current.step).toBe('complete');
    expect(result.current.isComplete).toBe(true);
  });
});
