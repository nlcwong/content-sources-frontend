import {
  Banner,
  Button,
  Card,
  CardBody,
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

import BeaconUploadCard from 'Pages/Lightwell/Beacon/components/BeaconUploadCard';
import IncomingUploadsPanel from 'Pages/Lightwell/Beacon/components/IncomingUploadsPanel';
import MySubmissionsTable from 'Pages/Lightwell/Beacon/components/MySubmissionsTable';
import { useBeaconUpload } from 'Pages/Lightwell/Beacon/hooks/useBeaconUpload';
import LightwellPageHeader from 'Pages/Lightwell/components/LightwellPageHeader';

const PreviewBanner = () => (
  <Banner status='info' screenReaderText='Wireframe notice'>
    <InfoCircleIcon /> Wireframe preview of LWLP-1269 Beacon upload (unified A + C). No VPN, hosts
    file, or fec required.
  </Banner>
);

const TopNav = () => {
  const { pathname } = useLocation();
  const items = [
    { to: '/', label: 'Repositories', match: (p: string) => p === '/' },
    {
      to: '/beacon',
      label: 'Beacon',
      match: (p: string) => p === '/beacon',
    },
    {
      to: '/beacon/upload',
      label: 'Upload to Beacon',
      match: (p: string) => p.includes('/upload'),
    },
    {
      to: '/beacon/incoming',
      label: 'Incoming uploads',
      match: (p: string) => p.includes('/incoming'),
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
      Use the top nav to open <strong>Upload to Beacon</strong> or <strong>Incoming uploads</strong>{' '}
      (STAM review).
    </p>
  </PageSection>
);

const BeaconPlaceholder = () => (
  <>
    <LightwellPageHeader
      title='Beacon'
      description='Understand the status of your Lightwell submissions'
    />
    <PageSection hasBodyWrapper={false} className={`${spacing.pxLg} ${spacing.pbLg}`}>
      <Card isGlass>
        <CardBody>
          Vulnerability table and filters are omitted in this wireframe. Upload via the top nav, then
          open <strong>Incoming uploads</strong> to review submissions as a STAM.
        </CardBody>
      </Card>
    </PageSection>
  </>
);

const UploadPage = () => {
  const { isComplete, uploadProps, startOver } = useBeaconUpload();

  return (
    <>
      <LightwellPageHeader
        title='Upload to Beacon'
        description='Securely submit vulnerability data for Lightwell Clearinghouse review without emailing files to your STAM.'
        {...(isComplete && {
          actions: (
            <Button variant='secondary' icon={<PlusIcon />} onClick={startOver}>
              Upload another file
            </Button>
          ),
        })}
      />
      <PageSection hasBodyWrapper={false} className={`${spacing.pxLg} ${spacing.pbLg}`}>
        <Stack hasGutter style={{ maxWidth: 1200 }}>
          <StackItem>
            <BeaconUploadCard {...uploadProps} />
          </StackItem>
          <StackItem>
            <MySubmissionsTable />
          </StackItem>
        </Stack>
      </PageSection>
    </>
  );
};

const IncomingUploadsPage = () => (
  <>
    <LightwellPageHeader
      title='Incoming uploads'
      description='Review customer vulnerability submissions awaiting Lightwell STAM intake.'
    />
    <PageSection hasBodyWrapper={false} className={`${spacing.pxLg} ${spacing.pbLg}`}>
      <Stack hasGutter style={{ maxWidth: 1200 }}>
        <StackItem>
          <IncomingUploadsPanel />
        </StackItem>
      </Stack>
    </PageSection>
  </>
);

const App = () => (
  <>
    <PreviewBanner />
    <Page>
      <TopNav />
      <Routes>
        <Route path='/' element={<RepositoriesPlaceholder />} />
        <Route path='/beacon' element={<BeaconPlaceholder />} />
        <Route path='/beacon/upload' element={<UploadPage />} />
        <Route path='/beacon/incoming' element={<IncomingUploadsPage />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </Page>
  </>
);

export default App;
