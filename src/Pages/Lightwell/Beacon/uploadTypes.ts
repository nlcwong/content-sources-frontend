export type BeaconUploadStep = 'select' | 'validating' | 'error' | 'received';

/** Customer- and STAM-visible statuses with a reliable mock event. */
export type BeaconSubmissionStatus =
  | 'Submitted, waiting for validation'
  | 'Validating...'
  | 'Accepted, move to queue'
  | 'Rejected, see STAM for more information';

export type BeaconStatusHistoryEntry = {
  status: BeaconSubmissionStatus;
  at: string;
};

export type BeaconSubmission = {
  /** Durable receipt / submission reference shown to the customer. */
  id: string;
  uploadedAt: string;
  status: BeaconSubmissionStatus;
  /** Chronological status changes for customer history. */
  statusHistory: BeaconStatusHistoryEntry[];
  findingCount: number;
  jsonFilename?: string;
  /** Optional reproducer file names linked to this submission. */
  pocFilenames: string[];
  sizeBytes: number;
  /** Stub fields so STAMs can request clarification. */
  submitterName: string;
  submitterReference: string;
};

/** Soft size limit for JSON or POC archive (prototype). */
export const BEACON_UPLOAD_MAX_FILE_SIZE_MB = 50;
export const BEACON_UPLOAD_MAX_FILE_SIZE_BYTES = BEACON_UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024;

export const BEACON_SUBMISSIONS_STORAGE_KEY = 'lightwell-beacon-submissions';

export const BEACON_MOCK_ORG_NAME = 'Acme Clearinghouse (demo org)';

/** Demo customer ID used as submitterName so STAM Beacon can filter intake by Customer ID. */
export const BEACON_MOCK_CUSTOMER_ID = 'CID-01';

export const BEACON_REQUIRED_FINDING_FIELDS = [
  'vulnerability_id',
  'packageurl',
  'title',
  'description',
  'cvss_severity',
  'cvss_score',
] as const;

export const BEACON_STATUS_SUBMITTED = 'Submitted, waiting for validation' as const;
export const BEACON_STATUS_VALIDATING = 'Validating...' as const;
export const BEACON_STATUS_ACCEPTED = 'Accepted, move to queue' as const;
export const BEACON_STATUS_REJECTED = 'Rejected, see STAM for more information' as const;
