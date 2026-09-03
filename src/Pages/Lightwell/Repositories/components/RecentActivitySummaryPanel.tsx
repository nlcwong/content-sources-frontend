import MatchSummaryStats from '../../Coverage/components/MatchSummaryStats';
import type { RecentActivitySummary } from '../../helpers';
import InsightsPanelTitle from './InsightsPanelTitle';

type RecentActivitySummaryPanelProps = {
  recentActivitySummary: RecentActivitySummary;
};

const RecentActivitySummaryPanel = ({
  recentActivitySummary,
}: RecentActivitySummaryPanelProps) => (
  <>
    <InsightsPanelTitle>Release activity in the past 7 days</InsightsPanelTitle>
    <MatchSummaryStats
      items={[
        {
          count: recentActivitySummary.repositories,
          label: 'Repositories',
          tooltip: 'Repositories with at least one package release in the past 7 days',
        },
        {
          count: recentActivitySummary.packages,
          label: 'Packages',
          tooltip: 'Packages with at least one release in the past 7 days',
        },
        {
          count: recentActivitySummary.releases,
          label: 'Releases',
          tooltip: 'Total package releases in the past 7 days',
        },
      ]}
    />
  </>
);

export default RecentActivitySummaryPanel;
