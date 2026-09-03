import { Grid, GridItem, Title } from '@patternfly/react-core';

import type { TopPackagesBySecurityLevel } from '../../helpers';
import InsightsPanelTitle from './InsightsPanelTitle';
import RecentPackagesTable from './RecentPackagesTable';

type TopRecentPackagesBySecurityLevelPanelProps = {
  packagesBySecurityLevel: TopPackagesBySecurityLevel;
};

const SECURITY_LEVEL_SECTIONS = [
  { key: 'validated', label: 'Validated' },
  { key: 'remediated', label: 'Remediated' },
  { key: 'predisclosure', label: 'Predisclosure' },
] as const;

const TopRecentPackagesBySecurityLevelPanel = ({
  packagesBySecurityLevel,
}: TopRecentPackagesBySecurityLevelPanelProps) => (
  <>
    <InsightsPanelTitle>
      Top packages released in the past 7 days by repository type
    </InsightsPanelTitle>
    <Grid hasGutter>
      {SECURITY_LEVEL_SECTIONS.map(({ key, label }) => (
        <GridItem key={key} span={12} xl={4}>
          <Title headingLevel='h4' size='md'>
            {label}
          </Title>
          <div style={{ minWidth: 0, overflowX: 'auto' }}>
            <RecentPackagesTable
              packages={packagesBySecurityLevel[key]}
              ariaLabel={`Top packages released in the past 7 days from ${label.toLowerCase()} repositories`}
              releasesColumnLabel='Releases'
            />
          </div>
        </GridItem>
      ))}
    </Grid>
  </>
);

export default TopRecentPackagesBySecurityLevelPanel;
