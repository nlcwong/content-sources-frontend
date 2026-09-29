import { useSyncExternalStore } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
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
 * STAM-facing prototype panel: customer submissions awaiting accept-for-processing.
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
        <Content component='small'>
          Assigned LW-STAM is notified on new Received submissions (mock). Accept for processing
          only after semantic / handling review—before JSM automation.
        </Content>
        {incoming.length === 0 ? (
          <Content component='p' className={spacing.mtMd}>
            No customer submissions awaiting accept for processing.
          </Content>
        ) : (
          <Table variant={TableVariant.compact} aria-label='Incoming customer uploads'>
            <Thead>
              <Tr>
                <Th>Submission ID</Th>
                <Th>Submitted</Th>
                <Th>Findings</Th>
                <Th>Submitter</Th>
                <Th>Reference</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {incoming.map((submission) => (
                <Tr key={submission.id}>
                  <Td dataLabel='Submission ID'>
                    <Content component='code'>{submission.id}</Content>
                  </Td>
                  <Td dataLabel='Submitted'>{formatUploadedAt(submission.uploadedAt)}</Td>
                  <Td dataLabel='Findings'>{submission.findingCount}</Td>
                  <Td dataLabel='Submitter'>{submission.submitterName}</Td>
                  <Td dataLabel='Reference'>{submission.submitterReference}</Td>
                  <Td dataLabel='Status'>{submission.status}</Td>
                  <Td dataLabel='Actions'>
                    <Button
                      variant='secondary'
                      size='sm'
                      onClick={() =>
                        updateBeaconSubmissionStatus(submission.id, 'Accepted for processing')
                      }
                      ouiaId={`lightwell-beacon-accept-${submission.id}`}
                    >
                      Accept for processing
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
