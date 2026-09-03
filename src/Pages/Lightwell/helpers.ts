import { capitalize } from 'lodash';
import dayjs from 'dayjs';
import type { ThProps } from '@patternfly/react-table';
import { CONTENT_TYPE_PARAMETERS, LIGHTWELL_ORIGIN, REPOSITORY_DESCRIPTIONS } from './constants';
import { ContentItem, RepositoryPackageItem } from 'services/Content/ContentApi';

export type PackageReleaseStat = {
  packageKey: string;
  packageName: string;
  repositoryUuid: string;
  repositoryName: string;
  releaseCount: number;
  securityLevel?: string;
};

export type TopPackagesBySecurityLevel = {
  validated: PackageReleaseStat[];
  remediated: PackageReleaseStat[];
  predisclosure: PackageReleaseStat[];
};

export type RecentActivitySummary = {
  repositories: number;
  packages: number;
  releases: number;
};

const SECURITY_LEVELS = ['validated', 'remediated', 'predisclosure'] as const;

export const getPackageKey = (group: string, name: string, repositoryUuid: string): string =>
  `${repositoryUuid}:${group}:${name}`;

const getContentTypeParameters = (contentType?: string) => {
  const normalized = contentType?.toLowerCase();
  if (!normalized) return undefined;
  return CONTENT_TYPE_PARAMETERS[normalized];
};

export const getEcosystemFromContentType = (contentType?: string): string | undefined =>
  getContentTypeParameters(contentType)?.ecosystem;

export const getRepositoryDescription = (
  contentType?: string,
  securityLevel?: string,
): string | undefined => {
  const normalizedType = contentType?.toLowerCase();
  const normalizedLevel = securityLevel?.toLowerCase();
  if (!normalizedType || !normalizedLevel) return undefined;
  return REPOSITORY_DESCRIPTIONS[normalizedType]?.[normalizedLevel];
};

export const formatRepositoryName = (
  contentType?: string,
  securityLevel?: string,
  fallbackName?: string,
) => {
  const ecosystem = getEcosystemFromContentType(contentType);

  if (ecosystem && securityLevel) {
    return `${capitalize(ecosystem)} ${capitalize(securityLevel)}`;
  }

  return fallbackName || '—';
};

// Creates readable path slug from repository's ecosystem and security level
export const getRepositoryPathSlug = (contentType?: string, securityLevel?: string): string => {
  const ecosystem = getEcosystemFromContentType(contentType)?.toLowerCase();
  const level = securityLevel?.toLowerCase();

  if (!ecosystem || !level) {
    return '';
  }

  return `${ecosystem}-${level}`;
};

export const getSlugFromRepositoryName = (name: string): string => {
  const path = name.replace(`${LIGHTWELL_ORIGIN}/`, '').replace('/', '-');
  return path || '';
};

// Converts URL path slug to its Lightwell repository name
export const getRepositoryNameFromPathSlug = (slug: string): string => {
  const normalized = slug.toLowerCase();
  const separatorIndex = normalized.indexOf('-');

  if (separatorIndex <= 0 || separatorIndex === normalized.length - 1) {
    return '';
  }

  const ecosystem = normalized.slice(0, separatorIndex);
  const securityLevel = normalized.slice(separatorIndex + 1);

  return `${LIGHTWELL_ORIGIN}/${ecosystem}/${securityLevel}`;
};

/**
 * Removes the Lightwell release suffix (.rhlw-xxxx) from a version
 *
 * Example:
 * 1.2.3.rhlw-00001 -> 1.2.3
 */
export const stripLightwellVersionSuffix = (version: string): string =>
  version.replace(/\.rhlw-.*$/, '');

/**
 * Extracts a release number from a Lightwell version or release
 *
 * Examples:
 * 1.2.3.rhlw-0001 -> 1
 * rhlw-0002 -> 2
 */
export const lightwellReleaseNum = (versionOrRelease: string): number =>
  parseInt(versionOrRelease.match(/rhlw-(\d+)$/)?.[1] ?? '0', 10);

/**
 * Sorts versions in descending semantic order
 *
 * Example:
 * 1.10.2,         1.11.1
 * 1.9.2,    ->    1.10.2
 * 1.11.1          1.9.2
 */
export const sortVersionsDesc = (versions: string[]) =>
  [...versions].sort((a, b) =>
    b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }),
  );

/**
 * Compares two Lightwell versions in descending order, ignoring the .rhlw suffix
 *
 * Example:
 * 1.2.3.rhlw-0003 == 1.2.3.rhlw-0002
 * 2.3.4.rhlw-0001 > 2.3.3.rhlw-0002
 */
export const compareVersionsDesc = (a: string, b: string) =>
  stripLightwellVersionSuffix(b).localeCompare(stripLightwellVersionSuffix(a), undefined, {
    numeric: true,
    sensitivity: 'base',
  });

/**
 * Compares Lightwell releases in descending order. Orders initially by
 * version (ignoring the .rhlw suffix). If two releases have the same
 * version, uses the release number as a tiebreaker
 *
 * Example:
 * 1.2.3.rhlw-0001
 * 1.2.2.rhlw-0009
 * 1.2.2.rhlw-0008
 */
export const compareReleasesDesc = (
  a: RepositoryPackageItem['latest_releases'][number],
  b: RepositoryPackageItem['latest_releases'][number],
) => {
  const versionComparison = compareVersionsDesc(a.version, b.version);

  if (versionComparison !== 0) {
    return versionComparison;
  }

  return lightwellReleaseNum(b.release) - lightwellReleaseNum(a.release);
};

/**
 * Transforms published distribution URL by replacing /api/pulp-content/lightwell with /lightwell
 *
 * Example:
 * https://packages.redhat.com/api/pulp-content/lightwell/java/validated
 * -> https://packages.redhat.com/lightwell/java/validated
 * https://packages.redhat.com/api/pulp-content/public-lightwell-demo/python/validated/simple
 * -> https://packages.redhat.com/lightwell/public-lightwell-demo/python/validated/simple
 */
export const formatDistributionUrl = (url: string): string =>
  url
    .replace('/api/pulp-content/public-lightwell-demo', '/lightwell/public-lightwell-demo')
    .replace('/api/pulp-content/lightwell', '/lightwell');

export const getPackageLastActivity = (pkg: RepositoryPackageItem): string => {
  const latestCreatedAt = pkg.latest_releases
    .map((release) => release.created_at)
    .filter(Boolean)
    .sort()
    .at(-1);

  return latestCreatedAt ?? '';
};

export const compareTimestampsDesc = (a: string, b: string): number => {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;

  return new Date(b).getTime() - new Date(a).getTime();
};

export const compareTimestampsAsc = (a: string, b: string): number => -compareTimestampsDesc(a, b);

export const formatRepositoryShortName = (name: string): string => name.replace(/^lightwell\//, '');

export const isWithinLastDays = (timestamp: string, days: number): boolean => {
  if (!timestamp) {
    return false;
  }

  const createdAt = dayjs(timestamp);
  if (!createdAt.isValid()) {
    return false;
  }

  const cutoff = dayjs().subtract(days, 'day').startOf('day');
  return createdAt.isSame(cutoff) || createdAt.isAfter(cutoff);
};

export const isWithinLastDay = (timestamp: string): boolean => isWithinLastDays(timestamp, 1);

export const formatPackageDisplayName = (group: string, name: string): string =>
  group ? `${group}:${name}` : name;

export const countPackageReleasesInWindow = (
  pkg: RepositoryPackageItem,
  days = 1,
): number =>
  pkg.latest_releases.filter((release) => isWithinLastDays(release.created_at, days)).length;

export const buildCrossRepoPackageReleaseStats = (
  repositories: ContentItem[],
  packagesByRepoUuid: Record<string, RepositoryPackageItem[]>,
  days = 1,
): PackageReleaseStat[] =>
  repositories.flatMap((repo) =>
    (packagesByRepoUuid[repo.uuid] ?? []).map((pkg) => ({
      packageKey: getPackageKey(pkg.group, pkg.name, repo.uuid),
      packageName: formatPackageDisplayName(pkg.group, pkg.name),
      repositoryUuid: repo.uuid,
      repositoryName: repo.name,
      releaseCount: countPackageReleasesInWindow(pkg, days),
      securityLevel: repo.security_level,
    })),
  );

export const getTopPackagesBySecurityLevel = (
  stats: PackageReleaseStat[],
  limit = 10,
): TopPackagesBySecurityLevel =>
  SECURITY_LEVELS.reduce<TopPackagesBySecurityLevel>(
    (grouped, level) => ({
      ...grouped,
      [level]: getTopPackagesByRecentReleases(
        stats.filter((stat) => stat.securityLevel === level),
        limit,
      ),
    }),
    { validated: [], remediated: [], predisclosure: [] },
  );

export const getTopPackagesByRecentReleases = (
  stats: PackageReleaseStat[],
  limit = 10,
): PackageReleaseStat[] =>
  [...stats]
    .filter((stat) => stat.releaseCount > 0)
    .sort((a, b) => {
      const countDiff = b.releaseCount - a.releaseCount;
      if (countDiff !== 0) {
        return countDiff;
      }
      return a.packageName.localeCompare(b.packageName);
    })
    .slice(0, limit);

export const buildRecentActivitySummary = (
  stats: PackageReleaseStat[],
): RecentActivitySummary => {
  const activeStats = stats.filter((stat) => stat.releaseCount > 0);

  return {
    repositories: new Set(activeStats.map((stat) => stat.repositoryUuid)).size,
    packages: activeStats.length,
    releases: activeStats.reduce((total, stat) => total + stat.releaseCount, 0),
  };
};

export const countRecentReleases = (packages: RepositoryPackageItem[], days = 7): number =>
  packages
    .flatMap((pkg) => pkg.latest_releases)
    .filter((release) => isWithinLastDays(release.created_at, days)).length;

export const getTableSortParams = (
  columnIndex: number,
  activeSortIndex: number | undefined,
  activeSortDirection: 'asc' | 'desc' | undefined,
  onSort: (index: number, direction: 'asc' | 'desc') => void,
  defaultDirection: 'asc' | 'desc' = 'desc',
): ThProps['sort'] => ({
  sortBy: {
    index: activeSortIndex,
    direction: activeSortDirection,
    defaultDirection,
  },
  onSort: (_event, index, direction) => {
    onSort(index, direction);
  },
  columnIndex,
});
