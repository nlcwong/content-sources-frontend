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
      {submissions.length === 0 ? (
        <Content component='p'>No submissions yet. Upload a file to see it listed here.</Content>
      ) : (
        <Table variant={TableVariant.compact} aria-label='My Beacon submissions'>
          <Thead>
            <Tr>
              <Th>Filename</Th>
              <Th>Uploaded</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {submissions.map((submission) => (
              <Tr key={submission.id}>
                <Td dataLabel='Filename'>{submission.filename}</Td>
                <Td dataLabel='Uploaded'>{formatUploadedAt(submission.uploadedAt)}</Td>
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
