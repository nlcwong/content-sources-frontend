import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Banner,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  Page,
  PageSection,
  Title,
} from '@patternfly/react-core';
import { CheckCircleIcon, InfoCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { MemoryRouter } from 'react-router-dom';

import AcknowledgementPage from 'Pages/Lightwell/Acknowledgement/AcknowledgementPage';
import { LIGHTWELL_CONTENT_ACK_STORAGE_KEY } from 'Pages/Lightwell/constants';
import {
  LightwellContentAckProvider,
  useLightwellContentAck,
} from 'Pages/Lightwell/hooks/useLightwellContentAck';

const PreviewShell = () => {
  const { hasAcknowledged } = useLightwellContentAck();

  const resetPreview = () => {
    localStorage.removeItem(LIGHTWELL_CONTENT_ACK_STORAGE_KEY);
    window.location.reload();
  };

  if (!hasAcknowledged) {
    return <AcknowledgementPage />;
  }

  return (
    <PageSection>
      <EmptyState
        variant={EmptyStateVariant.full}
        headingLevel='h1'
        icon={CheckCircleIcon}
        titleText='Acknowledgement recorded'
      >
        <EmptyStateBody>
          In production, the user would now continue into Lightwell repositories and related pages.
          This preview stops here so you can review the gate alone.
        </EmptyStateBody>
        <EmptyStateFooter>
          <Button variant='secondary' onClick={resetPreview} ouiaId='lightwell-ack-preview-reset'>
            Reset acknowledgement preview
          </Button>
        </EmptyStateFooter>
      </EmptyState>
    </PageSection>
  );
};

const App = () => {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* /demo forces localStorage persistence (no UserPreferences API). */}
      <MemoryRouter initialEntries={['/demo']}>
        <Banner status='info' screenReaderText='Wireframe notice'>
          <InfoCircleIcon /> Wireframe preview of the Lightwell first-access acknowledgement gate
          (LWLP-1146). Not production.
        </Banner>
        <Page>
          <PageSection isWidthLimited>
            <Title headingLevel='h2' size='md' style={{ marginBottom: '1rem' }}>
              First-access acknowledgement preview
            </Title>
          </PageSection>
          <LightwellContentAckProvider>
            <PreviewShell />
          </LightwellContentAckProvider>
        </Page>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

export default App;
