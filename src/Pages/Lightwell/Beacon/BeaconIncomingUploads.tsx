import { PageSection, Stack, StackItem } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import LightwellPageHeader from '../components/LightwellPageHeader';
import IncomingUploadsPanel from './components/IncomingUploadsPanel';

/**
 * STAM-facing page for reviewing customer Beacon uploads (LWLP-1269 prototype).
 */
const BeaconIncomingUploads = () => (
  <>
    <LightwellPageHeader
      title='Incoming uploads'
      ouiaId='lightwell-beacon-incoming-header'
      description='Review customer vulnerability submissions awaiting Lightwell STAM intake.'
    />
    <PageSection
      aria-label='Incoming Beacon uploads'
      hasBodyWrapper={false}
      className={`${spacing.pt_0} ${spacing.pbLg} ${spacing.pxLg} ${spacing.plXs}`}
      data-ouia-component-id='lightwell-beacon-incoming-page'
    >
      <Stack hasGutter style={{ maxWidth: 1200 }}>
        <StackItem>
          <IncomingUploadsPanel />
        </StackItem>
      </Stack>
    </PageSection>
  </>
);

export default BeaconIncomingUploads;
