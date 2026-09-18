import { useState } from 'react';
import {
  Button,
  Content,
  ContentVariants,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  Flex,
  FlexItem,
  PageSection,
  Title,
} from '@patternfly/react-core';
import { LockIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { useLightwellContentAck } from '../hooks/useLightwellContentAck';

export const LIGHTWELL_ACKNOWLEDGEMENT_STATEMENTS = [
  'The content available through Lightwell, including backported vulnerability remediations and pre-disclosed security findings, is non-public and confidential.',
  'Pre-disclosed remediations may describe vulnerabilities that have not yet been publicly announced. This information is under embargo until Red Hat or the relevant upstream project makes a coordinated public disclosure.',
  'I will not share, publish, or otherwise distribute this content outside my organization, and will not make it publicly available in any form.',
  'I will limit access to this content to personnel within my organization who have a legitimate need and who understand its confidential nature.',
  'I understand that unauthorized disclosure of this content may cause harm to Red Hat, upstream open source projects, and the security community.',
] as const;

type AcknowledgementPageProps = {
  onAcknowledged?: () => void;
};

const AcknowledgementPage = ({ onAcknowledged }: AcknowledgementPageProps) => {
  const { acknowledge, isAcknowledging } = useLightwellContentAck();
  const [hasDeclined, setHasDeclined] = useState(false);

  const handleAcknowledge = async () => {
    await acknowledge();
    onAcknowledged?.();
  };

  if (hasDeclined) {
    return (
      <PageSection>
        <EmptyState
          variant={EmptyStateVariant.full}
          headingLevel='h1'
          icon={LockIcon}
          titleText='Acknowledgement required'
        >
          <EmptyStateBody>
            You must acknowledge the Lightwell content terms to access Lightwell. Refresh this page
            if you want to review the acknowledgement again.
          </EmptyStateBody>
          <EmptyStateFooter>
            <Button
              variant='primary'
              onClick={() => setHasDeclined(false)}
              ouiaId='lightwell-ack-review-again'
            >
              Review acknowledgement
            </Button>
          </EmptyStateFooter>
        </EmptyState>
      </PageSection>
    );
  }

  return (
    <PageSection>
      <Flex
        direction={{ default: 'column' }}
        alignItems={{ default: 'alignItemsCenter' }}
        className={spacing.mxAuto}
        style={{ maxWidth: '40rem', width: '100%' }}
      >
        <FlexItem>
          <Title headingLevel='h1' size='2xl' id='lightwell-acknowledgement-title'>
            Lightwell Content Acknowledgment
          </Title>
        </FlexItem>
        <FlexItem className={spacing.mtLg} style={{ width: '100%' }}>
          <Content component={ContentVariants.p}>
            By accessing Red Hat Lightwell, I acknowledge that:
          </Content>
          <Content component={ContentVariants.ul} ouiaId='lightwell-acknowledgement-statements'>
            {LIGHTWELL_ACKNOWLEDGEMENT_STATEMENTS.map((statement) => (
              <Content component='li' key={statement}>
                {statement}
              </Content>
            ))}
          </Content>
        </FlexItem>
        <FlexItem className={spacing.mtXl} style={{ width: '100%' }}>
          <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
            <FlexItem>
              <Button
                isBlock
                variant='primary'
                size='lg'
                onClick={() => {
                  void handleAcknowledge();
                }}
                isLoading={isAcknowledging}
                isDisabled={isAcknowledging}
                ouiaId='lightwell-ack-accept'
              >
                Acknowledge
              </Button>
            </FlexItem>
            <FlexItem>
              <Button
                isBlock
                variant='secondary'
                size='lg'
                onClick={() => setHasDeclined(true)}
                isDisabled={isAcknowledging}
                ouiaId='lightwell-ack-decline'
              >
                Decline
              </Button>
            </FlexItem>
          </Flex>
        </FlexItem>
      </Flex>
    </PageSection>
  );
};

export default AcknowledgementPage;
