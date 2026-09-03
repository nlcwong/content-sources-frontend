import { useMemo } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@patternfly/react-core';
import { ButtonVariant } from '@patternfly/react-core';
import Deck, { DeckButton } from '@patternfly/react-component-groups/dist/dynamic/Deck';

import type { CveFixesBySeverity } from '../../mockRecentCveFixes';
import type { RecentActivitySummary, TopPackagesBySecurityLevel } from '../../helpers';
import RecentActivitySummaryPanel from './RecentActivitySummaryPanel';
import RecentCveFixesPanel from './RecentCveFixesPanel';
import TopRecentPackagesBySecurityLevelPanel from './TopRecentPackagesBySecurityLevelPanel';

type RepositoryInsightsDeckProps = {
  recentActivitySummary: RecentActivitySummary;
  topRecentPackagesBySecurityLevel: TopPackagesBySecurityLevel;
  cveFixesBySeverity: CveFixesBySeverity;
  isLoading?: boolean;
};

const RepositoryInsightsDeck = ({
  recentActivitySummary,
  topRecentPackagesBySecurityLevel,
  cveFixesBySeverity,
  isLoading = false,
}: RepositoryInsightsDeckProps) => {
  const pages = useMemo(
    () => [
      {
        content: (
          <RecentActivitySummaryPanel recentActivitySummary={recentActivitySummary} />
        ),
        buttons: [
          {
            children: 'Next',
            variant: ButtonVariant.primary,
            navigation: 'next',
          },
        ] as DeckButton[],
      },
      {
        content: (
          <TopRecentPackagesBySecurityLevelPanel
            packagesBySecurityLevel={topRecentPackagesBySecurityLevel}
          />
        ),
        buttons: [
          {
            children: 'Previous',
            variant: ButtonVariant.secondary,
            navigation: 'previous',
          },
          {
            children: 'Next',
            variant: ButtonVariant.primary,
            navigation: 'next',
          },
        ] as DeckButton[],
      },
      {
        content: <RecentCveFixesPanel cveFixesBySeverity={cveFixesBySeverity} />,
        buttons: [
          {
            children: 'Previous',
            variant: ButtonVariant.secondary,
            navigation: 'previous',
          },
        ] as DeckButton[],
      },
    ],
    [recentActivitySummary, topRecentPackagesBySecurityLevel, cveFixesBySeverity],
  );

  return (
    <Card isGlass ouiaId='lightwell-repository-insights-deck'>
      <CardHeader>
        <CardTitle>Repository insights</CardTitle>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <Skeleton height='200px' />
        ) : (
          <Deck
            ouiaId='lightwell-insights-deck'
            pages={pages}
            textAlign='left'
            ariaLabel='Repository insights statistics'
            getPageLabel={(current, total) => `Insight ${current} of ${total}`}
            contentFlexProps={{ style: { width: '100%' } }}
          />
        )}
      </CardBody>
    </Card>
  );
};

export default RepositoryInsightsDeck;
