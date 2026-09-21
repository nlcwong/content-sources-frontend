import { useCallback, useState } from 'react';
import type { MouseEventHandler } from 'react';

import {
  BEACON_UPLOAD_MAX_FILE_SIZE_BYTES,
  BEACON_UPLOAD_MAX_FILE_SIZE_MB,
  type BeaconUploadStep,
  type BeaconUploadValidated,
} from '../uploadTypes';

const MOCK_UPLOAD_DELAY_MS = 1200;

export type BeaconUploadCardProps = {
  step: BeaconUploadStep;
  file?: File;
  fileError?: string;
  processError?: string;
  validated: BeaconUploadValidated;
  onDropAccepted: (files: File[]) => void;
  onClearClick: MouseEventHandler<HTMLButtonElement>;
  onRetry: () => void;
};

/**
 * Mock Beacon vulnerability-file upload for LWLP-1269 prototypes.
 * No backend API is called; upload progress is simulated.
 */
export const useBeaconUpload = () => {
  const [step, setStep] = useState<BeaconUploadStep>('select');
  const [file, setFile] = useState<File | undefined>();
  const [fileError, setFileError] = useState<string | undefined>();
  const [processError, setProcessError] = useState<string | undefined>();

  const resetErrors = () => {
    setFileError(undefined);
    setProcessError(undefined);
  };

  const handleFileAccepted = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    if (selectedFile.size > BEACON_UPLOAD_MAX_FILE_SIZE_BYTES) {
      setFile(selectedFile);
      setFileError(
        `File exceeds the ${BEACON_UPLOAD_MAX_FILE_SIZE_MB} MB size limit. Please try a smaller file.`,
      );
      return;
    }

    resetErrors();
    setFile(selectedFile);
    setStep('uploading');

    window.setTimeout(() => {
      setStep('complete');
    }, MOCK_UPLOAD_DELAY_MS);
  }, []);

  const handleClearFile: MouseEventHandler<HTMLButtonElement> = () => {
    setStep('select');
    setFile(undefined);
    resetErrors();
  };

  const startOver = () => {
    setStep('select');
    setFile(undefined);
    resetErrors();
  };

  const onRetry = () => {
    if (!file) {
      startOver();
      return;
    }
    setProcessError(undefined);
    setStep('uploading');
    window.setTimeout(() => {
      setStep('complete');
    }, MOCK_UPLOAD_DELAY_MS);
  };

  const validated: BeaconUploadValidated = fileError ? 'error' : file ? 'success' : 'default';

  const uploadProps: BeaconUploadCardProps = {
    step,
    file,
    fileError,
    processError,
    validated,
    onDropAccepted: handleFileAccepted,
    onClearClick: handleClearFile,
    onRetry,
  };

  return {
    step,
    file,
    uploadProps,
    startOver,
    isComplete: step === 'complete',
  };
};
