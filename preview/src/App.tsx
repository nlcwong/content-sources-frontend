import { useState } from 'react';
import {
  Banner,
  Button,
  Flex,
  FlexItem,
  Page,
  PageSection,
  Title,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Beacon, { type BeaconAudience } from 'Pages/Lightwell/Beacon/Beacon';

const PreviewBanner = () => (
  <Banner status='info' screenReaderText='Wireframe notice'>
    <InfoCircleIcon /> Phase 1 Beacon intake wireframe on the real Beacon page (mock data). Use the
    Customer / STAM toggle on Beacon. No VPN, hosts file, or fec required.
  </Banner>
);

const TopNav = () => {
  const { pathname } = useLocation();
  const items = [
    { to: '/', label: 'Repositories', match: (p: string) => p === '/' },
    { to: '/beacon', label: 'Beacon', match: (p: string) => p.includes('/beacon') },
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
      Use the top nav to open <strong>Beacon</strong>, then switch between{' '}
      <strong>Customer</strong> and <strong>STAM</strong> with the persona toggle.
    </p>
  </PageSection>
);

const BeaconPreviewPage = () => {
  const [audience, setAudience] = useState<BeaconAudience>('stam');

  return (
    <>
      <PageSection
        hasBodyWrapper={false}
        className={`${spacing.pb_0} ${spacing.pxLg}`}
        aria-label='Beacon persona toggle'
      >
        <ToggleGroup aria-label='Beacon persona'>
          <ToggleGroupItem
            text='STAM'
            isSelected={audience === 'stam'}
            onChange={() => setAudience('stam')}
            buttonId='beacon-persona-stam'
          />
          <ToggleGroupItem
            text='Customer'
            isSelected={audience === 'customer'}
            onChange={() => setAudience('customer')}
            buttonId='beacon-persona-customer'
          />
        </ToggleGroup>
      </PageSection>
      <Beacon audience={audience} />
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
        <Route path='/beacon' element={<BeaconPreviewPage />} />
        <Route path='/beacon/upload' element={<Navigate to='/beacon' replace />} />
        <Route path='/beacon/incoming' element={<Navigate to='/beacon' replace />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </Page>
  </>
);

export default App;
