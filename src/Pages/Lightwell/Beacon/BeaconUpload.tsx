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

  return (
    <>
      <LightwellPageHeader
        title='Upload to Beacon'
        ouiaId='lightwell-beacon-upload-header'
        description='Submit vulnerability findings using the shared JSON / OpenAPI intake contract—without emailing files to your STAM.'
        {...(isReceived && {
          actions: (
            <Button
              variant='secondary'
              icon={<PlusIcon />}
              ouiaId='lightwell-beacon-upload-another'
              onClick={startOver}
            >
              Submit another report
            </Button>
          ),
        })}
      />
      <PageSection
        aria-label='Beacon upload'
        hasBodyWrapper={false}
        className={`${spacing.pt_0} ${spacing.pbLg} ${spacing.pxLg} ${spacing.plXs}`}
      >
        <Stack hasGutter style={{ maxWidth: 1200 }}>
          <StackItem>
            <AccessBoundaryNote audience='customer' />
          </StackItem>
          <StackItem>
            <BeaconUploadCard {...uploadProps} />
          </StackItem>
          <StackItem>
            <MySubmissionsTable />
          </StackItem>
        </Stack>
      </PageSection>
    </>
  );
};

export default BeaconUpload;
