import { useEffect, useState } from 'react';
import {
  Alert,
  AlertActionCloseButton,
  Button,
  Content,
  PageSection,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import LightwellPageHeader from '../components/LightwellPageHeader';
import AccessBoundaryNote from './components/AccessBoundaryNote';
import BeaconUploadCard from './components/BeaconUploadCard';
import MySubmissionsTable from './components/MySubmissionsTable';
import { useBeaconUpload } from './hooks/useBeaconUpload';

type SuccessReceipt = {
  submissionId: string;
  findingCount: number;
};

const BeaconUpload = () => {
  const { isReceived, uploadProps, startOver, submissionId, findingCount } = useBeaconUpload();
  const [isComposing, setIsComposing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<SuccessReceipt | null>(null);

  useEffect(() => {
    if (!isReceived || !submissionId) {
      return;
    }
    setSuccessReceipt({
      submissionId,
      findingCount: findingCount ?? 0,
    });
    setIsComposing(false);
    startOver();
  }, [isReceived, submissionId, findingCount, startOver]);

  const cancelCompose = () => {
    startOver();
    setIsComposing(false);
  };

  return (
    <>
      <PageSection
        aria-label='Beacon Intake access boundary'
        hasBodyWrapper={false}
        className={`${spacing.pb_0} ${spacing.pxLg} ${spacing.plXs}`}
      >
        <AccessBoundaryNote audience='customer' />
      </PageSection>
      <LightwellPageHeader
        title='Beacon Intake'
        ouiaId='lightwell-beacon-upload-header'
        description='Submit vulnerability findings using the shared JSON / OpenAPI intake contract—without emailing files to your STAM.'
        {...(!isComposing && {
          actions: (
            <Button
              variant='primary'
              icon={<PlusIcon />}
              ouiaId='lightwell-beacon-submit-intake'
              onClick={() => {
                setSuccessReceipt(null);
                startOver();
                setIsComposing(true);
              }}
            >
              Submit Intake
            </Button>
          ),
        })}
      />
      <PageSection
        aria-label='Beacon Intake'
        hasBodyWrapper={false}
        className={`${spacing.pt_0} ${spacing.pbLg} ${spacing.pxLg} ${spacing.plXs}`}
      >
        <Stack hasGutter>
          {isComposing ? (
            <StackItem>
              <BeaconUploadCard {...uploadProps} onCancel={cancelCompose} />
            </StackItem>
          ) : null}
          {successReceipt ? (
            <StackItem>
              <Alert
                variant='success'
                isInline
                title='Submission received'
                ouiaId='lightwell-beacon-intake-success'
                actionClose={
                  <AlertActionCloseButton
                    title='Close success alert'
                    onClose={() => setSuccessReceipt(null)}
                  />
                }
              >
                <Content component='p'>
                  Durable reference:{' '}
                  <Content component='code' data-ouia-component-id='lightwell-beacon-submission-id'>
                    {successReceipt.submissionId}
                  </Content>
                  . {successReceipt.findingCount} finding
                  {successReceipt.findingCount === 1 ? '' : 's'} passed structural checks and{' '}
                  {successReceipt.findingCount === 1 ? 'is' : 'are'} now{' '}
                  <strong>Received</strong>. This does <strong>not</strong> mean LW-STAM review is
                  complete or that the submission is accepted for processing.
                </Content>
              </Alert>
            </StackItem>
          ) : null}
          <StackItem>
            <MySubmissionsTable />
          </StackItem>
        </Stack>
      </PageSection>
    </>
  );
};

export default BeaconUpload;
