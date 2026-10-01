import { useSyncExternalStore } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
} from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import {
  BEACON_STATUS_VALIDATING,
  type BeaconSubmission,
} from '../uploadTypes';
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

const triggerBrowserDownload = (filename: string, contents: string, mimeType: string) => {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const downloadSubmissionFiles = (submission: BeaconSubmission) => {
  const jsonName = submission.jsonFilename ?? `${submission.id}-findings.json`;
  triggerBrowserDownload(
    jsonName,
    JSON.stringify(
      {
        note: 'Prototype placeholder — original payload is not persisted in this wireframe.',
        submission_id: submission.id,
        finding_count: submission.findingCount,
      },
      null,
      2,
    ),
    'application/json',
  );

  if (submission.pocFilenames.length > 0) {
    submission.pocFilenames.forEach((pocFilename) => {
      triggerBrowserDownload(
        pocFilename,
        `Prototype placeholder reproducer for ${submission.id}\n`,
        'application/octet-stream',
      );
    });
  }
};

const onDownload = (submission: BeaconSubmission) => {
  downloadSubmissionFiles(submission);
  if (submission.status !== BEACON_STATUS_VALIDATING) {
    updateBeaconSubmissionStatus(submission.id, BEACON_STATUS_VALIDATING);
  }
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
          Download the findings JSON (and reproducer when present) to begin review. Download sets
          the customer-visible status to Validating…. Accepted and Rejected outcomes are reserved
          for a later step in this wireframe.
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
                  <Td dataLabel='Actions'>
                    <Button
                      variant='plain'
                      aria-label={`Download files for ${submission.id}`}
                      onClick={() => onDownload(submission)}
                      ouiaId={`lightwell-beacon-download-${submission.id}`}
                    >
                      <DownloadIcon />
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
