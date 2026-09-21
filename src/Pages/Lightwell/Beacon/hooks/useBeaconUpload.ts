import { useCallback, useState } from 'react';

import { addBeaconSubmission } from '../utils/beaconSubmissionsStore';
import {
  BEACON_UPLOAD_MAX_FILE_SIZE_BYTES,
  BEACON_UPLOAD_MAX_FILE_SIZE_MB,
  type BeaconUploadStep,
} from '../uploadTypes';

const MOCK_UPLOAD_DELAY_MS = 1200;

export type BeaconUploadCardProps = {
  step: BeaconUploadStep;
  file?: File;
  fileError?: string;
  processError?: string;
  onDropAccepted: (files: File[]) => void;
  onRetry: () => void;
};

/**
 * Mock Beacon vulnerability-file upload for LWLP-1269 prototypes.
 * Successful uploads are recorded in localStorage for submissions / STAM panels.
 * Uses dropzoneProps.onDropAccepted (same PatternFly pattern as Lens) to avoid a PF bug
 * where onFileInputChange fires twice when selecting a file via the browser dialog.
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

  const completeUpload = useCallback((selectedFile: File) => {
    addBeaconSubmission({
      filename: selectedFile.name,
      sizeBytes: selectedFile.size,
    });
    setStep('complete');
  }, []);

  const handleFileAccepted = useCallback(
    (acceptedFiles: File[]) => {
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
        completeUpload(selectedFile);
      }, MOCK_UPLOAD_DELAY_MS);
    },
    [completeUpload],
  );

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
      completeUpload(file);
    }, MOCK_UPLOAD_DELAY_MS);
  };

  const uploadProps: BeaconUploadCardProps = {
    step,
    file,
    fileError,
    processError,
    onDropAccepted: handleFileAccepted,
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
