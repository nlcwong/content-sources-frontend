import { Content, PageSection, Stack, StackItem } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import LightwellPageHeader from '../components/LightwellPageHeader';
import AccessBoundaryNote from './components/AccessBoundaryNote';
import IncomingUploadsPanel from './components/IncomingUploadsPanel';

/**
 * STAM-facing page for reviewing customer Beacon uploads (LWLP-1269 prototype).
 */
const BeaconIncomingUploads = () => (
  <>
    <PageSection
      aria-label='Incoming uploads access boundary'
      hasBodyWrapper={false}
      className={`${spacing.pb_0} ${spacing.pxLg} ${spacing.plXs}`}
    >
      <AccessBoundaryNote audience='stam' />
    </PageSection>
    <LightwellPageHeader
      title='Incoming uploads'
      ouiaId='lightwell-beacon-incoming-header'
      description='Review customer vulnerability submissions. Begin processing, then Approve into the pipeline queue or request more information—before JSM automation.'
    />
    <PageSection
      aria-label='Incoming Beacon uploads'
      hasBodyWrapper={false}
      className={`${spacing.pt_0} ${spacing.pbLg} ${spacing.pxLg} ${spacing.plXs}`}
      data-ouia-component-id='lightwell-beacon-incoming-page'
    >
      <Stack hasGutter>
        <StackItem>
          <Content component='small'>
            Original file retrieval uses an approved process with audit records (out of this
            wireframe). Use submitter and reference columns to request clarification through an
            approved channel.
          </Content>
        </StackItem>
        <StackItem>
          <IncomingUploadsPanel />
        </StackItem>
      </Stack>
    </PageSection>
  </>
);

export default BeaconIncomingUploads;
