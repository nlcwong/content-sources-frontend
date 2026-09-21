import {
  Banner,
  Button,
  Card,
  CardBody,
  CardTitle,
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
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import BeaconUploadCard from 'Pages/Lightwell/Beacon/components/BeaconUploadCard';
import IncomingUploadsPanel from 'Pages/Lightwell/Beacon/components/IncomingUploadsPanel';
import MySubmissionsTable from 'Pages/Lightwell/Beacon/components/MySubmissionsTable';
import { useBeaconUpload } from 'Pages/Lightwell/Beacon/hooks/useBeaconUpload';
import LightwellPageHeader from 'Pages/Lightwell/components/LightwellPageHeader';

const PreviewBanner = () => (
  <Banner status='info' screenReaderText='Wireframe notice'>
    <InfoCircleIcon /> Wireframe preview of LWLP-1269 Beacon upload prototypes. No VPN, hosts file,
    or fec required.
  </Banner>
);

const Home = () => (
  <PageSection>
    <Stack hasGutter style={{ maxWidth: 720 }}>
      <StackItem>
        <Title headingLevel='h1'>LWLP-1269 Beacon upload prototypes</Title>
      </StackItem>
      <StackItem>
        Pick a navigation model to compare. Both use the Lens-style upload layout with mock
        uploads.
      </StackItem>
      <StackItem>
        <Flex gap={{ default: 'gapMd' }} direction={{ default: 'column' }}>
          <FlexItem>
            <Card isClickable>
              <CardTitle>
                <Link to='/nav'>Prototype A — shared top nav</Link>
              </CardTitle>
              <CardBody>
                Upload-only page. Reach it from an in-app top nav that includes “Upload to Beacon”.
              </CardBody>
            </Card>
          </FlexItem>
          <FlexItem>
            <Card isClickable>
              <CardTitle>
                <Link to='/intake'>Prototype C — Beacon header + intake</Link>
              </CardTitle>
              <CardBody>
                Upload from a Beacon page header button, plus My submissions and a STAM incoming
                uploads panel.
              </CardBody>
            </Card>
          </FlexItem>
        </Flex>
      </StackItem>
      <StackItem>
        <Button component={Link} to='/nav' variant='primary'>
          Open Prototype A
        </Button>{' '}
        <Button component={Link} to='/intake' variant='secondary'>
          Open Prototype C
        </Button>
      </StackItem>
    </Stack>
  </PageSection>
);

const TopNav = () => {
  const { pathname } = useLocation();
  const items = [
    { to: '/nav', label: 'Repositories', match: (p: string) => p === '/nav' },
    { to: '/nav/upload', label: 'Upload to Beacon', match: (p: string) => p.includes('/upload') },
    { to: '/intake', label: 'Beacon (Proto C)', match: () => false },
    { to: '/', label: 'All prototypes', match: () => false },
  ];

  return (
    <nav aria-label='Lightwell preview' className={`${spacing.pxLg} ${spacing.pySm}`}>
      <Flex gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <FlexItem key={item.to + item.label}>
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

const UploadPage = ({ showSubmissions }: { showSubmissions: boolean }) => {
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
          {showSubmissions ? (
            <StackItem>
              <MySubmissionsTable />
            </StackItem>
          ) : null}
        </Stack>
      </PageSection>
    </>
  );
};

const PrototypeA = () => {
  const { pathname } = useLocation();
  const onUpload = pathname.includes('/upload');

  return (
    <>
      <TopNav />
      {onUpload ? (
        <UploadPage showSubmissions={false} />
      ) : (
        <PageSection>
          <Title headingLevel='h1'>Repositories (placeholder)</Title>
          <p className={spacing.mtMd}>
            Prototype A uses the shared top nav. Choose <strong>Upload to Beacon</strong> above to
            open the upload page.
          </p>
        </PageSection>
      )}
    </>
  );
};

const PrototypeCBeacon = () => {
  const navigate = useNavigate();

  return (
    <>
      <LightwellPageHeader
        title='Beacon'
        description='Understand the status of your Lightwell submissions'
        actions={
          <Button variant='primary' onClick={() => navigate('/intake/upload')}>
            Upload to Beacon
          </Button>
        }
      />
      <PageSection hasBodyWrapper={false} className={`${spacing.pxLg} ${spacing.pbLg}`}>
        <Stack hasGutter style={{ maxWidth: 1200 }}>
          <StackItem>
            <IncomingUploadsPanel />
          </StackItem>
          <StackItem>
            <Card isGlass>
              <CardBody>
                Vulnerability table and filters are omitted in this wireframe. Use{' '}
                <strong>Upload to Beacon</strong>, then return here to see incoming uploads.
              </CardBody>
            </Card>
          </StackItem>
          <StackItem>
            <Button component={Link} to='/' variant='link'>
              Back to prototype chooser
            </Button>
          </StackItem>
        </Stack>
      </PageSection>
    </>
  );
};

const PrototypeCUpload = () => (
  <>
    <div className={`${spacing.pxLg} ${spacing.pySm}`}>
      <Button component={Link} to='/intake' variant='link'>
        ← Back to Beacon
      </Button>
    </div>
    <UploadPage showSubmissions />
  </>
);

const App = () => (
  <>
    <PreviewBanner />
    <Page>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/nav' element={<PrototypeA />} />
        <Route path='/nav/upload' element={<PrototypeA />} />
        <Route path='/intake' element={<PrototypeCBeacon />} />
        <Route path='/intake/upload' element={<PrototypeCUpload />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </Page>
  </>
);

export default App;
