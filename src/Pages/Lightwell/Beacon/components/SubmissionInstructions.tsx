import { Content, ExpandableSection, List, ListItem } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { BEACON_REQUIRED_FINDING_FIELDS, BEACON_UPLOAD_MAX_FILE_SIZE_MB } from '../uploadTypes';

/**
 * Prototype guidance for the Phase 1 vulnerability-report contract.
 */
const SubmissionInstructions = () => (
  <ExpandableSection
    toggleText='Submission instructions'
    displaySize='lg'
    className={spacing.mbMd}
    data-ouia-component-id='lightwell-beacon-submission-instructions'
  >
    <Content className={spacing.mbSm}>
      Phase 1 covers <strong>vulnerability reports</strong> only (JSON / OpenAPI contract). SBOM
      submissions are a separate job and are out of this flow.
    </Content>
    <List>
      <ListItem>
        Provide a JSON payload: either an array of findings or an object with a{' '}
        <Content component='code'>findings</Content> array.
      </ListItem>
      <ListItem>
        Required fields per finding (stub):{' '}
        {BEACON_REQUIRED_FINDING_FIELDS.map((field) => (
          <Content component='code' key={field}>
            {field}{' '}
          </Content>
        ))}
        . Other spreadsheet columns may be optional or derived during LW-STAM review (TBD).
      </ListItem>
      <ListItem>
        Optionally attach one POC archive named like{' '}
        <Content component='code'>POC-Reports_YYYY-MM-DD.tar.gz</Content>. Name each reproducer
        file for its <Content component='code'>vulnerability_id</Content>.
      </ListItem>
      <ListItem>
        Size limit (prototype): {BEACON_UPLOAD_MAX_FILE_SIZE_MB} MB per JSON or archive file.
      </ListItem>
      <ListItem>
        Passing structural checks shows <strong>Received</strong>. That does not mean LW-STAM review
        or acceptance for processing is complete.
      </ListItem>
    </List>
  </ExpandableSection>
);

export default SubmissionInstructions;
