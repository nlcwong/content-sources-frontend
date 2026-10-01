export type BeaconUploadStep = 'select' | 'validating' | 'error' | 'received';

/** Customer- and STAM-visible statuses with a reliable mock event. */
export type BeaconSubmissionStatus =
  | 'Received'
  | 'Processing'
  | 'Added to pipeline queue'
  | 'More information requested';

export type BeaconSubmission = {
  /** Durable receipt / submission reference shown to the customer. */
  id: string;
  uploadedAt: string;
  status: BeaconSubmissionStatus;
  findingCount: number;
  jsonFilename?: string;
  pocFilename?: string;
  sizeBytes: number;
  /** Stub fields so STAMs can request clarification. */
  submitterName: string;
  submitterReference: string;
  /** Set when STAM Approves and status becomes Added to pipeline queue. */
  pipelineAddedAt?: string;
};

/** Soft size limit for JSON or POC archive (prototype). */
export const BEACON_UPLOAD_MAX_FILE_SIZE_MB = 50;
export const BEACON_UPLOAD_MAX_FILE_SIZE_BYTES = BEACON_UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024;

export const BEACON_SUBMISSIONS_STORAGE_KEY = 'lightwell-beacon-submissions';

export const BEACON_MOCK_ORG_NAME = 'Acme Clearinghouse (demo org)';

export const BEACON_REQUIRED_FINDING_FIELDS = [
  'vulnerability_id',
  'packageurl',
  'title',
  'description',
  'cvss_severity',
  'cvss_score',
] as const;
