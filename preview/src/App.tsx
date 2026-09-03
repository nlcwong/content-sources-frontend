import { Page, PageSection, Title } from '@patternfly/react-core';

import LightwellWireframeBanner from 'Pages/Lightwell/components/LightwellWireframeBanner';
import RepositoryInsightsDeck from 'Pages/Lightwell/Repositories/components/RepositoryInsightsDeck';

import { getInsightsPreviewData } from './getInsightsPreviewData';

const insights = getInsightsPreviewData();

const App = () => (
  <>
    <LightwellWireframeBanner />
    <Page>
      <PageSection>
        <Title headingLevel='h1' size='2xl'>
          Lightwell repository insights
        </Title>
        <p style={{ marginBottom: '1.5rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
          Standalone preview of the Repository insights deck with demo mock data.
        </p>
        <RepositoryInsightsDeck {...insights} />
      </PageSection>
    </Page>
  </>
);

export default App;
