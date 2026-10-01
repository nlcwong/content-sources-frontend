import { Alert, Content } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

type AccessBoundaryNoteProps = {
  audience: 'customer' | 'stam';
};

/**
 * Static Phase 1 access-boundary copy for the wireframe (no real auth).
 */
const AccessBoundaryNote = ({ audience }: AccessBoundaryNoteProps) => (
  <Alert
    variant='info'
    isInline
    title='Who can see this (prototype)'
    className={spacing.mbMd}
    data-ouia-component-id='lightwell-beacon-access-boundary'
  >
    {audience === 'customer' ? (
      <Content component='p'>
        Approved users in your customer organization can submit and view their company&apos;s
        submission history. Assigned LW-STAMs, designated backups, and trusted administrators can
        also see submissions for intake. Submission history does not automatically include download
        of original files.
      </Content>
    ) : (
      <Content component='p'>
        This view is for assigned LW-STAMs, backups, and trusted administrators. Customers see
        status updates (Received, Processing, pipeline queue, more information requested) on their
        own history. Original file retrieval uses an approved process with audit (out of this
        wireframe)—not a one-click download here.
      </Content>
    )}
  </Alert>
);

export default AccessBoundaryNote;
