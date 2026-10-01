import { Button, Content, List, ListItem, Popover } from '@patternfly/react-core';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { BEACON_REQUIRED_FINDING_FIELDS, BEACON_UPLOAD_MAX_FILE_SIZE_MB } from '../uploadTypes';

/**
 * Prototype guidance for the Phase 1 vulnerability-report contract.
 */
const SubmissionInstructions = () => (
  <Popover
    hasAutoWidth
    maxWidth='32rem'
    headerContent='Submission instructions'
    bodyContent={
      <Content>
        <Content component='p' className={spacing.mbSm}>
          Phase 1 covers <strong>vulnerability reports</strong> only (JSON / OpenAPI contract). SBOM
          submissions are a separate job and are out of this flow.
        </Content>
        <List>
          <ListItem>
            Upload one or more findings <Content component='code'>.json</Content> files via
            drag-and-drop or Choose files. Each JSON becomes its own submission. Payload shape: an
            array of findings or an object with a <Content component='code'>findings</Content>{' '}
            array.
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
            For each selected JSON, optionally attach one or more reproducer files of any type with{' '}
            <strong>Upload reproducer file</strong>. Name each reproducer for its{' '}
            <Content component='code'>vulnerability_id</Content> when applicable.
          </ListItem>
          <ListItem>
            Size limit (prototype): {BEACON_UPLOAD_MAX_FILE_SIZE_MB} MB per file.
          </ListItem>
          <ListItem>
            Passing structural checks shows{' '}
            <strong>Submitted, waiting for validation</strong>. That does not mean LW-STAM review or
            acceptance is complete.
          </ListItem>
        </List>
      </Content>
    }
  >
    <Button
      variant='plain'
      aria-label='Submission instructions'
      ouiaId='lightwell-beacon-submission-instructions'
      className='lightwell-help-btn'
    >
      <HelpIcon />
    </Button>
  </Popover>
);

export default SubmissionInstructions;
