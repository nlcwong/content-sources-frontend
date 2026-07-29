import { Button, Label } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useNavigate } from 'react-router-dom';

import type { LightwellCVE } from './types';

type CVETableProps = {
  cves: LightwellCVE[];
};

const truncate = (text: string, maxLength: number) =>
  text.length <= maxLength ? text : text.slice(0, maxLength).trimEnd() + '…';

const CVETable = ({ cves }: CVETableProps) => {
  const navigate = useNavigate();

  if (cves.length === 0) {
    return null;
  }

  return (
    <Table aria-label='CVEs fixed in this release' variant={TableVariant.compact}>
      <Thead>
        <Tr>
          <Th>CVE ID</Th>
          <Th>Aliases</Th>
          <Th>Description</Th>
          <Th width={15}>Fixed in</Th>
        </Tr>
      </Thead>
      <Tbody>
        {cves.map((cve) => {
          const primaryAlias = cve.aliases.find((a) => a.startsWith('CVE-')) ?? cve.aliases[0];
          const otherAliases = cve.aliases.filter((a) => a !== primaryAlias);
          const fixedVersion = cve.affected[0]?.ranges[0]?.events.find((e) => e.fixed)?.fixed ?? '—';

          return (
            <Tr key={cve.id}>
              <Td dataLabel='CVE ID'>
                <Button
                  variant='link'
                  isInline
                  onClick={() => navigate(`cve/${encodeURIComponent(cve.id)}`)}
                >
                  {primaryAlias || cve.id}
                </Button>
              </Td>
              <Td dataLabel='Aliases'>
                {otherAliases.map((alias) => (
                  <Label key={alias} isCompact variant='outline' style={{ marginRight: 4 }}>
                    {alias}
                  </Label>
                ))}
                {otherAliases.length === 0 && '—'}
              </Td>
              <Td dataLabel='Description'>{truncate(cve.details, 120)}</Td>
              <Td dataLabel='Fixed in'>
                <Label isCompact color='green'>
                  {fixedVersion}
                </Label>
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default CVETable;
