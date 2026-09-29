import { useSyncExternalStore } from 'react';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Content, Title } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import {
  readBeaconSubmissions,
  subscribeBeaconSubmissions,
} from '../utils/beaconSubmissionsStore';

const formatUploadedAt = (iso: string) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const MySubmissionsTable = () => {
  const submissions = useSyncExternalStore(subscribeBeaconSubmissions, readBeaconSubmissions);

  return (
    <div data-ouia-component-id='lightwell-beacon-my-submissions'>
      <Title headingLevel='h2' size='lg' className={spacing.mbMd}>
        My submissions
      </Title>
      <Content component='small' className={spacing.mbMd}>
        History shows receipt status only. It does not include download of original JSON or POC
        archives.
      </Content>
      {submissions.length === 0 ? (
        <Content component='p'>
          No submissions yet. Submit a vulnerability findings JSON payload to see it listed here.
        </Content>
      ) : (
        <Table variant={TableVariant.compact} aria-label='My Beacon submissions'>
          <Thead>
            <Tr>
              <Th>Submission ID</Th>
              <Th>Submitted</Th>
              <Th>Findings</Th>
              <Th>POC archive</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {submissions.map((submission) => (
              <Tr key={submission.id}>
                <Td dataLabel='Submission ID'>
                  <Content component='code'>{submission.id}</Content>
                </Td>
                <Td dataLabel='Submitted'>{formatUploadedAt(submission.uploadedAt)}</Td>
                <Td dataLabel='Findings'>{submission.findingCount}</Td>
                <Td dataLabel='POC archive'>{submission.pocFilename ?? '—'}</Td>
                <Td dataLabel='Status'>{submission.status}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
};

export default MySubmissionsTable;
