import { useEffect, useState } from 'react';
import {
  Alert,
  AlertActionCloseButton,
  Banner,
  Button,
  Content,
  Flex,
  FlexItem,
  Page,
  PageSection,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { InfoCircleIcon, PlusIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import AccessBoundaryNote from 'Pages/Lightwell/Beacon/components/AccessBoundaryNote';
import BeaconUploadCard from 'Pages/Lightwell/Beacon/components/BeaconUploadCard';
import MySubmissionsTable from 'Pages/Lightwell/Beacon/components/MySubmissionsTable';
import { useBeaconUpload } from 'Pages/Lightwell/Beacon/hooks/useBeaconUpload';
import Beacon from 'Pages/Lightwell/Beacon/Beacon';
import LightwellPageHeader from 'Pages/Lightwell/components/LightwellPageHeader';

const PreviewBanner = () => (
  <Banner status='info' screenReaderText='Wireframe notice'>
    <InfoCircleIcon /> Phase 1 Beacon intake wireframe on the real Beacon page (mock data). No VPN,
    hosts file, or fec required.
  </Banner>
);

const TopNav = () => {
  const { pathname } = useLocation();
  const items = [
    { to: '/', label: 'Repositories', match: (p: string) => p === '/' },
    { to: '/beacon', label: 'Beacon', match: (p: string) => p === '/beacon' },
    {
      to: '/beacon/upload',
      label: 'Beacon Intake',
      match: (p: string) => p.includes('/upload'),
    },
  ];

  return (
    <nav aria-label='Lightwell preview' className={`${spacing.pxLg} ${spacing.pySm}`}>
      <Flex gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <FlexItem key={item.to}>
              <Button
                component={Link}
                to={item.to}
                variant={active ? 'primary' : 'link'}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Button>
            </FlexItem>
          );
        })}
      </Flex>
    </nav>
  );
};

const RepositoriesPlaceholder = () => (
  <PageSection>
    <Title headingLevel='h1'>Repositories (placeholder)</Title>
    <p className={spacing.mtMd}>
      Use the top nav to open <strong>Beacon</strong> (STAM incoming uploads) or{' '}
      <strong>Beacon Intake</strong> (customer submissions).
    </p>
  </PageSection>
);

const UploadPage = () => {
  const { isReceived, uploadProps, startOver, submissionIds, findingCount } = useBeaconUpload();
  const [isComposing, setIsComposing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<{
    submissionIds: string[];
    findingCount: number;
  } | null>(null);

  useEffect(() => {
    if (!isReceived || !submissionIds?.length) {
      return;
    }
    setSuccessReceipt({
      submissionIds,
      findingCount: findingCount ?? 0,
    });
    setIsComposing(false);
    startOver();
  }, [isReceived, submissionIds, findingCount, startOver]);

  const cancelCompose = () => {
    startOver();
    setIsComposing(false);
  };

  return (
    <>
      <PageSection
        aria-label='Beacon Intake access boundary'
        hasBodyWrapper={false}
        className={`${spacing.pb_0} ${spacing.pxLg}`}
      >
        <AccessBoundaryNote audience='customer' />
      </PageSection>
      <LightwellPageHeader
        title='Beacon Intake'
        description='Submit vulnerability findings using the shared JSON / OpenAPI intake contract—without emailing files to your STAM.'
        {...(!isComposing && {
          actions: (
            <Button
              variant='primary'
              icon={<PlusIcon />}
              onClick={() => {
                setSuccessReceipt(null);
                startOver();
                setIsComposing(true);
              }}
            >
              Submit Intake
            </Button>
          ),
        })}
      />
      <PageSection hasBodyWrapper={false} className={`${spacing.pxLg} ${spacing.pbLg}`}>
        <Stack hasGutter>
          {isComposing ? (
            <StackItem>
              <BeaconUploadCard {...uploadProps} onCancel={cancelCompose} />
            </StackItem>
          ) : null}
          {successReceipt ? (
            <StackItem>
              <Alert
                variant='success'
                isInline
                title={
                  successReceipt.submissionIds.length === 1
                    ? 'Submission received'
                    : 'Submissions received'
                }
                actionClose={
                  <AlertActionCloseButton
                    title='Close success alert'
                    onClose={() => setSuccessReceipt(null)}
                  />
                }
              >
                <Content component='p'>
                  Created {successReceipt.submissionIds.length} submission
                  {successReceipt.submissionIds.length === 1 ? '' : 's'} (
                  {successReceipt.submissionIds.map((id, index) => (
                    <span key={id}>
                      {index > 0 ? ', ' : ''}
                      <Content component='code'>{id}</Content>
                    </span>
                  ))}
                  ). {successReceipt.findingCount} finding
                  {successReceipt.findingCount === 1 ? '' : 's'} passed structural checks and{' '}
                  {successReceipt.findingCount === 1 ? 'is' : 'are'} now{' '}
                  <strong>Submitted, waiting for validation</strong>. This does{' '}
                  <strong>not</strong> mean LW-STAM review is complete or that the submissions are
                  accepted.
                </Content>
              </Alert>
            </StackItem>
          ) : null}
          <StackItem>
            <MySubmissionsTable />
          </StackItem>
        </Stack>
      </PageSection>
    </>
  );
};

const App = () => (
  <>
    <PreviewBanner />
    <Page sidebar={null}>
      <TopNav />
      <Routes>
        <Route path='/' element={<RepositoriesPlaceholder />} />
        <Route path='/beacon' element={<Beacon />} />
        <Route path='/beacon/upload' element={<UploadPage />} />
        <Route path='/beacon/incoming' element={<Navigate to='/beacon' replace />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </Page>
  </>
);

export default App;
