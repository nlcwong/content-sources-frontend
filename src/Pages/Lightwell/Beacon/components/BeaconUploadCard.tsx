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
import { PlusIcon, TrashIcon, UploadIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useId, useRef } from 'react';

import type { BeaconUploadCardProps } from '../hooks/useBeaconUpload';
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
  onCancel,
}: BeaconUploadCardProps) => {
  const reproducerInputRef = useRef<HTMLInputElement>(null);
  const reproducerInputId = useId();
  const activePendingIdRef = useRef<string | null>(null);
  const showSelectionPanel = pendingFiles.length > 0 && step !== 'error';
  const pending = pendingFiles[0];
  const showStructuralErrors = step === 'error' && structuralErrors.length > 0;
  const showProcessError = step === 'error' && Boolean(processError);

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

  const errorAlerts = (
    <>
      {showStructuralErrors ? (
        <FlexItem>
          <Alert variant='danger' title='Structural validation failed'>
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

      {showProcessError ? (
        <FlexItem>
          <Alert variant='danger' title='Could not accept submission'>
            {processError}
          </Alert>
        </FlexItem>
      ) : null}
    </>
  );

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
                  Select vulnerability report to upload
                </Title>
              </FlexItem>
              <FlexItem>
                <SubmissionInstructions />
              </FlexItem>
            </Flex>
          </FlexItem>

          {step === 'error' ? errorAlerts : null}

          <FlexItem>
            {!showSelectionPanel ? (
              <MultipleFileUpload
                dropzoneProps={{
                  multiple: false,
                  accept: {
                    'application/json': ['.json'],
                  },
                  onDropAccepted: onFilesAccepted,
                }}
              >
                <MultipleFileUploadMain
                  titleIcon={<UploadIcon />}
                  titleText='Drag and drop findings JSON file'
                  titleTextSeparator='or'
                  browseButtonText='Choose file'
                  infoText='.json required · attach reproducers after selection'
                />
              </MultipleFileUpload>
            ) : pending ? (
              <>
                <input
                  id={reproducerInputId}
                  ref={reproducerInputRef}
                  type='file'
                  multiple
                  hidden
                  onChange={(event) => {
                    const selected = event.target.files ? Array.from(event.target.files) : [];
                    const pendingId = activePendingIdRef.current;
                    if (pendingId) {
                      void onReproducerSelected(pendingId, selected);
                    }
                    activePendingIdRef.current = null;
                    event.target.value = '';
                  }}
                />
                <div aria-label='Selected submission files'>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <Content component='code'>{pending.filename}</Content>
                    <Button
                      variant='plain'
                      aria-label={`Remove ${pending.filename}`}
                      onClick={() => onRemovePendingFile(pending.id)}
                      ouiaId={`lightwell-beacon-remove-json-${pending.id}`}
                    >
                      <TrashIcon />
                    </Button>
                  </div>

                  {pending.reproducers.length === 0 ? (
                    <Button
                      variant='link'
                      icon={<PlusIcon />}
                      onClick={() => openReproducerPicker(pending.id)}
                      ouiaId={`lightwell-beacon-upload-reproducer-${pending.id}`}
                    >
                      Upload reproducer file
                    </Button>
                  ) : (
                    <div className={spacing.plLg}>
                      <Content component='small' className={spacing.mbSm}>
                        <strong>{`Reproducers (${pending.reproducers.length})`}</strong>
                      </Content>
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
                      <Button
                        variant='link'
                        icon={<PlusIcon />}
                        onClick={() => openReproducerPicker(pending.id)}
                        ouiaId={`lightwell-beacon-upload-reproducer-${pending.id}`}
                      >
                        Upload reproducer file
                      </Button>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </FlexItem>

          {step !== 'error' ? errorAlerts : null}

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
