import { useCallback, useState } from 'react';

import { addBeaconSubmission } from '../utils/beaconSubmissionsStore';
import {
  isPocArchiveFilename,
  validateVulnerabilitySubmissionJson,
  type StructuralValidationError,
} from '../utils/validateVulnerabilitySubmission';
import {
  BEACON_MOCK_ORG_NAME,
  BEACON_UPLOAD_MAX_FILE_SIZE_BYTES,
  BEACON_UPLOAD_MAX_FILE_SIZE_MB,
  type BeaconUploadStep,
} from '../uploadTypes';

const MOCK_VALIDATE_DELAY_MS = 900;

export type BeaconUploadCardProps = {
  step: BeaconUploadStep;
  jsonText: string;
  jsonFilename?: string;
  pocFile?: File;
  structuralErrors: StructuralValidationError[];
  processError?: string;
  submissionId?: string;
  findingCount?: number;
  onJsonTextChange: (value: string) => void;
  onJsonFileAccepted: (files: File[]) => void;
  onPocFileAccepted: (files: File[]) => void;
  onClearPoc: () => void;
  onSubmit: () => void;
  onRetry: () => void;
  onStartOver: () => void;
};

/**
 * Mock contract-shaped Beacon upload for LWLP-1269 / Phase 1 UX wireframe.
 * Structural validation only; no real intake API.
 */
export const useBeaconUpload = () => {
  const [step, setStep] = useState<BeaconUploadStep>('select');
  const [jsonText, setJsonText] = useState('');
  const [jsonFilename, setJsonFilename] = useState<string | undefined>();
  const [pocFile, setPocFile] = useState<File | undefined>();
  const [structuralErrors, setStructuralErrors] = useState<StructuralValidationError[]>([]);
  const [processError, setProcessError] = useState<string | undefined>();
  const [submissionId, setSubmissionId] = useState<string | undefined>();
  const [findingCount, setFindingCount] = useState<number | undefined>();

  const resetOutcome = () => {
    setStructuralErrors([]);
    setProcessError(undefined);
    setSubmissionId(undefined);
    setFindingCount(undefined);
  };

  const startOver = () => {
    setStep('select');
    setJsonText('');
    setJsonFilename(undefined);
    setPocFile(undefined);
    resetOutcome();
  };

  const onJsonTextChange = (value: string) => {
    setJsonText(value);
    if (step === 'error' || step === 'received') {
      setStep('select');
      resetOutcome();
    }
  };

  const onJsonFileAccepted = useCallback((files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    if (selected.size > BEACON_UPLOAD_MAX_FILE_SIZE_BYTES) {
      setProcessError(
        `JSON file exceeds the ${BEACON_UPLOAD_MAX_FILE_SIZE_MB} MB size limit. Please try a smaller file.`,
      );
      setStep('error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      setJsonText(text);
      setJsonFilename(selected.name);
      setStep('select');
      resetOutcome();
    };
    reader.onerror = () => {
      setProcessError('Could not read the JSON file. Try pasting the contents instead.');
      setStep('error');
    };
    reader.readAsText(selected);
  }, []);

  const onPocFileAccepted = useCallback((files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    if (selected.size > BEACON_UPLOAD_MAX_FILE_SIZE_BYTES) {
      setProcessError(
        `POC archive exceeds the ${BEACON_UPLOAD_MAX_FILE_SIZE_MB} MB size limit. Please try a smaller file.`,
      );
      setStep('error');
      return;
    }

    if (!isPocArchiveFilename(selected.name)) {
      setProcessError('POC package must be a .tar, .tar.gz, or .tgz archive.');
      setStep('error');
      return;
    }

    setPocFile(selected);
    setProcessError(undefined);
    if (step === 'error') setStep('select');
  }, [step]);

  const onClearPoc = () => setPocFile(undefined);

  const runValidation = useCallback(() => {
    resetOutcome();
    setStep('validating');

    window.setTimeout(() => {
      const result = validateVulnerabilitySubmissionJson(jsonText);
      if (!result.ok) {
        setStructuralErrors(result.errors);
        setStep('error');
        return;
      }

      const submission = addBeaconSubmission({
        findingCount: result.findingCount,
        jsonFilename: jsonFilename ?? 'pasted-findings.json',
        pocFilename: pocFile?.name,
        sizeBytes: new Blob([jsonText]).size + (pocFile?.size ?? 0),
        submitterName: 'Demo customer user',
        submitterReference: `Org: ${BEACON_MOCK_ORG_NAME}`,
      });

      setFindingCount(result.findingCount);
      setSubmissionId(submission.id);
      setStep('received');
    }, MOCK_VALIDATE_DELAY_MS);
  }, [jsonFilename, jsonText, pocFile]);

  const onSubmit = () => {
    if (!jsonText.trim()) {
      setStructuralErrors([
        { path: '$', message: 'Paste or upload a vulnerability findings JSON payload first.' },
      ]);
      setStep('error');
      return;
    }
    runValidation();
  };

  const onRetry = () => {
    setStep('select');
    setStructuralErrors([]);
    setProcessError(undefined);
  };

  const uploadProps: BeaconUploadCardProps = {
    step,
    jsonText,
    jsonFilename,
    pocFile,
    structuralErrors,
    processError,
    submissionId,
    findingCount,
    onJsonTextChange,
    onJsonFileAccepted,
    onPocFileAccepted,
    onClearPoc,
    onSubmit,
    onRetry,
    onStartOver: startOver,
  };

  return {
    step,
    uploadProps,
    startOver,
    isReceived: step === 'received',
    submissionId,
  };
};
