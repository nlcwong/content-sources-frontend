import MatchSummaryStats from '../../Coverage/components/MatchSummaryStats';
import type { CveFixesBySeverity } from '../../mockRecentCveFixes';
import InsightsPanelTitle from './InsightsPanelTitle';

type RecentCveFixesPanelProps = {
  cveFixesBySeverity: CveFixesBySeverity;
};

const RecentCveFixesPanel = ({ cveFixesBySeverity }: RecentCveFixesPanelProps) => (
  <>
    <InsightsPanelTitle>CVEs fixed in the past 7 days</InsightsPanelTitle>
    <MatchSummaryStats
      items={[
        {
          count: cveFixesBySeverity.critical,
          label: 'Critical',
          tooltip: 'Critical CVEs fixed in Lightwell releases in the past 7 days',
        },
        {
          count: cveFixesBySeverity.important,
          label: 'Important',
          tooltip: 'Important CVEs fixed in Lightwell releases in the past 7 days',
        },
        {
          count: cveFixesBySeverity.moderate,
          label: 'Moderate',
          tooltip: 'Moderate CVEs fixed in Lightwell releases in the past 7 days',
        },
      ]}
    />
  </>
);

export default RecentCveFixesPanel;
