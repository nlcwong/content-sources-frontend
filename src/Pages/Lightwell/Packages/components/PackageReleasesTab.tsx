import { Button, Flex, Label, Title } from '@patternfly/react-core';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useMemo, useState } from 'react';

import { RepositoryPackageReleaseInfo } from 'services/Content/ContentApi';
import CopyLabel from './CopyLabel';
import LastActivityCell from '../../components/LastActivityCell';
import {
  compareReleasesDesc,
  compareTimestampsDesc,
  getTableSortParams,
  sortVersionsDesc,
} from '../../helpers';

type PackageReleasesTabProps = {
  version: string;
  builds: RepositoryPackageReleaseInfo[];
  allVersions: string[];
  latestReleases: RepositoryPackageReleaseInfo[];
  onVersionSelect: (version: string) => void;
  formatCopyText: (version: string) => string;
};

export const buildVersionFromRelease = (
  release: Pick<RepositoryPackageReleaseInfo, 'version' | 'release'>,
) => `${release.version}.${release.release}`;

const RELEASES_LAST_ACTIVITY_COLUMN_INDEX = 1;
const VERSIONS_LAST_ACTIVITY_COLUMN_INDEX = 3;

const PackageReleasesTab = ({
  version,
  builds,
  allVersions,
  latestReleases,
  onVersionSelect,
  formatCopyText,
}: PackageReleasesTabProps) => {
  const [releasesSortIndex, setReleasesSortIndex] = useState<number | undefined>(
    RELEASES_LAST_ACTIVITY_COLUMN_INDEX,
  );
  const [releasesSortDirection, setReleasesSortDirection] = useState<'asc' | 'desc' | undefined>(
    'desc',
  );
  const [versionsSortIndex, setVersionsSortIndex] = useState<number | undefined>(
    VERSIONS_LAST_ACTIVITY_COLUMN_INDEX,
  );
  const [versionsSortDirection, setVersionsSortDirection] = useState<'asc' | 'desc' | undefined>(
    'desc',
  );

  const { releaseMap, sortedVersions } = useMemo(() => {
    const map: Record<string, RepositoryPackageReleaseInfo> = {};
    const versions: string[] = [];
    const sorted = [...latestReleases].sort(compareReleasesDesc);

    for (const r of sorted) {
      if (!r.release) continue;
      if (!map[r.version]) {
        map[r.version] = r;
        versions.push(r.version);
      }
    }

    if (versions.length > 0) {
      return { releaseMap: map, sortedVersions: versions };
    }

    return { releaseMap: map, sortedVersions: sortVersionsDesc([...new Set(allVersions)]) };
  }, [allVersions, latestReleases]);

  const sortedBuilds = useMemo(() => {
    if (
      releasesSortIndex !== RELEASES_LAST_ACTIVITY_COLUMN_INDEX ||
      !releasesSortDirection
    ) {
      return builds;
    }

    return [...builds].sort((a, b) => {
      const comparison = compareTimestampsDesc(a.created_at ?? '', b.created_at ?? '');
      return releasesSortDirection === 'asc' ? -comparison : comparison;
    });
  }, [builds, releasesSortDirection, releasesSortIndex]);

  const sortedVersionsForTable = useMemo(() => {
    if (
      versionsSortIndex !== VERSIONS_LAST_ACTIVITY_COLUMN_INDEX ||
      !versionsSortDirection
    ) {
      return sortedVersions;
    }

    return [...sortedVersions].sort((a, b) => {
      const comparison = compareTimestampsDesc(
        releaseMap[a]?.created_at ?? '',
        releaseMap[b]?.created_at ?? '',
      );
      return versionsSortDirection === 'asc' ? -comparison : comparison;
    });
  }, [releaseMap, sortedVersions, versionsSortDirection, versionsSortIndex]);

  return (
    <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
      <Title headingLevel='h2' size='lg'>
        Releases for version {version}
      </Title>
      <Table aria-label={`Releases for ${version}`} variant={TableVariant.compact}>
        <Thead>
          <Tr>
            <Th>Release</Th>
            <Th
              width={15}
              sort={getTableSortParams(
                RELEASES_LAST_ACTIVITY_COLUMN_INDEX,
                releasesSortIndex,
                releasesSortDirection,
                (index, direction) => {
                  setReleasesSortIndex(index);
                  setReleasesSortDirection(direction);
                },
              )}
            >
              Last activity
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedBuilds.map((build) => {
            const fullVersion = buildVersionFromRelease(build);
            return (
              <Tr key={fullVersion}>
                <Td dataLabel='Release'>
                  <CopyLabel copyText={formatCopyText(fullVersion)}>{fullVersion}</CopyLabel>
                </Td>
                <Td dataLabel='Last activity'>
                  <LastActivityCell timestamp={build.created_at} />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      <Title headingLevel='h2' size='lg'>
        Available versions
      </Title>
      <Table aria-label='Available versions' variant={TableVariant.compact}>
        <Thead>
          <Tr>
            <Th>Version</Th>
            <Th>Latest release</Th>
            <Th>Releases</Th>
            <Th
              width={15}
              sort={getTableSortParams(
                VERSIONS_LAST_ACTIVITY_COLUMN_INDEX,
                versionsSortIndex,
                versionsSortDirection,
                (index, direction) => {
                  setVersionsSortIndex(index);
                  setVersionsSortDirection(direction);
                },
              )}
            >
              Last activity
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedVersionsForTable.map((stripped) => {
            const isSelected = stripped === version;
            const release = releaseMap[stripped];
            const releaseVersion = release ? buildVersionFromRelease(release) : '';
            const copyText = release ? formatCopyText(releaseVersion) : '';
            return (
              <Tr key={stripped}>
                <Td dataLabel='Version'>
                  {isSelected ? (
                    <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <span style={{ fontWeight: 'bold' }}>{stripped}</span>
                      <Label isCompact color='blue'>
                        Selected
                      </Label>
                    </Flex>
                  ) : (
                    <Button variant='link' isInline onClick={() => onVersionSelect(stripped)}>
                      {stripped}
                    </Button>
                  )}
                </Td>
                <Td dataLabel='Latest release'>
                  {release ? <CopyLabel copyText={copyText}>{releaseVersion}</CopyLabel> : '—'}
                </Td>
                <Td dataLabel='Releases'>{release ? 1 : 0}</Td>
                <Td dataLabel='Last activity'>
                  <LastActivityCell timestamp={release?.created_at} />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Flex>
  );
};

export default PackageReleasesTab;
