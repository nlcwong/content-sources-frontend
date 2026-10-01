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
        status updates (Submitted, waiting for validation; Validating…; Accepted or Rejected) on
        their own history. Download starts validation review in this wireframe.
      </Content>
    )}
  </Alert>
);

export default AccessBoundaryNote;
