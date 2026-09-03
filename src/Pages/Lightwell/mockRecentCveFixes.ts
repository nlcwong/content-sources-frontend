import dayjs from 'dayjs';

import { isWithinLastDays } from './helpers';

export type CveSeverity = 'Critical' | 'Important' | 'Moderate';

export type RecentCveFix = {
  cveId: string;
  severity: CveSeverity;
  fixedAt: string;
  packageKey?: string;
};

const daysAgo =
  (days: number) => () =>
    dayjs().subtract(days, 'day').hour(12).minute(0).second(0).millisecond(0).toISOString();

const yesterday = daysAgo(1);
const twoDaysAgo = daysAgo(2);
const fiveDaysAgo = daysAgo(5);

const mockRecentCveFixes: RecentCveFix[] = [
  { cveId: 'CVE-2026-10001', severity: 'Critical', fixedAt: yesterday() },
  { cveId: 'CVE-2026-10002', severity: 'Critical', fixedAt: yesterday() },
  { cveId: 'CVE-2026-10003', severity: 'Important', fixedAt: yesterday() },
  { cveId: 'CVE-2026-10004', severity: 'Important', fixedAt: yesterday() },
  { cveId: 'CVE-2026-10005', severity: 'Important', fixedAt: yesterday() },
  { cveId: 'CVE-2026-10006', severity: 'Moderate', fixedAt: yesterday() },
  { cveId: 'CVE-2026-10007', severity: 'Moderate', fixedAt: yesterday() },
  { cveId: 'CVE-2026-10008', severity: 'Critical', fixedAt: twoDaysAgo() },
  { cveId: 'CVE-2026-10009', severity: 'Important', fixedAt: twoDaysAgo() },
  { cveId: 'CVE-2026-10010', severity: 'Moderate', fixedAt: twoDaysAgo() },
  { cveId: 'CVE-2026-10011', severity: 'Critical', fixedAt: fiveDaysAgo() },
  { cveId: 'CVE-2026-10012', severity: 'Moderate', fixedAt: fiveDaysAgo() },
];

export type CveFixesBySeverity = {
  critical: number;
  important: number;
  moderate: number;
};

export const getMockRecentCveFixes = (): RecentCveFix[] => [...mockRecentCveFixes];

export const getMockCveFixesBySeverityInPastDays = (days: number): CveFixesBySeverity => {
  const fixes = getMockRecentCveFixes().filter((fix) => isWithinLastDays(fix.fixedAt, days));

  return {
    critical: fixes.filter((fix) => fix.severity === 'Critical').length,
    important: fixes.filter((fix) => fix.severity === 'Important').length,
    moderate: fixes.filter((fix) => fix.severity === 'Moderate').length,
  };
};
