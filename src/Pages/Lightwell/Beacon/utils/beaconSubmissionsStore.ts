import {
  BEACON_SUBMISSIONS_STORAGE_KEY,
  type BeaconSubmission,
  type BeaconSubmissionStatus,
} from '../uploadTypes';

const SUBMISSIONS_CHANGED_EVENT = 'lightwell-beacon-submissions-changed';

let cachedRaw: string | null | undefined = undefined;
let cachedSubmissions: BeaconSubmission[] = [];

const notifySubmissionsChanged = () => {
  window.dispatchEvent(new Event(SUBMISSIONS_CHANGED_EVENT));
};

const ACTIVE_QUEUE_STATUSES: BeaconSubmissionStatus[] = ['Received', 'Processing'];

const normalizeStatus = (status: string): BeaconSubmissionStatus => {
  if (status === 'Processing') {
    return 'Processing';
  }
  if (
    status === 'Accepted' ||
    status === 'Accepted for processing' ||
    status === 'Added to pipeline' ||
    status === 'Added to pipeline queue'
  ) {
    return 'Added to pipeline queue';
  }
  if (status === 'More information requested') {
    return 'More information requested';
  }
  return 'Received';
};

const normalizeSubmission = (raw: Record<string, unknown>): BeaconSubmission | null => {
  if (typeof raw.id !== 'string') return null;
  return {
    id: raw.id,
    uploadedAt: typeof raw.uploadedAt === 'string' ? raw.uploadedAt : new Date().toISOString(),
    status: normalizeStatus(typeof raw.status === 'string' ? raw.status : 'Received'),
    findingCount: typeof raw.findingCount === 'number' ? raw.findingCount : 0,
    jsonFilename: typeof raw.jsonFilename === 'string' ? raw.jsonFilename : undefined,
    pocFilename: typeof raw.pocFilename === 'string' ? raw.pocFilename : undefined,
    sizeBytes: typeof raw.sizeBytes === 'number' ? raw.sizeBytes : 0,
    submitterName:
      typeof raw.submitterName === 'string' ? raw.submitterName : 'Demo customer user',
    submitterReference:
      typeof raw.submitterReference === 'string'
        ? raw.submitterReference
        : 'Ref: intake-demo',
    pipelineAddedAt:
      typeof raw.pipelineAddedAt === 'string' ? raw.pipelineAddedAt : undefined,
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
  submission: Omit<BeaconSubmission, 'id' | 'uploadedAt' | 'status'>,
) => {
  const next: BeaconSubmission = {
    ...submission,
    id: `SUB-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`,
    uploadedAt: new Date().toISOString(),
    status: 'Received',
  };
  writeBeaconSubmissions([next, ...readBeaconSubmissions()]);
  return next;
};

export const updateBeaconSubmissionStatus = (id: string, status: BeaconSubmissionStatus) => {
  const next = readBeaconSubmissions().map((submission) => {
    if (submission.id !== id) {
      return submission;
    }
    return {
      ...submission,
      status,
      ...(status === 'Added to pipeline queue'
        ? { pipelineAddedAt: new Date().toISOString() }
        : {}),
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

/** Actionable STAM active queue (Received + Processing). */
export const getIncomingBeaconSubmissions = (
  submissions: BeaconSubmission[] = readBeaconSubmissions(),
) => submissions.filter((submission) => ACTIVE_QUEUE_STATUSES.includes(submission.status));

/** All submissions for the STAM Incoming uploads table (including terminal states). */
export const getStamVisibleBeaconSubmissions = (
  submissions: BeaconSubmission[] = readBeaconSubmissions(),
) => submissions;
