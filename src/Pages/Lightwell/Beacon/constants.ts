import type { Severity, Status } from './types';

export const PIPELINE_STATUSES: Status[] = [
  'Submitted',
  'Classified',
  'Fix in Progress',
  'Validation',
  'Lightwell Network',
];

export const CLOSED_STATUSES: Status[] = [
  "Won't Do",
  'Not a Bug',
  'Cannot Reproduce',
  'Obsolete',
];

export const STATUSES: Status[] = [...PIPELINE_STATUSES, ...CLOSED_STATUSES];

export const STATUS_DESCRIPTIONS: Record<Status, string> = {
  Submitted: 'Vulnerability submitted, undergoing initial review to identify a fix target.',
  Classified: 'Fix target identified.',
  'Fix in Progress': 'A fix is currently under development.',
  Validation: 'The fix is being validated within the Red Hat pipeline.',
  'Lightwell Network': 'The fix is available in the Lightwell Repository.',
  Upstreaming: 'The fix is being shared with the upstream community.',
  Published: 'The fix is available in upstream repos.',
  "Won't Do": 'Closed without remediation; Red Hat will not pursue a fix for this submission.',
  'Not a Bug': 'Closed without remediation; the reported issue was determined not to be a vulnerability.',
  'Cannot Reproduce':
    'Closed without remediation; the reported issue could not be reproduced with the provided information.',
  Obsolete: 'Closed without remediation; the submission is no longer relevant.',
};

export const SEVERITIES: Severity[] = ['Critical', 'Important', 'Moderate', 'Minor'];
