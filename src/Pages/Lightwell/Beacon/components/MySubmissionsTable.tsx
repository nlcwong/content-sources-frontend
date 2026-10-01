import { useSyncExternalStore } from 'react';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Button, Content, Flex, FlexItem, Popover, Title } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import type { BeaconSubmission } from '../uploadTypes';
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

const latestStatusLabel = (submission: BeaconSubmission) => {
  const latest = submission.statusHistory[submission.statusHistory.length - 1];
  if (latest) {
    return `${latest.status} (${formatUploadedAt(latest.at)})`;
  }
  return submission.status;
};

const StatusCell = ({ submission }: { submission: BeaconSubmission }) => {
  const history = submission.statusHistory;

  return (
    <Flex
      gap={{ default: 'gapSm' }}
      alignItems={{ default: 'alignItemsBaseline' }}
      flexWrap={{ default: 'wrap' }}
    >
      <FlexItem>
        <Content component='span'>{latestStatusLabel(submission)}</Content>
      </FlexItem>
      {history.length > 0 ? (
        <FlexItem>
          <Popover
            hasAutoWidth
            maxWidth='28rem'
            headerContent='Status log'
            bodyContent={
              <Content>
                {history.map((entry, index) => (
                  <div key={`${entry.status}-${entry.at}-${index}`}>
                    {entry.status} ({formatUploadedAt(entry.at)})
                  </div>
                ))}
              </Content>
            }
          >
            <Button
              variant='link'
              isInline
              ouiaId={`lightwell-beacon-status-log-${submission.id}`}
            >
              Status Log
            </Button>
          </Popover>
        </FlexItem>
      ) : null}
    </Flex>
  );
};

const MySubmissionsTable = () => {
  const submissions = useSyncExternalStore(subscribeBeaconSubmissions, readBeaconSubmissions);

  return (
    <div data-ouia-component-id='lightwell-beacon-my-submissions'>
      <Title headingLevel='h2' size='lg' className={spacing.mbMd}>
        My submissions
      </Title>
      <Content component='small' className={spacing.mbMd}>
        The Status column shows the current status with a timestamp. Use Status Log for the full
        history. Original JSON and reproducer archives are not available for download here.
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
              <Th>Reproducers</Th>
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
                <Td dataLabel='Reproducers'>
                  {submission.pocFilenames.length === 0 ? (
                    '—'
                  ) : (
                    <Content component='div'>
                      {submission.pocFilenames.map((name) => (
                        <div key={name}>
                          <Content component='code'>{name}</Content>
                        </div>
                      ))}
                    </Content>
                  )}
                </Td>
                <Td dataLabel='Status'>
                  <StatusCell submission={submission} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
};

export default MySubmissionsTable;
