import {
  Alert,
  Button,
  Card,
  CardBody,
  Content,
  Flex,
  FlexItem,
  HelperText,
  HelperTextItem,
  MultipleFileUpload,
  MultipleFileUploadMain,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { CheckCircleIcon, UploadIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import type { BeaconUploadCardProps } from '../hooks/useBeaconUpload';
import { BEACON_UPLOAD_MAX_FILE_SIZE_MB } from '../uploadTypes';

const BeaconUploadCard = ({
  step,
  file,
  fileError,
  processError,
  onDropAccepted,
  onRetry,
}: BeaconUploadCardProps) => {
  if (step === 'uploading') {
    return (
      <Card isGlass>
        <CardBody className={spacing.p_2xl}>
          <Flex
            direction={{ default: 'column' }}
            gap={{ default: 'gapMd' }}
            alignItems={{ default: 'alignItemsCenter' }}
          >
            <FlexItem>
              <Spinner size='lg' aria-label='Uploading file' />
            </FlexItem>
            <FlexItem>
              <Title headingLevel='h3' size='md'>
                Uploading {file?.name ?? 'file'}…
              </Title>
            </FlexItem>
            <FlexItem>
              <Content component='small'>Submitting your vulnerability data for Beacon review.</Content>
            </FlexItem>
          </Flex>
        </CardBody>
      </Card>
    );
  }

  if (step === 'error') {
    return (
      <Card isGlass>
        <CardBody className={spacing.pXl}>
          <Alert
            variant='danger'
            title='Upload failed'
            actionLinks={
              <Button variant='link' isInline onClick={onRetry}>
                Try again
              </Button>
            }
          >
            {processError ?? 'An error occurred while uploading your file.'}
          </Alert>
        </CardBody>
      </Card>
    );
  }

  if (step === 'complete') {
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
                <strong>{file?.name}</strong> was submitted for Beacon review. A Lightwell STAM will
                process your vulnerability data.
              </Content>
            </FlexItem>
          </Flex>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card isGlass>
      <CardBody className={spacing.pXl}>
        <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
          <FlexItem>
            <Title headingLevel='h3' size='md'>
              Select your vulnerability data file
            </Title>
          </FlexItem>
          <FlexItem>
            <MultipleFileUpload dropzoneProps={{ multiple: false, maxFiles: 1, onDropAccepted }}>
              <MultipleFileUploadMain
                titleIcon={<UploadIcon />}
                titleText='Drag and drop a file here'
                titleTextSeparator='or'
                browseButtonText='Choose file'
                infoText={
                  <Content>
                    Accepted formats include CSV, package lists, SBOMs (CycloneDX, SPDX), plain text,
                    and other files your tooling produces.
                    <br />
                    Maximum size: {BEACON_UPLOAD_MAX_FILE_SIZE_MB} MB.
                  </Content>
                }
              />
            </MultipleFileUpload>
            {fileError ? (
              <HelperText>
                <HelperTextItem variant='error'>
                  {file?.name ? `${file.name}: ${fileError}` : fileError}
                </HelperTextItem>
              </HelperText>
            ) : null}
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default BeaconUploadCard;
