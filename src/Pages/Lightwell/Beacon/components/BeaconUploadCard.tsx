import {
  Alert,
  Button,
  Card,
  CardBody,
  Content,
  ExpandableSection,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  HelperText,
  HelperTextItem,
  List,
  ListItem,
  MultipleFileUpload,
  MultipleFileUploadMain,
  Spinner,
  TextArea,
  Title,
} from '@patternfly/react-core';
import { CheckCircleIcon, UploadIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useState } from 'react';

import type { BeaconUploadCardProps } from '../hooks/useBeaconUpload';
import { BEACON_UPLOAD_MAX_FILE_SIZE_MB } from '../uploadTypes';
import SubmissionInstructions from './SubmissionInstructions';

const SAMPLE_JSON = `{
  "findings": [
    {
      "vulnerability_id": "VULN-001",
      "packageurl": "pkg:maven/org.example/lib@1.2.3",
      "title": "Example vulnerability",
      "description": "Short description of the finding.",
      "cvss_severity": "High",
      "cvss_score": 7.5
    }
  ]
}`;

const BeaconUploadCard = ({
  step,
  jsonText,
  jsonFilename,
  pocFile,
  structuralErrors,
  processError,
  submissionId,
  findingCount,
  onJsonTextChange,
  onFilesAccepted,
  onClearJson,
  onClearPoc,
  onSubmit,
  onRetry,
  onStartOver,
  onCancel,
}: BeaconUploadCardProps) => {
  const [isPasteExpanded, setIsPasteExpanded] = useState(false);
  const hasJsonSelection = Boolean(jsonFilename || jsonText.trim());

  if (step === 'validating') {
    return (
      <Card isGlass>
        <CardBody className={spacing.p_2xl}>
          <Flex
            direction={{ default: 'column' }}
            gap={{ default: 'gapMd' }}
            alignItems={{ default: 'alignItemsCenter' }}
          >
            <FlexItem>
              <Spinner size='lg' aria-label='Validating submission' />
            </FlexItem>
            <FlexItem>
              <Title headingLevel='h3' size='md'>
                Checking structural conformance…
              </Title>
            </FlexItem>
            <FlexItem>
              <Content component='small'>
                Accepting the request for validation is not the same as Received. Semantic review
                still happens with your LW-STAM.
              </Content>
            </FlexItem>
          </Flex>
        </CardBody>
      </Card>
    );
  }

  if (step === 'received') {
    return (
      <Card isGlass>
        <CardBody className={spacing.p_2xl}>
          <Flex
            direction={{ default: 'column' }}
            gap={{ default: 'gapMd' }}
            alignItems={{ default: 'alignItemsCenter' }}
          >
            <FlexItem>
              <CheckCircleIcon color='var(--pf-t--global--icon--color--status--success--default)' />
            </FlexItem>
            <FlexItem>
              <Title headingLevel='h3' size='md'>
                Submission received
              </Title>
            </FlexItem>
            <FlexItem>
              <Content component='p'>
                Durable reference:{' '}
                <Content component='code' data-ouia-component-id='lightwell-beacon-submission-id'>
                  {submissionId}
                </Content>
              </Content>
            </FlexItem>
            <FlexItem>
              <Content component='p'>
                {findingCount ?? 0} finding
                {(findingCount ?? 0) === 1 ? '' : 's'}
                {pocFile ? ` with POC archive ${pocFile.name}` : ''} passed structural checks and is
                now <strong>Received</strong>. This does <strong>not</strong> mean LW-STAM review is
                complete or that the submission is accepted for processing.
              </Content>
            </FlexItem>
            <FlexItem>
              <Button variant='secondary' onClick={onStartOver} ouiaId='lightwell-beacon-upload-another'>
                Submit another report
              </Button>
            </FlexItem>
          </Flex>
        </CardBody>
      </Card>
    );
  }

  const showStructuralErrors = step === 'error' && structuralErrors.length > 0;

  return (
    <Card isGlass>
      <CardBody className={spacing.pXl}>
        <Flex direction={{ default: 'column' }} gap={{ default: 'gapLg' }}>
          <FlexItem>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              gap={{ default: 'gapXs' }}
              className={spacing.mbSm}
            >
              <FlexItem>
                <Title headingLevel='h3' size='md'>
                  Choose file(s) to submit
                </Title>
              </FlexItem>
              <FlexItem>
                <SubmissionInstructions />
              </FlexItem>
            </Flex>
            <Content component='small' className={spacing.mbSm}>
              Drop or choose a vulnerability findings <Content component='code'>.json</Content> file
              and an optional POC archive (
              <Content component='code'>POC-Reports_YYYY-MM-DD.tar.gz</Content>
              ). Maximum size per file: {BEACON_UPLOAD_MAX_FILE_SIZE_MB} MB.
            </Content>
            <MultipleFileUpload
              dropzoneProps={{
                multiple: true,
                maxFiles: 2,
                accept: {
                  'application/json': ['.json'],
                  'application/gzip': ['.tar.gz', '.tgz'],
                  'application/x-tar': ['.tar'],
                  'application/x-gtar': ['.tar.gz'],
                },
                onDropAccepted: onFilesAccepted,
              }}
            >
              <MultipleFileUploadMain
                titleIcon={<UploadIcon />}
                titleText='Drag and drop findings JSON and optional POC archive'
                titleTextSeparator='or'
                browseButtonText='Choose files'
                infoText='.json required · .tar / .tar.gz / .tgz optional'
              />
            </MultipleFileUpload>

            {hasJsonSelection || pocFile ? (
              <HelperText className={spacing.mtMd} aria-label='Selected submission files'>
                {hasJsonSelection ? (
                  <HelperTextItem>
                    Findings JSON:{' '}
                    {jsonFilename ?? 'pasted contents'}{' '}
                    <Button variant='link' isInline onClick={onClearJson}>
                      Remove
                    </Button>
                  </HelperTextItem>
                ) : (
                  <HelperTextItem>Findings JSON: not selected (required)</HelperTextItem>
                )}
                {pocFile ? (
                  <HelperTextItem>
                    POC archive: {pocFile.name}{' '}
                    <Button variant='link' isInline onClick={onClearPoc}>
                      Remove
                    </Button>
                  </HelperTextItem>
                ) : (
                  <HelperTextItem>POC archive: none (optional)</HelperTextItem>
                )}
              </HelperText>
            ) : null}

            <ExpandableSection
              className={spacing.mtMd}
              toggleText='Paste JSON instead'
              isExpanded={isPasteExpanded}
              onToggle={(_event, expanded) => {
                setIsPasteExpanded(expanded);
                if (expanded) {
                  // Focus after ExpandableSection removes the hidden attribute.
                  window.requestAnimationFrame(() => {
                    document.getElementById('beacon-findings-json')?.focus();
                  });
                }
              }}
            >
              <Form>
                <FormGroup label='Findings JSON' fieldId='beacon-findings-json'>
                  <HelperText className={spacing.mbSm}>
                    <HelperTextItem>
                      Empty box — paste or type JSON here.{' '}
                      <Button
                        variant='link'
                        isInline
                        onClick={() => onJsonTextChange(SAMPLE_JSON)}
                      >
                        Insert sample
                      </Button>
                    </HelperTextItem>
                  </HelperText>
                  <TextArea
                    id='beacon-findings-json'
                    aria-label='Vulnerability findings JSON'
                    value={jsonText}
                    onChange={(_event, value) => onJsonTextChange(value)}
                    rows={12}
                    resizeOrientation='vertical'
                    placeholder='Paste vulnerability findings JSON…'
                  />
                </FormGroup>
              </Form>
            </ExpandableSection>
          </FlexItem>

          {showStructuralErrors ? (
            <FlexItem>
              <Alert
                variant='danger'
                title='Structural validation failed'
                actionLinks={
                  <Button variant='link' isInline onClick={onRetry}>
                    Edit and resubmit
                  </Button>
                }
              >
                <Content component='p'>
                  Fix the issues below and submit again. These are format/contract errors, not
                  LW-STAM semantic review.
                </Content>
                <List>
                  {structuralErrors.map((error) => (
                    <ListItem key={`${error.path}-${error.message}`}>
                      <Content component='code'>{error.path}</Content>: {error.message}
                    </ListItem>
                  ))}
                </List>
              </Alert>
            </FlexItem>
          ) : null}

          {step === 'error' && processError ? (
            <FlexItem>
              <Alert
                variant='danger'
                title='Could not accept submission'
                actionLinks={
                  <Button variant='link' isInline onClick={onRetry}>
                    Try again
                  </Button>
                }
              >
                {processError}
              </Alert>
            </FlexItem>
          ) : null}

          <FlexItem>
            <Flex gap={{ default: 'gapMd' }}>
              <FlexItem>
                <Button
                  variant='primary'
                  onClick={onSubmit}
                  isDisabled={!jsonText.trim()}
                  ouiaId='lightwell-beacon-submit'
                >
                  Submit for structural validation
                </Button>
              </FlexItem>
              {onCancel ? (
                <FlexItem>
                  <Button
                    variant='secondary'
                    onClick={onCancel}
                    ouiaId='lightwell-beacon-cancel-intake'
                  >
                    Cancel
                  </Button>
                </FlexItem>
              ) : null}
            </Flex>
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default BeaconUploadCard;
