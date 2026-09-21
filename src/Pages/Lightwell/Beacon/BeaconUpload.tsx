import { Button, PageSection, Stack, StackItem } from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import LightwellPageHeader from '../components/LightwellPageHeader';
import BeaconUploadCard from './components/BeaconUploadCard';
import { useBeaconUpload } from './hooks/useBeaconUpload';

const BeaconUpload = () => {
  const { isComplete, uploadProps, startOver } = useBeaconUpload();

  return (
    <>
      <LightwellPageHeader
        title='Upload to Beacon'
        ouiaId='lightwell-beacon-upload-header'
        description='Securely submit vulnerability data for Lightwell Clearinghouse review without emailing files to your STAM.'
        {...(isComplete && {
          actions: (
            <Button
              variant='secondary'
              icon={<PlusIcon />}
              ouiaId='lightwell-beacon-upload-another'
              onClick={startOver}
            >
              Upload another file
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
            <BeaconUploadCard {...uploadProps} />
          </StackItem>
        </Stack>
      </PageSection>
    </>
  );
};

export default BeaconUpload;
