import { useSyncExternalStore } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import type { BeaconSubmission } from '../uploadTypes';
import {
  getStamVisibleBeaconSubmissions,
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

const pipelineNote = (submission: BeaconSubmission) => {
  if (submission.status === 'Added to pipeline queue') {
    return submission.pipelineAddedAt
      ? `Added ${formatUploadedAt(submission.pipelineAddedAt)}`
      : 'Added to pipeline queue';
  }
  if (submission.status === 'More information requested') {
    return 'Halted — awaiting customer response (out of band)';
  }
  return '—';
};

const SubmissionActions = ({ submission }: { submission: BeaconSubmission }) => {
  if (submission.status === 'Received') {
    return (
      <Button
        variant='secondary'
        size='sm'
        onClick={() => updateBeaconSubmissionStatus(submission.id, 'Processing')}
        ouiaId={`lightwell-beacon-begin-${submission.id}`}
      >
        Begin processing
      </Button>
    );
  }

  if (submission.status === 'Processing') {
    return (
      <Flex gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
        <FlexItem>
          <Button
            variant='primary'
            size='sm'
            onClick={() => updateBeaconSubmissionStatus(submission.id, 'Added to pipeline queue')}
            ouiaId={`lightwell-beacon-approve-${submission.id}`}
          >
            Approve
          </Button>
        </FlexItem>
        <FlexItem>
          <Button
            variant='secondary'
            size='sm'
            onClick={() =>
              updateBeaconSubmissionStatus(submission.id, 'More information requested')
            }
            ouiaId={`lightwell-beacon-more-info-${submission.id}`}
          >
            Request more information
          </Button>
        </FlexItem>
      </Flex>
    );
  }

  return <Content component='small'>—</Content>;
};

/**
 * STAM-facing prototype panel: customer submissions for intake review.
 * Shares localStorage store with the customer upload page.
 */
const IncomingUploadsPanel = () => {
  const submissions = useSyncExternalStore(subscribeBeaconSubmissions, readBeaconSubmissions);
  const visible = getStamVisibleBeaconSubmissions(submissions);

  return (
    <Card isGlass data-ouia-component-id='lightwell-beacon-incoming-uploads'>
      <CardHeader>
        <CardTitle>Incoming customer uploads</CardTitle>
      </CardHeader>
      <CardBody>
        <Content component='small'>
          Begin processing after intake. From Processing, Approve sends the submission to the
          pipeline queue (row stays visible with an added timestamp), or Request more information
          halts progress until the customer responds out of band. No JSM automation in this
          wireframe.
        </Content>
        {visible.length === 0 ? (
          <Content component='p' className={spacing.mtMd}>
            No customer submissions yet.
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
                <Th>Pipeline / note</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {visible.map((submission) => (
                <Tr key={submission.id}>
                  <Td dataLabel='Submission ID'>
                    <Content component='code'>{submission.id}</Content>
                  </Td>
                  <Td dataLabel='Submitted'>{formatUploadedAt(submission.uploadedAt)}</Td>
                  <Td dataLabel='Findings'>{submission.findingCount}</Td>
                  <Td dataLabel='Submitter'>{submission.submitterName}</Td>
                  <Td dataLabel='Reference'>{submission.submitterReference}</Td>
                  <Td dataLabel='Status'>{submission.status}</Td>
                  <Td dataLabel='Pipeline / note'>{pipelineNote(submission)}</Td>
                  <Td dataLabel='Actions'>
                    <SubmissionActions submission={submission} />
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
