export type BeaconUploadStep = 'select' | 'uploading' | 'complete' | 'error';
export type BeaconUploadValidated = 'success' | 'error' | 'default';

export type BeaconSubmissionStatus = 'Received' | 'In review' | 'Accepted';

export type BeaconSubmission = {
  id: string;
  filename: string;
  uploadedAt: string;
  status: BeaconSubmissionStatus;
  sizeBytes: number;
};

/** Soft size limit for prototype intake (any format). */
export const BEACON_UPLOAD_MAX_FILE_SIZE_MB = 50;
export const BEACON_UPLOAD_MAX_FILE_SIZE_BYTES = BEACON_UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024;

export const BEACON_SUBMISSIONS_STORAGE_KEY = 'lightwell-beacon-submissions';
