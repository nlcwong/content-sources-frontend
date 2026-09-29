import { useState } from 'react';
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
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { InfoCircleIcon, PlusIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import AccessBoundaryNote from 'Pages/Lightwell/Beacon/components/AccessBoundaryNote';
import BeaconUploadCard from 'Pages/Lightwell/Beacon/components/BeaconUploadCard';
import IncomingUploadsPanel from 'Pages/Lightwell/Beacon/components/IncomingUploadsPanel';
import MySubmissionsTable from 'Pages/Lightwell/Beacon/components/MySubmissionsTable';
import { useBeaconUpload } from 'Pages/Lightwell/Beacon/hooks/useBeaconUpload';
import LightwellPageHeader from 'Pages/Lightwell/components/LightwellPageHeader';

type PreviewRole = 'customer' | 'stam';

const PreviewBanner = () => (
  <Banner status='info' screenReaderText='Wireframe notice'>
    <InfoCircleIcon /> Phase 1 Beacon intake wireframe (JSON contract + STAM accept). Mocked only—no
    VPN, hosts file, or fec required.
  </Banner>
);

const RoleToggle = ({
  role,
  onChange,
}: {
  role: PreviewRole;
  onChange: (next: PreviewRole) => void;
}) => {
  const navigate = useNavigate();

  return (
    <div className={`${spacing.pxLg} ${spacing.pbSm}`}>
      <Flex
        gap={{ default: 'gapMd' }}
        alignItems={{ default: 'alignItemsCenter' }}
        flexWrap={{ default: 'wrap' }}
      >
        <FlexItem>
          <Title headingLevel='h2' size='md'>
            Preview as
          </Title>
        </FlexItem>
        <FlexItem>
          <ToggleGroup aria-label='Preview role'>
            <ToggleGroupItem
              text='Customer'
              isSelected={role === 'customer'}
              onChange={() => {
                onChange('customer');
                navigate('/beacon/upload');
              }}
            />
            <ToggleGroupItem
              text='STAM'
              isSelected={role === 'stam'}
              onChange={() => {
                onChange('stam');
                navigate('/beacon/incoming');
              }}
            />
          </ToggleGroup>
        </FlexItem>
      </Flex>
    </div>
  );
};

const TopNav = ({ role }: { role: PreviewRole }) => {
  const { pathname } = useLocation();
  const customerItems = [
    { to: '/', label: 'Repositories', match: (p: string) => p === '/' },
    { to: '/beacon', label: 'Beacon', match: (p: string) => p === '/beacon' },
    {
      to: '/beacon/upload',
      label: 'Beacon Intake',
      match: (p: string) => p.includes('/upload'),
    },
  ];
  const stamItems = [
    { to: '/beacon', label: 'Beacon', match: (p: string) => p === '/beacon' },
    {
      to: '/beacon/incoming',
      label: 'Incoming uploads',
      match: (p: string) => p.includes('/incoming'),
    },
  ];
  const items = role === 'customer' ? customerItems : stamItems;

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
      Use the top nav to open <strong>Beacon Intake</strong>. Switch Preview as to STAM for{' '}
      <strong>Incoming uploads</strong>.
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
          Vulnerability table and filters are omitted in this wireframe. Customers upload via{' '}
          <strong>Beacon Intake</strong>; STAMs review on <strong>Incoming uploads</strong>.
        </CardBody>
      </Card>
    </PageSection>
  </>
);

const UploadPage = () => {
  const { isReceived, uploadProps, startOver } = useBeaconUpload();
  const [isComposing, setIsComposing] = useState(false);

  const headerActions = !isComposing ? (
    <Button
      variant='primary'
      icon={<PlusIcon />}
      onClick={() => {
        startOver();
        setIsComposing(true);
      }}
    >
      Submit Intake
    </Button>
  ) : isReceived ? (
    <Button
      variant='secondary'
      icon={<PlusIcon />}
      onClick={() => {
        startOver();
        setIsComposing(true);
      }}
    >
      Submit another report
    </Button>
  ) : undefined;

  const cancelCompose = () => {
    startOver();
    setIsComposing(false);
  };

  return (
    <>
      <LightwellPageHeader
        title='Beacon Intake'
        description='Submit vulnerability findings using the shared JSON / OpenAPI intake contract—without emailing files to your STAM.'
        {...(headerActions ? { actions: headerActions } : {})}
      />
      <PageSection hasBodyWrapper={false} className={`${spacing.pxLg} ${spacing.pbLg}`}>
        <Stack hasGutter>
          {isComposing ? (
            <StackItem>
              <BeaconUploadCard
                {...uploadProps}
                {...(!isReceived ? { onCancel: cancelCompose } : {})}
              />
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

const IncomingUploadsPage = () => (
  <>
    <LightwellPageHeader
      title='Incoming uploads'
      description='Review Received customer vulnerability submissions. Accept for processing after semantic review—before JSM automation.'
    />
    <PageSection hasBodyWrapper={false} className={`${spacing.pxLg} ${spacing.pbLg}`}>
      <Stack hasGutter>
        <StackItem>
          <IncomingUploadsPanel />
        </StackItem>
      </Stack>
    </PageSection>
  </>
);

const App = () => {
  const [role, setRole] = useState<PreviewRole>('customer');

  return (
    <>
      <PreviewBanner />
      <Page sidebar={null}>
        <RoleToggle role={role} onChange={setRole} />
        <div className={`${spacing.pxLg} ${spacing.pbSm}`}>
          <AccessBoundaryNote audience={role === 'stam' ? 'stam' : 'customer'} />
        </div>
        <TopNav role={role} />
        <Routes>
          <Route path='/' element={<RepositoriesPlaceholder />} />
          <Route path='/beacon' element={<BeaconPlaceholder />} />
          <Route
            path='/beacon/upload'
            element={role === 'customer' ? <UploadPage /> : <Navigate to='/beacon/incoming' replace />}
          />
          <Route
            path='/beacon/incoming'
            element={role === 'stam' ? <IncomingUploadsPage /> : <Navigate to='/beacon/upload' replace />}
          />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </Page>
    </>
  );
};

export default App;
