import { Button, Flex, Label, Title } from '@patternfly/react-core';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useMemo, useState } from 'react';

import { RepositoryPackageReleaseInfo } from 'services/Content/ContentApi';
import LastActivityCell from '../../components/LastActivityCell';
import { compareTimestampsDesc, getTableSortParams } from '../../helpers';

type PackageVersionsTabProps = {
  currentVersion: string;
  versions: string[];
  latestReleases: RepositoryPackageReleaseInfo[];
  onVersionSelect: (version: string) => void;
};

const LAST_ACTIVITY_COLUMN_INDEX = 1;

const PackageVersionsTab = ({
  currentVersion,
  versions,
  latestReleases,
  onVersionSelect,
}: PackageVersionsTabProps) => {
  const [activeSortIndex, setActiveSortIndex] = useState<number | undefined>(
    LAST_ACTIVITY_COLUMN_INDEX,
  );
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc' | undefined>(
    'desc',
  );

  const releaseDateMap = useMemo(() => {
    const map: Record<string, string> = {};
    latestReleases.forEach((r) => {
      map[r.version] = r.created_at ?? '';
    });
    return map;
  }, [latestReleases]);

  const sortedVersions = useMemo(() => {
    if (activeSortIndex !== LAST_ACTIVITY_COLUMN_INDEX || !activeSortDirection) {
      return versions;
    }

    return [...versions].sort((a, b) => {
      const comparison = compareTimestampsDesc(releaseDateMap[a] ?? '', releaseDateMap[b] ?? '');
      return activeSortDirection === 'asc' ? -comparison : comparison;
    });
  }, [activeSortDirection, activeSortIndex, releaseDateMap, versions]);

  return (
    <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
      <Title headingLevel='h2' size='lg'>
        Available versions
      </Title>
      <Table aria-label='Available versions' variant={TableVariant.compact}>
        <Thead>
          <Tr>
            <Th>Version</Th>
            <Th
              width={15}
              sort={getTableSortParams(
                LAST_ACTIVITY_COLUMN_INDEX,
                activeSortIndex,
                activeSortDirection,
                (index, direction) => {
                  setActiveSortIndex(index);
                  setActiveSortDirection(direction);
                },
              )}
            >
              Last activity
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedVersions.map((version) => {
            const isSelected = version === currentVersion;
            return (
              <Tr key={version}>
                <Td dataLabel='Version'>
                  {isSelected ? (
                    <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <span style={{ fontWeight: 'bold' }}>{version}</span>
                      <Label isCompact color='blue'>
                        Selected
                      </Label>
                    </Flex>
                  ) : (
                    <Button variant='link' isInline onClick={() => onVersionSelect(version)}>
                      {version}
                    </Button>
                  )}
                </Td>
                <Td dataLabel='Last activity'>
                  <LastActivityCell timestamp={releaseDateMap[version]} />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Flex>
  );
};

export default PackageVersionsTab;
