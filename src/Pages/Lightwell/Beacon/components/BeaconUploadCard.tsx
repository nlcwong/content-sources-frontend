import {
  Alert,
  Button,
  Card,
  CardBody,
  Content,
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
  onJsonFileAccepted,
  onPocFileAccepted,
  onClearPoc,
  onSubmit,
  onRetry,
  onStartOver,
}: BeaconUploadCardProps) => {
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
        <SubmissionInstructions />
        <Flex direction={{ default: 'column' }} gap={{ default: 'gapLg' }}>
          <FlexItem>
            <Title headingLevel='h3' size='md'>
              Vulnerability findings (JSON)
            </Title>
            <Content component='small' className={spacing.mbSm}>
              Paste JSON or upload a <Content component='code'>.json</Content> file. Maximum size:{' '}
              {BEACON_UPLOAD_MAX_FILE_SIZE_MB} MB.
            </Content>
            <Form>
              <FormGroup label='Findings JSON' fieldId='beacon-findings-json'>
                <TextArea
                  id='beacon-findings-json'
                  aria-label='Vulnerability findings JSON'
                  value={jsonText}
                  onChange={(_event, value) => onJsonTextChange(value)}
                  rows={12}
                  resizeOrientation='vertical'
                  placeholder={SAMPLE_JSON}
                />
              </FormGroup>
            </Form>
            {jsonFilename ? (
              <Content component='small' className={spacing.mtSm}>
                Loaded from file: {jsonFilename}
              </Content>
            ) : null}
            <div className={spacing.mtMd}>
              <MultipleFileUpload
                dropzoneProps={{
                  multiple: false,
                  maxFiles: 1,
                  accept: { 'application/json': ['.json'] },
                  onDropAccepted: onJsonFileAccepted,
                }}
              >
                <MultipleFileUploadMain
                  titleIcon={<UploadIcon />}
                  titleText='Or drag and drop a .json file'
                  titleTextSeparator='or'
                  browseButtonText='Choose JSON file'
                />
              </MultipleFileUpload>
            </div>
          </FlexItem>

          <FlexItem>
            <Title headingLevel='h3' size='md'>
              Reproducer package (optional)
            </Title>
            <Content component='small' className={spacing.mbSm}>
              One archive named like <Content component='code'>POC-Reports_YYYY-MM-DD.tar.gz</Content>
              . Name each file inside for its vulnerability_id.
            </Content>
            {pocFile ? (
              <HelperText>
                <HelperTextItem>
                  Attached: {pocFile.name}{' '}
                  <Button variant='link' isInline onClick={onClearPoc}>
                    Remove
                  </Button>
                </HelperTextItem>
              </HelperText>
            ) : (
              <MultipleFileUpload
                dropzoneProps={{
                  multiple: false,
                  maxFiles: 1,
                  onDropAccepted: onPocFileAccepted,
                }}
              >
                <MultipleFileUploadMain
                  titleIcon={<UploadIcon />}
                  titleText='Drag and drop a POC archive'
                  titleTextSeparator='or'
                  browseButtonText='Choose archive'
                  infoText='.tar, .tar.gz, or .tgz'
                />
              </MultipleFileUpload>
            )}
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
            <Button
              variant='primary'
              onClick={onSubmit}
              isDisabled={!jsonText.trim()}
              ouiaId='lightwell-beacon-submit'
            >
              Submit for structural validation
            </Button>
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default BeaconUploadCard;
