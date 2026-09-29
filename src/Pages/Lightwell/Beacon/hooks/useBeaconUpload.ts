import { useCallback, useState } from 'react';

import { addBeaconSubmission } from '../utils/beaconSubmissionsStore';
import {
  isJsonFilename,
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

const readFileAsText = async (file: File): Promise<string> => {
  if (typeof file.text === 'function') {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.onerror = () => reject(new Error('read-failed'));
    reader.readAsText(file);
  });
};

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
  onFilesAccepted: (files: File[]) => void | Promise<void>;
  onClearJson: () => void;
  onClearPoc: () => void;
  onSubmit: () => void;
  onRetry: () => void;
  onStartOver: () => void;
  /** When set, shows Cancel next to Submit for structural validation. */
  onCancel?: () => void;
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
    setJsonFilename(undefined);
    if (step === 'error' || step === 'received') {
      setStep('select');
      resetOutcome();
    }
  };

  const onClearJson = () => {
    setJsonText('');
    setJsonFilename(undefined);
    if (step === 'error' || step === 'received') {
      setStep('select');
      resetOutcome();
    }
  };

  const onClearPoc = () => setPocFile(undefined);

  const onFilesAccepted = useCallback(async (files: File[]) => {
    if (!files.length) return;

    const jsonFiles = files.filter((file) => isJsonFilename(file.name));
    const pocFiles = files.filter((file) => isPocArchiveFilename(file.name));
    const unknown = files.filter(
      (file) => !isJsonFilename(file.name) && !isPocArchiveFilename(file.name),
    );

    if (unknown.length) {
      setProcessError(
        `Unsupported file type: ${unknown.map((file) => file.name).join(', ')}. Use a .json findings file and an optional .tar / .tar.gz / .tgz POC archive.`,
      );
      setStep('error');
      return;
    }

    if (jsonFiles.length > 1) {
      setProcessError('Upload only one vulnerability findings JSON file.');
      setStep('error');
      return;
    }

    if (pocFiles.length > 1) {
      setProcessError('Upload only one POC archive.');
      setStep('error');
      return;
    }

    const oversized = [...jsonFiles, ...pocFiles].find(
      (file) => file.size > BEACON_UPLOAD_MAX_FILE_SIZE_BYTES,
    );
    if (oversized) {
      setProcessError(
        `${oversized.name} exceeds the ${BEACON_UPLOAD_MAX_FILE_SIZE_MB} MB size limit. Please try a smaller file.`,
      );
      setStep('error');
      return;
    }

    try {
      if (jsonFiles[0]) {
        const text = await readFileAsText(jsonFiles[0]);
        setJsonText(text);
        setJsonFilename(jsonFiles[0].name);
      }
      if (pocFiles[0]) {
        setPocFile(pocFiles[0]);
      }
      setProcessError(undefined);
      setStructuralErrors([]);
      setSubmissionId(undefined);
      setFindingCount(undefined);
      setStep('select');
    } catch {
      setProcessError('Could not read the JSON file. Try pasting the contents instead.');
      setStep('error');
    }
  }, []);

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
        { path: '$', message: 'Upload or paste a vulnerability findings JSON payload first.' },
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
    onFilesAccepted,
    onClearJson,
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
