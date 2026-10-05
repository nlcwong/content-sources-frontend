import { Banner, Page, PageSection, Title } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { Navigate, Route, Routes } from 'react-router-dom';

import Beacon from 'Pages/Lightwell/Beacon/Beacon';

const PreviewBanner = () => (
  <Banner status='info' screenReaderText='Preview notice'>
    <InfoCircleIcon /> Beacon closed-resolutions preview (LWLP-1244) with mock data. No VPN or fec
    required.
  </Banner>
);

const Home = () => (
  <PageSection>
    <Title headingLevel='h1'>Lightwell preview</Title>
    <p className={spacing.mtMd}>
      Open <a href='#/beacon'>Beacon</a> to review Status Summary closed resolutions and reasons.
    </p>
  </PageSection>
);

const App = () => (
  <>
    <PreviewBanner />
    <Page sidebar={null}>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/beacon' element={<Beacon />} />
        <Route path='*' element={<Navigate to='/beacon' replace />} />
      </Routes>
    </Page>
  </>
);

export default App;
