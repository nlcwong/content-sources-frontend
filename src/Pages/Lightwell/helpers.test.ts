import {
  compareReleasesDesc,
  compareTimestampsAsc,
  compareTimestampsDesc,
  compareVersionsDesc,
  countRecentReleases,
  formatDistributionUrl,
  formatPackageDisplayName,
  formatRepositoryName,
  getEcosystemFromContentType,
  getPackageLastActivity,
  getRepositoryDescription,
  getRepositoryNameFromPathSlug,
  getRepositoryPathSlug,
  getTopPackagesByRecentReleases,
  getTopPackagesBySecurityLevel,
  buildCrossRepoPackageReleaseStats,
  buildRecentActivitySummary,
  isWithinLastDay,
  isWithinLastDays,
  lightwellReleaseNum,
  sortVersionsDesc,
  stripLightwellVersionSuffix,
} from './helpers';

describe('getEcosystemFromContentType', () => {
  it('returns the ecosystem for a known content type', () => {
    expect(getEcosystemFromContentType('maven')).toBe('Java');
    expect(getEcosystemFromContentType('python')).toBe('Python');
  });

  it('normalizes content type casing', () => {
    expect(getEcosystemFromContentType('MAVEN')).toBe('Java');
  });

  it('returns undefined for missing or unknown content type', () => {
    expect(getEcosystemFromContentType()).toBeUndefined();
    expect(getEcosystemFromContentType('unknown')).toBeUndefined();
  });
});

describe('getRepositoryDescription', () => {
  it('returns a description for known content type and security level', () => {
    expect(getRepositoryDescription('maven', 'validated')).toBeDefined();
  });

  it('normalizes content type and security level casing', () => {
    expect(getRepositoryDescription('MAVEN', 'VALIDATED')).toEqual(
      getRepositoryDescription('maven', 'validated'),
    );
  });

  it('returns undefined when content type or security level is missing', () => {
    expect(getRepositoryDescription()).toBeUndefined();
    expect(getRepositoryDescription('maven')).toBeUndefined();
    expect(getRepositoryDescription(undefined, 'validated')).toBeUndefined();
  });

  it('returns a description for predisclosure security level', () => {
    expect(getRepositoryDescription('maven', 'predisclosure')).toBeDefined();
    expect(getRepositoryDescription('maven', 'predisclosure')).toBeTruthy();
  });
});

describe('formatRepositoryName', () => {
  it('formats ecosystem and security level when both are available', () => {
    expect(formatRepositoryName('maven', 'validated')).toBe('Java Validated');
    expect(formatRepositoryName('python', 'remediated')).toBe('Python Remediated');
  });

  it('falls back to repository name when content type or security level is missing', () => {
    expect(formatRepositoryName(undefined, 'validated', 'fallback-repo')).toBe('fallback-repo');
    expect(formatRepositoryName('maven', undefined, 'fallback-repo')).toBe('fallback-repo');
  });

  it('returns dash when no formatted name or fallback is available', () => {
    expect(formatRepositoryName()).toBe('—');
  });

  it('formats predisclosure repository name correctly', () => {
    expect(formatRepositoryName('maven', 'predisclosure')).toBe('Java Predisclosure');
  });
});

describe('getRepositoryPathSlug', () => {
  it('creates a slug from ecosystem and security level', () => {
    expect(getRepositoryPathSlug('maven', 'validated')).toBe('java-validated');
    expect(getRepositoryPathSlug('python', 'remediated')).toBe('python-remediated');
  });

  it('returns empty string when content type or security level is missing', () => {
    expect(getRepositoryPathSlug()).toBe('');
    expect(getRepositoryPathSlug('maven')).toBe('');
    expect(getRepositoryPathSlug(undefined, 'validated')).toBe('');
  });

  it('creates a slug for predisclosure security level', () => {
    expect(getRepositoryPathSlug('maven', 'predisclosure')).toBe('java-predisclosure');
  });
});

describe('getRepositoryNameFromPathSlug', () => {
  it('converts a slug into a Lightwell repository name', () => {
    expect(getRepositoryNameFromPathSlug('java-validated')).toBe('lightwell/java/validated');
    expect(getRepositoryNameFromPathSlug('python-remediated')).toBe('lightwell/python/remediated');
  });

  it('returns empty string for invalid slugs', () => {
    expect(getRepositoryNameFromPathSlug('')).toBe('');
    expect(getRepositoryNameFromPathSlug('java')).toBe('');
    expect(getRepositoryNameFromPathSlug('-validated')).toBe('');
    expect(getRepositoryNameFromPathSlug('java-')).toBe('');
  });

  it('converts predisclosure slug into repository name', () => {
    expect(getRepositoryNameFromPathSlug('java-predisclosure')).toBe(
      'lightwell/java/predisclosure',
    );
  });
});

describe('stripLightwellVersionSuffix', () => {
  it('removes Lightwell release suffix from a version', () => {
    expect(stripLightwellVersionSuffix('1.2.3.rhlw-00001')).toBe('1.2.3');
  });

  it('returns the original version when no Lightwell suffix exists', () => {
    expect(stripLightwellVersionSuffix('1.2.3')).toBe('1.2.3');
  });
});

describe('lightwellReleaseNum', () => {
  it('extracts release number from a release', () => {
    expect(lightwellReleaseNum('1.2.3.rhlw-00012')).toBe(12);
  });

  it('extracts release number from a release suffix', () => {
    expect(lightwellReleaseNum('rhlw-00007')).toBe(7);
  });

  it('returns 0 when no trailing number exists', () => {
    expect(lightwellReleaseNum('rhlw')).toBe(0);
  });

  it('returns 0 when no Lightwell release or release exists', () => {
    expect(lightwellReleaseNum('1.2.3')).toBe(0);
  });
});

describe('sortVersionsDesc', () => {
  it('sorts dotted versions in descending numeric order', () => {
    expect(sortVersionsDesc(['1.10.2', '1.9.2', '1.11.1'])).toEqual(['1.11.1', '1.10.2', '1.9.2']);
  });
});

describe('compareVersionsDesc', () => {
  it('sorts Lightwell versions by base version descending', () => {
    const versions = ['1.9.1.rhlw-00001', '1.11.4.rhlw-00001', '1.10.1.rhlw-00001'];

    expect([...versions].sort(compareVersionsDesc)).toEqual([
      '1.11.4.rhlw-00001',
      '1.10.1.rhlw-00001',
      '1.9.1.rhlw-00001',
    ]);
  });

  it('treats versions with the same base version as equal', () => {
    expect(compareVersionsDesc('1.2.3.rhlw-00003', '1.2.3.rhlw-00002')).toBe(0);
  });
});

describe('compareReleasesDesc', () => {
  const release = (version: string, release: string) => ({
    version,
    release,
    created_at: '',
  });

  it('sorts releases by version descending first', () => {
    const releases = [
      release('1.2.2.rhlw-00009', 'rhlw-00009'),
      release('1.2.3.rhlw-00001', 'rhlw-00001'),
    ];

    expect([...releases].sort(compareReleasesDesc)).toEqual([
      release('1.2.3.rhlw-00001', 'rhlw-00001'),
      release('1.2.2.rhlw-00009', 'rhlw-00009'),
    ]);
  });

  it('uses release number as a tiebreaker when base versions match', () => {
    const releases = [
      release('1.2.2.rhlw-00008', 'rhlw-00008'),
      release('1.2.2.rhlw-00009', 'rhlw-00009'),
      release('1.2.2.rhlw-00003', 'rhlw-00003'),
    ];

    expect([...releases].sort(compareReleasesDesc)).toEqual([
      release('1.2.2.rhlw-00009', 'rhlw-00009'),
      release('1.2.2.rhlw-00008', 'rhlw-00008'),
      release('1.2.2.rhlw-00003', 'rhlw-00003'),
    ]);
  });
});

describe('formatDistributionUrl', () => {
  it('transforms Pulp API URL to Lightwell URL for production', () => {
    expect(
      formatDistributionUrl(
        'https://packages.redhat.com/api/pulp-content/lightwell/java/validated',
      ),
    ).toBe('https://packages.redhat.com/lightwell/java/validated');
  });

  it('transforms Pulp API URL to Lightwell URL for stage', () => {
    expect(
      formatDistributionUrl(
        'https://packages.stage.redhat.com/api/pulp-content/lightwell/python/remediated/',
      ),
    ).toBe('https://packages.stage.redhat.com/lightwell/python/remediated/');
  });

  it('handles URLs without trailing slash', () => {
    expect(
      formatDistributionUrl(
        'https://packages.redhat.com/api/pulp-content/lightwell/python/validated',
      ),
    ).toBe('https://packages.redhat.com/lightwell/python/validated');
  });

  it('returns empty string unchanged', () => {
    expect(formatDistributionUrl('')).toBe('');
  });

  it('transforms demo Pulp API URL to Lightwell URL', () => {
    expect(
      formatDistributionUrl(
        'https://packages.redhat.com/api/pulp-content/public-lightwell-demo/python/validated/simple',
      ),
    ).toBe('https://packages.redhat.com/lightwell/public-lightwell-demo/python/validated/simple');
  });

  it('transforms demo Pulp API URL to Lightwell URL with trailing slash', () => {
    expect(
      formatDistributionUrl(
        'https://packages.redhat.com/api/pulp-content/public-lightwell-demo/python/validated/simple/',
      ),
    ).toBe('https://packages.redhat.com/lightwell/public-lightwell-demo/python/validated/simple/');
  });

  it('returns URL unchanged if it does not contain the expected path', () => {
    expect(formatDistributionUrl('https://example.com/some/other/path')).toBe(
      'https://example.com/some/other/path',
    );
  });
});

describe('getPackageLastActivity', () => {
  it('returns the latest created_at from package releases', () => {
    expect(
      getPackageLastActivity({
        group: 'org.json',
        name: 'json',
        versions: ['1.0.0'],
        latest_releases: [
          { version: '1.0.0', release: 'rhlw-0001', created_at: '2026-06-01T00:00:00Z' },
          { version: '1.0.0', release: 'rhlw-0002', created_at: '2026-07-01T00:00:00Z' },
        ],
      }),
    ).toBe('2026-07-01T00:00:00Z');
  });

  it('returns empty string when no releases exist', () => {
    expect(
      getPackageLastActivity({
        group: '',
        name: 'requests',
        versions: ['2.0.0'],
        latest_releases: [],
      }),
    ).toBe('');
  });
});

describe('compareTimestampsDesc', () => {
  it('sorts newer timestamps before older timestamps', () => {
    expect(compareTimestampsDesc('2026-07-01T00:00:00Z', '2026-06-01T00:00:00Z')).toBeLessThan(0);
    expect(compareTimestampsDesc('2026-06-01T00:00:00Z', '2026-07-01T00:00:00Z')).toBeGreaterThan(
      0,
    );
  });

  it('places empty timestamps after populated timestamps', () => {
    expect(compareTimestampsDesc('', '2026-07-01T00:00:00Z')).toBeGreaterThan(0);
    expect(compareTimestampsDesc('2026-07-01T00:00:00Z', '')).toBeLessThan(0);
  });
});

describe('compareTimestampsAsc', () => {
  it('sorts older timestamps before newer timestamps', () => {
    expect(compareTimestampsAsc('2026-07-01T00:00:00Z', '2026-06-01T00:00:00Z')).toBeGreaterThan(0);
    expect(compareTimestampsAsc('2026-06-01T00:00:00Z', '2026-07-01T00:00:00Z')).toBeLessThan(0);
  });
});

describe('isWithinLastDays', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-01T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns true for timestamps within the window', () => {
    expect(isWithinLastDays('2026-08-30T00:00:00Z', 7)).toBe(true);
    expect(isWithinLastDays('2026-08-25T00:00:00Z', 7)).toBe(true);
  });

  it('returns false for timestamps outside the window', () => {
    expect(isWithinLastDays('2026-08-24T23:59:59Z', 7)).toBe(false);
    expect(isWithinLastDays('2026-07-01T00:00:00Z', 7)).toBe(false);
  });

  it('returns false for empty or invalid timestamps', () => {
    expect(isWithinLastDays('', 7)).toBe(false);
    expect(isWithinLastDays('not-a-date', 7)).toBe(false);
  });
});

describe('countRecentReleases', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-01T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('counts release events within the window across packages', () => {
    expect(
      countRecentReleases([
        {
          group: 'org.json',
          name: 'json',
          versions: ['1.0.0'],
          latest_releases: [
            { version: '1.0.0', release: 'rhlw-0001', created_at: '2026-08-30T00:00:00Z' },
            { version: '1.0.1', release: 'rhlw-0002', created_at: '2026-07-01T00:00:00Z' },
          ],
        },
        {
          group: 'org.apache.commons',
          name: 'commons-lang3',
          versions: ['3.15.0'],
          latest_releases: [
            { version: '3.15.0', release: '', created_at: '2026-08-28T00:00:00Z' },
          ],
        },
      ]),
    ).toBe(2);
  });

  it('returns zero when no releases are recent', () => {
    expect(
      countRecentReleases([
        {
          group: '',
          name: 'requests',
          versions: ['2.0.0'],
          latest_releases: [
            { version: '2.0.0', release: 'rhlw-0001', created_at: '2026-06-01T00:00:00Z' },
          ],
        },
      ]),
    ).toBe(0);
  });
});

describe('isWithinLastDay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-02T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns true for timestamps from yesterday', () => {
    expect(isWithinLastDay('2026-09-01T10:00:00Z')).toBe(true);
  });

  it('returns false for timestamps older than one day', () => {
    expect(isWithinLastDay('2026-08-30T00:00:00Z')).toBe(false);
  });
});

describe('formatPackageDisplayName', () => {
  it('formats maven packages with group prefix', () => {
    expect(formatPackageDisplayName('org.json', 'json')).toBe('org.json:json');
  });

  it('returns name only for python packages', () => {
    expect(formatPackageDisplayName('', 'requests')).toBe('requests');
  });
});

describe('buildCrossRepoPackageReleaseStats', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-02T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('aggregates release counts per package across repositories', () => {
    const stats = buildCrossRepoPackageReleaseStats(
      [
        {
          uuid: 'repo-1',
          name: 'lightwell/java/validated',
        } as never,
      ],
      {
        'repo-1': [
          {
            group: 'org.json',
            name: 'json',
            versions: ['1.0.0'],
            latest_releases: [
              { version: '1.0.0', release: 'rhlw-0001', created_at: '2026-09-01T10:00:00Z' },
              { version: '1.0.1', release: 'rhlw-0002', created_at: '2026-07-01T00:00:00Z' },
            ],
          },
        ],
      },
      1,
    );

    expect(stats).toHaveLength(1);
    expect(stats[0].releaseCount).toBe(1);
    expect(stats[0].packageName).toBe('org.json:json');
    expect(stats[0].securityLevel).toBeUndefined();
  });

  it('includes security level from repository metadata', () => {
    const stats = buildCrossRepoPackageReleaseStats(
      [
        {
          uuid: 'repo-1',
          name: 'lightwell/java/validated',
          security_level: 'validated',
        } as never,
      ],
      {
        'repo-1': [
          {
            group: 'org.json',
            name: 'json',
            versions: ['1.0.0'],
            latest_releases: [
              { version: '1.0.0', release: 'rhlw-0001', created_at: '2026-09-01T10:00:00Z' },
            ],
          },
        ],
      },
      1,
    );

    expect(stats[0].securityLevel).toBe('validated');
  });
});

describe('getTopPackagesByRecentReleases', () => {
  it('returns top packages sorted by release count', () => {
    const top = getTopPackagesByRecentReleases(
      [
        {
          packageKey: 'a',
          packageName: 'alpha',
          repositoryUuid: '1',
          repositoryName: 'lightwell/java/validated',
          releaseCount: 1,
        },
        {
          packageKey: 'b',
          packageName: 'beta',
          repositoryUuid: '1',
          repositoryName: 'lightwell/java/remediated',
          releaseCount: 3,
        },
        {
          packageKey: 'c',
          packageName: 'charlie',
          repositoryUuid: '2',
          repositoryName: 'lightwell/python/validated',
          releaseCount: 0,
        },
      ],
      2,
    );

    expect(top).toHaveLength(2);
    expect(top[0].packageName).toBe('beta');
    expect(top[1].packageName).toBe('alpha');
  });
});

describe('getTopPackagesBySecurityLevel', () => {
  const stats = [
    {
      packageKey: 'validated-a',
      packageName: 'alpha',
      repositoryUuid: '1',
      repositoryName: 'lightwell/java/validated',
      releaseCount: 2,
      securityLevel: 'validated',
    },
    {
      packageKey: 'validated-b',
      packageName: 'beta',
      repositoryUuid: '2',
      repositoryName: 'lightwell/python/validated',
      releaseCount: 1,
      securityLevel: 'validated',
    },
    {
      packageKey: 'remediated-a',
      packageName: 'gamma',
      repositoryUuid: '3',
      repositoryName: 'lightwell/java/remediated',
      releaseCount: 4,
      securityLevel: 'remediated',
    },
    {
      packageKey: 'predisclosure-a',
      packageName: 'delta',
      repositoryUuid: '4',
      repositoryName: 'lightwell/java/predisclosure',
      releaseCount: 1,
      securityLevel: 'predisclosure',
    },
    {
      packageKey: 'validated-c',
      packageName: 'empty',
      repositoryUuid: '1',
      repositoryName: 'lightwell/java/validated',
      releaseCount: 0,
      securityLevel: 'validated',
    },
  ];

  it('groups, sorts, limits, and excludes zero-release packages per security level', () => {
    const grouped = getTopPackagesBySecurityLevel(stats, 1);

    expect(grouped.validated).toHaveLength(1);
    expect(grouped.validated[0].packageName).toBe('alpha');
    expect(grouped.remediated).toHaveLength(1);
    expect(grouped.remediated[0].packageName).toBe('gamma');
    expect(grouped.predisclosure).toHaveLength(1);
    expect(grouped.predisclosure[0].packageName).toBe('delta');
  });
});

describe('buildRecentActivitySummary', () => {
  it('deduplicates repositories and sums package and release counts', () => {
    const summary = buildRecentActivitySummary([
      {
        packageKey: 'a',
        packageName: 'alpha',
        repositoryUuid: 'repo-1',
        repositoryName: 'lightwell/java/validated',
        releaseCount: 2,
      },
      {
        packageKey: 'b',
        packageName: 'beta',
        repositoryUuid: 'repo-1',
        repositoryName: 'lightwell/java/validated',
        releaseCount: 1,
      },
      {
        packageKey: 'c',
        packageName: 'charlie',
        repositoryUuid: 'repo-2',
        repositoryName: 'lightwell/python/validated',
        releaseCount: 3,
      },
      {
        packageKey: 'd',
        packageName: 'delta',
        repositoryUuid: 'repo-3',
        repositoryName: 'lightwell/java/remediated',
        releaseCount: 0,
      },
    ]);

    expect(summary).toEqual({
      repositories: 2,
      packages: 3,
      releases: 6,
    });
  });

  it('returns zero counts when there is no recent activity', () => {
    expect(
      buildRecentActivitySummary([
        {
          packageKey: 'a',
          packageName: 'alpha',
          repositoryUuid: 'repo-1',
          repositoryName: 'lightwell/java/validated',
          releaseCount: 0,
        },
      ]),
    ).toEqual({
      repositories: 0,
      packages: 0,
      releases: 0,
    });
  });
});
