import { useState } from 'react';
import { Button, PageSection, Stack, StackItem } from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import LightwellPageHeader from '../components/LightwellPageHeader';
import AccessBoundaryNote from './components/AccessBoundaryNote';
import BeaconUploadCard from './components/BeaconUploadCard';
import MySubmissionsTable from './components/MySubmissionsTable';
import { useBeaconUpload } from './hooks/useBeaconUpload';

const BeaconUpload = () => {
  const { isReceived, uploadProps, startOver } = useBeaconUpload();
  const [isComposing, setIsComposing] = useState(false);

  const headerActions = !isComposing ? (
    <Button
      variant='primary'
      icon={<PlusIcon />}
      ouiaId='lightwell-beacon-submit-intake'
      onClick={() => {
        startOver();
        setIsComposing(true);
      }}
    >
      Submit Intake
    </Button>
  ) : isReceived ? (
    <Button
      variant='secondary'
      icon={<PlusIcon />}
      ouiaId='lightwell-beacon-upload-another'
      onClick={() => {
        startOver();
        setIsComposing(true);
      }}
    >
      Submit another report
    </Button>
  ) : undefined;

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
        {...(headerActions ? { actions: headerActions } : {})}
      />
      <PageSection
        aria-label='Beacon Intake'
        hasBodyWrapper={false}
        className={`${spacing.pt_0} ${spacing.pbLg} ${spacing.pxLg} ${spacing.plXs}`}
      >
        <Stack hasGutter>
          {isComposing ? (
            <StackItem>
              <BeaconUploadCard
                {...uploadProps}
                {...(!isReceived ? { onCancel: cancelCompose } : {})}
              />
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
