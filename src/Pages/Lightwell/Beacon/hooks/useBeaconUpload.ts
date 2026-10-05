import { useCallback, useState } from 'react';

import { addBeaconSubmission } from '../utils/beaconSubmissionsStore';
import {
  isJsonFilename,
  validateVulnerabilitySubmissionJson,
  type StructuralValidationError,
} from '../utils/validateVulnerabilitySubmission';
import {
  BEACON_MOCK_CUSTOMER_ID,
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

const appendUniqueFiles = (existing: File[], incoming: File[]) => {
  const names = new Set(existing.map((file) => file.name));
  const next = [...existing];
  incoming.forEach((file) => {
    if (!names.has(file.name)) {
      names.add(file.name);
      next.push(file);
    }
  });
  return next;
};

const createPendingId = () =>
  `pending-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export type PendingFindingsFile = {
  id: string;
  filename: string;
  jsonText: string;
  reproducers: File[];
};

export type BeaconUploadCardProps = {
  step: BeaconUploadStep;
  pendingFiles: PendingFindingsFile[];
  structuralErrors: StructuralValidationError[];
  processError?: string;
  submissionIds?: string[];
  findingCount?: number;
  onFilesAccepted: (files: File[]) => void | Promise<void>;
  onReproducerSelected: (
    pendingId: string,
    files: FileList | File[] | undefined,
  ) => void | Promise<void>;
  onRemovePendingFile: (pendingId: string) => void;
  onRemoveReproducer: (pendingId: string, filename: string) => void;
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
  const [pendingFiles, setPendingFiles] = useState<PendingFindingsFile[]>([]);
  const [structuralErrors, setStructuralErrors] = useState<StructuralValidationError[]>([]);
  const [processError, setProcessError] = useState<string | undefined>();
  const [submissionIds, setSubmissionIds] = useState<string[] | undefined>();
  const [findingCount, setFindingCount] = useState<number | undefined>();

  const resetOutcome = () => {
    setStructuralErrors([]);
    setProcessError(undefined);
    setSubmissionIds(undefined);
    setFindingCount(undefined);
  };

  const startOver = useCallback(() => {
    setStep('select');
    setPendingFiles([]);
    setStructuralErrors([]);
    setProcessError(undefined);
    setSubmissionIds(undefined);
    setFindingCount(undefined);
  }, []);

  const onRemovePendingFile = (pendingId: string) => {
    setPendingFiles((current) => current.filter((file) => file.id !== pendingId));
    if (step === 'error' || step === 'received') {
      setStep('select');
      resetOutcome();
    }
  };

  const onRemoveReproducer = (pendingId: string, filename: string) => {
    setPendingFiles((current) =>
      current.map((file) =>
        file.id === pendingId
          ? {
              ...file,
              reproducers: file.reproducers.filter((reproducer) => reproducer.name !== filename),
            }
          : file,
      ),
    );
  };

  const onReproducerSelected = useCallback(
    async (pendingId: string, files: FileList | File[] | undefined) => {
      if (!files || files.length === 0) {
        return;
      }

      const incoming = Array.from(files);
      const oversized = incoming.find((file) => file.size > BEACON_UPLOAD_MAX_FILE_SIZE_BYTES);
      if (oversized) {
        setProcessError(
          `${oversized.name} exceeds the ${BEACON_UPLOAD_MAX_FILE_SIZE_MB} MB size limit. Please try a smaller file.`,
        );
        setPendingFiles([]);
        setStep('error');
        return;
      }

      setPendingFiles((current) =>
        current.map((file) =>
          file.id === pendingId
            ? { ...file, reproducers: appendUniqueFiles(file.reproducers, incoming) }
            : file,
        ),
      );
      setProcessError(undefined);
      if (step === 'error' || step === 'received') {
        setStep('select');
        setStructuralErrors([]);
        setSubmissionIds(undefined);
        setFindingCount(undefined);
      }
    },
    [step],
  );

  const onFilesAccepted = useCallback(async (files: File[]) => {
    if (!files.length) return;

    const nonJson = files.filter((file) => !isJsonFilename(file.name));
    if (nonJson.length) {
      setProcessError(
        `Unsupported file type: ${nonJson.map((file) => file.name).join(', ')}. Drop a findings .json file only. Attach reproducers with Upload reproducer file after selection.`,
      );
      setPendingFiles([]);
      setStep('error');
      return;
    }

    // Single findings JSON only — take the first if multiple arrive.
    const file = files[0];
    if (file.size > BEACON_UPLOAD_MAX_FILE_SIZE_BYTES) {
      setProcessError(
        `${file.name} exceeds the ${BEACON_UPLOAD_MAX_FILE_SIZE_MB} MB size limit. Please try a smaller file.`,
      );
      setPendingFiles([]);
      setStep('error');
      return;
    }

    try {
      const text = await readFileAsText(file);
      setPendingFiles([
        {
          id: createPendingId(),
          filename: file.name,
          jsonText: text,
          reproducers: [],
        },
      ]);
      setProcessError(undefined);
      setStructuralErrors([]);
      setSubmissionIds(undefined);
      setFindingCount(undefined);
      setStep('select');
    } catch {
      setProcessError('Could not read the JSON file. Choose a valid findings .json file.');
      setPendingFiles([]);
      setStep('error');
    }
  }, []);

  const runValidation = useCallback(() => {
    resetOutcome();
    setStep('validating');

    window.setTimeout(() => {
      const allErrors: StructuralValidationError[] = [];
      const validated: { pending: PendingFindingsFile; findingCount: number }[] = [];

      pendingFiles.forEach((pending) => {
        const result = validateVulnerabilitySubmissionJson(pending.jsonText);
        if (!result.ok) {
          result.errors.forEach((error) => {
            allErrors.push({
              path: `${pending.filename}:${error.path}`,
              message: error.message,
            });
          });
          return;
        }
        validated.push({ pending, findingCount: result.findingCount });
      });

      if (allErrors.length > 0) {
        setStructuralErrors(allErrors);
        setPendingFiles([]);
        setStep('error');
        return;
      }

      const createdIds: string[] = [];
      let totalFindings = 0;
      validated.forEach(({ pending, findingCount: count }) => {
        const submission = addBeaconSubmission({
          findingCount: count,
          jsonFilename: pending.filename,
          pocFilenames: pending.reproducers.map((file) => file.name),
          sizeBytes:
            new Blob([pending.jsonText]).size +
            pending.reproducers.reduce((total, file) => total + file.size, 0),
          submitterName: BEACON_MOCK_CUSTOMER_ID,
          submitterReference: `Org: ${BEACON_MOCK_ORG_NAME}`,
        });
        createdIds.push(submission.id);
        totalFindings += count;
      });

      setFindingCount(totalFindings);
      setSubmissionIds(createdIds);
      setPendingFiles([]);
      setStep('received');
    }, MOCK_VALIDATE_DELAY_MS);
  }, [pendingFiles]);

  const onSubmit = () => {
    if (pendingFiles.length === 0) {
      setStructuralErrors([
        { path: '$', message: 'Upload at least one vulnerability findings JSON file first.' },
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
    pendingFiles,
    structuralErrors,
    processError,
    submissionIds,
    findingCount,
    onFilesAccepted,
    onReproducerSelected,
    onRemovePendingFile,
    onRemoveReproducer,
    onSubmit,
    onRetry,
    onStartOver: startOver,
  };

  return {
    step,
    uploadProps,
    startOver,
    isReceived: step === 'received',
    submissionIds,
    submissionId: submissionIds?.[0],
    findingCount,
    submissionCount: submissionIds?.length,
  };
};
