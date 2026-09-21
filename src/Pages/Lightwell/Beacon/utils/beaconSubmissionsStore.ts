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
    const parsed = JSON.parse(raw) as BeaconSubmission[];
    cachedSubmissions = Array.isArray(parsed) ? parsed : [];
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
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    uploadedAt: new Date().toISOString(),
    status: 'Received',
  };
  writeBeaconSubmissions([next, ...readBeaconSubmissions()]);
  return next;
};

export const updateBeaconSubmissionStatus = (id: string, status: BeaconSubmissionStatus) => {
  const next = readBeaconSubmissions().map((submission) =>
    submission.id === id ? { ...submission, status } : submission,
  );
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

export const getIncomingBeaconSubmissions = (submissions: BeaconSubmission[] = readBeaconSubmissions()) =>
  submissions.filter((submission) => submission.status !== 'Accepted');
