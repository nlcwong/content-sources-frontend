export type BeaconUploadStep = 'select' | 'uploading' | 'complete' | 'error';
export type BeaconUploadValidated = 'success' | 'error' | 'default';

/** Soft size limit for prototype intake (any format). */
export const BEACON_UPLOAD_MAX_FILE_SIZE_MB = 50;
export const BEACON_UPLOAD_MAX_FILE_SIZE_BYTES = BEACON_UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024;
