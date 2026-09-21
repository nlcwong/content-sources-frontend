import { useSyncExternalStore } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
} from '@patternfly/react-core';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import {
  getIncomingBeaconSubmissions,
  readBeaconSubmissions,
  subscribeBeaconSubmissions,
  updateBeaconSubmissionStatus,
} from '../utils/beaconSubmissionsStore';

const formatUploadedAt = (iso: string) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

/**
 * STAM-facing prototype panel: customer submissions awaiting review.
 * Shares localStorage store with the customer upload page.
 */
const IncomingUploadsPanel = () => {
  const submissions = useSyncExternalStore(subscribeBeaconSubmissions, readBeaconSubmissions);
  const incoming = getIncomingBeaconSubmissions(submissions);

  return (
    <Card isGlass data-ouia-component-id='lightwell-beacon-incoming-uploads'>
      <CardHeader>
        <CardTitle>Incoming customer uploads</CardTitle>
      </CardHeader>
      <CardBody>
        {incoming.length === 0 ? (
          <Content component='p'>No customer submissions awaiting review.</Content>
        ) : (
          <Table variant={TableVariant.compact} aria-label='Incoming customer uploads'>
            <Thead>
              <Tr>
                <Th>Filename</Th>
                <Th>Uploaded</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {incoming.map((submission) => (
                <Tr key={submission.id}>
                  <Td dataLabel='Filename'>{submission.filename}</Td>
                  <Td dataLabel='Uploaded'>{formatUploadedAt(submission.uploadedAt)}</Td>
                  <Td dataLabel='Status'>{submission.status}</Td>
                  <Td dataLabel='Actions'>
                    <Button
                      variant='secondary'
                      size='sm'
                      onClick={() => updateBeaconSubmissionStatus(submission.id, 'Accepted')}
                      ouiaId={`lightwell-beacon-accept-${submission.id}`}
                    >
                      Mark accepted
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
};

export default IncomingUploadsPanel;
