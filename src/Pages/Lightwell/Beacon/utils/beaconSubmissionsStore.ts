import {
  BEACON_STATUS_ACCEPTED,
  BEACON_STATUS_REJECTED,
  BEACON_STATUS_SUBMITTED,
  BEACON_STATUS_VALIDATING,
  BEACON_SUBMISSIONS_STORAGE_KEY,
  type BeaconStatusHistoryEntry,
  type BeaconSubmission,
  type BeaconSubmissionStatus,
} from '../uploadTypes';

const SUBMISSIONS_CHANGED_EVENT = 'lightwell-beacon-submissions-changed';

let cachedRaw: string | null | undefined = undefined;
let cachedSubmissions: BeaconSubmission[] = [];

const notifySubmissionsChanged = () => {
  window.dispatchEvent(new Event(SUBMISSIONS_CHANGED_EVENT));
};

const ACTIVE_QUEUE_STATUSES: BeaconSubmissionStatus[] = [
  BEACON_STATUS_SUBMITTED,
  BEACON_STATUS_VALIDATING,
];

const normalizeStatus = (status: string): BeaconSubmissionStatus => {
  if (
    status === BEACON_STATUS_VALIDATING ||
    status === 'Processing' ||
    status === 'Validating...'
  ) {
    return BEACON_STATUS_VALIDATING;
  }
  if (
    status === BEACON_STATUS_ACCEPTED ||
    status === 'Accepted' ||
    status === 'Accepted for processing' ||
    status === 'Added to pipeline' ||
    status === 'Added to pipeline queue'
  ) {
    return BEACON_STATUS_ACCEPTED;
  }
  if (
    status === BEACON_STATUS_REJECTED ||
    status === 'Rejected' ||
    status === 'More information requested'
  ) {
    return BEACON_STATUS_REJECTED;
  }
  return BEACON_STATUS_SUBMITTED;
};

const normalizeHistoryEntry = (raw: unknown): BeaconStatusHistoryEntry | null => {
  if (!raw || typeof raw !== 'object') return null;
  const entry = raw as Record<string, unknown>;
  if (typeof entry.status !== 'string' || typeof entry.at !== 'string') return null;
  return { status: normalizeStatus(entry.status), at: entry.at };
};

const backfillStatusHistory = (
  raw: Record<string, unknown>,
  status: BeaconSubmissionStatus,
  uploadedAt: string,
): BeaconStatusHistoryEntry[] => {
  const fromStorage = Array.isArray(raw.statusHistory)
    ? raw.statusHistory
        .map(normalizeHistoryEntry)
        .filter((entry): entry is BeaconStatusHistoryEntry => entry !== null)
    : [];
  if (fromStorage.length > 0) {
    return fromStorage;
  }

  const history: BeaconStatusHistoryEntry[] = [
    { status: BEACON_STATUS_SUBMITTED, at: uploadedAt },
  ];
  if (status === BEACON_STATUS_VALIDATING) {
    history.push({ status: BEACON_STATUS_VALIDATING, at: uploadedAt });
  }
  if (status === BEACON_STATUS_ACCEPTED) {
    const at =
      typeof raw.pipelineAddedAt === 'string' ? raw.pipelineAddedAt : uploadedAt;
    history.push({ status: BEACON_STATUS_ACCEPTED, at });
  }
  if (status === BEACON_STATUS_REJECTED) {
    const at =
      typeof raw.moreInfoRequestedAt === 'string' ? raw.moreInfoRequestedAt : uploadedAt;
    history.push({ status: BEACON_STATUS_REJECTED, at });
  }
  return history;
};

const normalizePocFilenames = (raw: Record<string, unknown>): string[] => {
  if (Array.isArray(raw.pocFilenames)) {
    return raw.pocFilenames.filter((name): name is string => typeof name === 'string');
  }
  if (typeof raw.pocFilename === 'string' && raw.pocFilename) {
    return [raw.pocFilename];
  }
  return [];
};

const normalizeSubmission = (raw: Record<string, unknown>): BeaconSubmission | null => {
  if (typeof raw.id !== 'string') return null;
  const uploadedAt = typeof raw.uploadedAt === 'string' ? raw.uploadedAt : new Date().toISOString();
  const status = normalizeStatus(typeof raw.status === 'string' ? raw.status : BEACON_STATUS_SUBMITTED);

  return {
    id: raw.id,
    uploadedAt,
    status,
    statusHistory: backfillStatusHistory(raw, status, uploadedAt),
    findingCount: typeof raw.findingCount === 'number' ? raw.findingCount : 0,
    jsonFilename: typeof raw.jsonFilename === 'string' ? raw.jsonFilename : undefined,
    pocFilenames: normalizePocFilenames(raw),
    sizeBytes: typeof raw.sizeBytes === 'number' ? raw.sizeBytes : 0,
    submitterName:
      typeof raw.submitterName === 'string' ? raw.submitterName : 'Demo customer user',
    submitterReference:
      typeof raw.submitterReference === 'string'
        ? raw.submitterReference
        : 'Ref: intake-demo',
  };
};

export const readBeaconSubmissions = (): BeaconSubmission[] => {
  try {
    const raw = localStorage.getItem(BEACON_SUBMISSIONS_STORAGE_KEY);
    if (raw === cachedRaw) {
      return cachedSubmissions;
    }
    cachedRaw = raw;
    if (!raw) {
      cachedSubmissions = [];
      return cachedSubmissions;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      cachedSubmissions = [];
      return cachedSubmissions;
    }
    cachedSubmissions = parsed
      .map((item) =>
        item && typeof item === 'object'
          ? normalizeSubmission(item as Record<string, unknown>)
          : null,
      )
      .filter((item): item is BeaconSubmission => item !== null);
    return cachedSubmissions;
  } catch {
    cachedRaw = null;
    cachedSubmissions = [];
    return cachedSubmissions;
  }
};

const writeBeaconSubmissions = (submissions: BeaconSubmission[]) => {
  const raw = JSON.stringify(submissions);
  localStorage.setItem(BEACON_SUBMISSIONS_STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedSubmissions = submissions;
  notifySubmissionsChanged();
};

export const addBeaconSubmission = (
  submission: Omit<BeaconSubmission, 'id' | 'uploadedAt' | 'status' | 'statusHistory'>,
) => {
  const uploadedAt = new Date().toISOString();
  const next: BeaconSubmission = {
    ...submission,
    id: `SUB-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`,
    uploadedAt,
    status: BEACON_STATUS_SUBMITTED,
    statusHistory: [{ status: BEACON_STATUS_SUBMITTED, at: uploadedAt }],
  };
  writeBeaconSubmissions([next, ...readBeaconSubmissions()]);
  return next;
};

export const updateBeaconSubmissionStatus = (id: string, status: BeaconSubmissionStatus) => {
  const at = new Date().toISOString();
  const next = readBeaconSubmissions().map((submission) => {
    if (submission.id !== id) {
      return submission;
    }
    return {
      ...submission,
      status,
      statusHistory: [...submission.statusHistory, { status, at }],
    };
  });
  writeBeaconSubmissions(next);
};

export const subscribeBeaconSubmissions = (listener: () => void) => {
  window.addEventListener(SUBMISSIONS_CHANGED_EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(SUBMISSIONS_CHANGED_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
};

/** Actionable STAM active queue (Submitted + Validating). */
export const getIncomingBeaconSubmissions = (
  submissions: BeaconSubmission[] = readBeaconSubmissions(),
) => submissions.filter((submission) => ACTIVE_QUEUE_STATUSES.includes(submission.status));

/** All submissions for the STAM Incoming uploads table (including terminal states). */
export const getStamVisibleBeaconSubmissions = (
  submissions: BeaconSubmission[] = readBeaconSubmissions(),
) => submissions;
