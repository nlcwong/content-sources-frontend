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
  submissionIds: string[];
  findingCount: number;
};

const BeaconUpload = () => {
  const { isReceived, uploadProps, startOver, submissionIds, findingCount } = useBeaconUpload();
  const [isComposing, setIsComposing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<SuccessReceipt | null>(null);

  useEffect(() => {
    if (!isReceived || !submissionIds?.length) {
      return;
    }
    setSuccessReceipt({
      submissionIds,
      findingCount: findingCount ?? 0,
    });
    setIsComposing(false);
    startOver();
  }, [isReceived, submissionIds, findingCount, startOver]);

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
                title={
                  successReceipt.submissionIds.length === 1
                    ? 'Submission received'
                    : 'Submissions received'
                }
                ouiaId='lightwell-beacon-intake-success'
                actionClose={
                  <AlertActionCloseButton
                    title='Close success alert'
                    onClose={() => setSuccessReceipt(null)}
                  />
                }
              >
                <Content component='p'>
                  Created {successReceipt.submissionIds.length} submission
                  {successReceipt.submissionIds.length === 1 ? '' : 's'} (
                  {successReceipt.submissionIds.map((id, index) => (
                    <span key={id}>
                      {index > 0 ? ', ' : ''}
                      <Content
                        component='code'
                        data-ouia-component-id={
                          index === 0 ? 'lightwell-beacon-submission-id' : undefined
                        }
                      >
                        {id}
                      </Content>
                    </span>
                  ))}
                  ). {successReceipt.findingCount} finding
                  {successReceipt.findingCount === 1 ? '' : 's'} passed structural checks and{' '}
                  {successReceipt.findingCount === 1 ? 'is' : 'are'} now{' '}
                  <strong>Submitted, waiting for validation</strong>. This does{' '}
                  <strong>not</strong> mean LW-STAM review is complete or that the submissions are
                  accepted.
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
