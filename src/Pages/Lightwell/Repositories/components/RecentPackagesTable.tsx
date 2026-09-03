import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { formatRepositoryShortName, type PackageReleaseStat } from '../../helpers';

type RecentPackagesTableProps = {
  packages: PackageReleaseStat[];
  ariaLabel: string;
  releasesColumnLabel?: string;
  emptyStateMessage?: string;
};

const RecentPackagesTable = ({
  packages,
  ariaLabel,
  releasesColumnLabel = 'Releases (past 7 days)',
  emptyStateMessage = 'No packages had releases in the past 7 days.',
}: RecentPackagesTableProps) => (
  <Table aria-label={ariaLabel} variant={TableVariant.compact} isStriped>
    <Thead>
      <Tr>
        <Th>Package</Th>
        <Th>Repository</Th>
        <Th>{releasesColumnLabel}</Th>
      </Tr>
    </Thead>
    <Tbody>
      {packages.length === 0 ? (
        <Tr>
          <Td colSpan={3}>{emptyStateMessage}</Td>
        </Tr>
      ) : (
        packages.map((pkg) => (
          <Tr key={pkg.packageKey}>
            <Td dataLabel='Package'>{pkg.packageName}</Td>
            <Td dataLabel='Repository'>{formatRepositoryShortName(pkg.repositoryName)}</Td>
            <Td dataLabel={releasesColumnLabel}>{pkg.releaseCount}</Td>
          </Tr>
        ))
      )}
    </Tbody>
  </Table>
);

export default RecentPackagesTable;
