import {
  Alert,
  Button,
  Card,
  CardBody,
  Content,
  Flex,
  FlexItem,
  List,
  ListItem,
  MultipleFileUpload,
  MultipleFileUploadMain,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { TrashIcon, UploadIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useId, useRef } from 'react';

import type { BeaconUploadCardProps } from '../hooks/useBeaconUpload';
import { BEACON_UPLOAD_MAX_FILE_SIZE_MB } from '../uploadTypes';
import SubmissionInstructions from './SubmissionInstructions';

const BeaconUploadCard = ({
  step,
  pendingFiles,
  structuralErrors,
  processError,
  onFilesAccepted,
  onReproducerSelected,
  onRemovePendingFile,
  onRemoveReproducer,
  onSubmit,
  onRetry,
  onCancel,
}: BeaconUploadCardProps) => {
  const reproducerInputRef = useRef<HTMLInputElement>(null);
  const reproducerInputId = useId();
  const activePendingIdRef = useRef<string | null>(null);
  const showSelectionPanel = pendingFiles.length > 0;

  const openReproducerPicker = (pendingId: string) => {
    activePendingIdRef.current = pendingId;
    reproducerInputRef.current?.click();
  };

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
                Client-side structural checks run for each findings JSON before your STAM reviews
                the submissions. Semantic review still happens with your LW-STAM.
              </Content>
            </FlexItem>
          </Flex>
        </CardBody>
      </Card>
    );
  }

  if (step === 'received') {
    return null;
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
              Drop or choose one or more vulnerability findings{' '}
              <Content component='code'>.json</Content> files. For each selected JSON, attach
              optional reproducers (any file type, multiple allowed). Maximum size per file:{' '}
              {BEACON_UPLOAD_MAX_FILE_SIZE_MB} MB. Each findings JSON becomes its own submission.
            </Content>

            <Flex
              gap={{ default: 'gapLg' }}
              alignItems={{ default: 'alignItemsFlexStart' }}
              flexWrap={{ default: 'wrap' }}
            >
              <FlexItem flex={{ default: 'flex_1' }} style={{ minWidth: '16rem' }}>
                <MultipleFileUpload
                  dropzoneProps={{
                    multiple: true,
                    accept: {
                      'application/json': ['.json'],
                    },
                    onDropAccepted: onFilesAccepted,
                  }}
                >
                  <MultipleFileUploadMain
                    titleIcon={<UploadIcon />}
                    titleText='Drag and drop findings JSON files'
                    titleTextSeparator='or'
                    browseButtonText='Choose files'
                    infoText='.json required · attach reproducers per file after selection'
                  />
                </MultipleFileUpload>
              </FlexItem>

              {showSelectionPanel ? (
                <FlexItem flex={{ default: 'flex_1' }} style={{ minWidth: '16rem' }}>
                  <input
                    id={reproducerInputId}
                    ref={reproducerInputRef}
                    type='file'
                    multiple
                    hidden
                    onChange={(event) => {
                      const selected = event.target.files
                        ? Array.from(event.target.files)
                        : [];
                      const pendingId = activePendingIdRef.current;
                      if (pendingId) {
                        void onReproducerSelected(pendingId, selected);
                      }
                      activePendingIdRef.current = null;
                      event.target.value = '';
                    }}
                  />
                  <div aria-label='Selected submission files'>
                    <Title headingLevel='h4' size='md' className={spacing.mbSm}>
                      Selected files ({pendingFiles.length})
                    </Title>
                    <ul
                      style={{ listStyle: 'none', margin: 0, padding: 0 }}
                      aria-label='Pending findings JSON files'
                    >
                      {pendingFiles.map((pending) => (
                        <li
                          key={pending.id}
                          style={{
                            marginBottom: '1rem',
                            paddingBottom: '0.75rem',
                            borderBottom: '1px solid var(--pf-t--global--border--color--default)',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginBottom: '0.5rem',
                            }}
                          >
                            <Content component='p' style={{ marginBottom: 0 }}>
                              Findings JSON:{' '}
                              <Content component='code'>{pending.filename}</Content>
                            </Content>
                            <Button
                              variant='link'
                              isInline
                              onClick={() => openReproducerPicker(pending.id)}
                              ouiaId={`lightwell-beacon-upload-reproducer-${pending.id}`}
                            >
                              Upload reproducer file
                            </Button>
                            <Button
                              variant='plain'
                              aria-label={`Remove ${pending.filename}`}
                              onClick={() => onRemovePendingFile(pending.id)}
                              ouiaId={`lightwell-beacon-remove-json-${pending.id}`}
                            >
                              <TrashIcon />
                            </Button>
                          </div>

                          <div className={spacing.plLg}>
                            <Content component='small' className={spacing.mbSm}>
                              <strong>
                                {pending.reproducers.length > 0
                                  ? `Reproducers (${pending.reproducers.length})`
                                  : 'Reproducers'}
                              </strong>
                            </Content>
                            {pending.reproducers.length === 0 ? (
                              <Content component='small'>
                                None yet — use Upload reproducer file to attach one or more files
                                for <Content component='code'>{pending.filename}</Content>.
                              </Content>
                            ) : (
                              <ul
                                aria-label={`Reproducers for ${pending.filename}`}
                                style={{ listStyle: 'none', margin: 0, padding: 0 }}
                              >
                                {pending.reproducers.map((file) => (
                                  <li
                                    key={file.name}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      marginBottom: '0.35rem',
                                    }}
                                  >
                                    <Content component='small'>
                                      <Content component='code'>{file.name}</Content>
                                    </Content>
                                    <Button
                                      variant='plain'
                                      aria-label={`Remove reproducer ${file.name} from ${pending.filename}`}
                                      onClick={() => onRemoveReproducer(pending.id, file.name)}
                                      ouiaId={`lightwell-beacon-remove-poc-${pending.id}-${file.name}`}
                                    >
                                      <TrashIcon />
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </FlexItem>
              ) : null}
            </Flex>
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
                  LW-STAM semantic review. No submissions were created for this batch.
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
                  isDisabled={pendingFiles.length === 0}
                  ouiaId='lightwell-beacon-submit'
                >
                  Submit for structural validation by your STAM
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
