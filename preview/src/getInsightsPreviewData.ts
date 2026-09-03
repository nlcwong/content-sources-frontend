import { LIGHTWELL_DEMO_FEATURE_NAME, LIGHTWELL_INSIGHTS_DAYS } from 'Pages/Lightwell/constants';
import {
  buildRecentActivitySummary,
  getTopPackagesBySecurityLevel,
} from 'Pages/Lightwell/helpers';
import { getMockCrossRepoPackageReleaseStats } from 'Pages/Lightwell/mockPackages';
import { getDemoLightwellRepositoryList } from 'Pages/Lightwell/mockRepositories';
import { getMockCveFixesBySeverityInPastDays } from 'Pages/Lightwell/mockRecentCveFixes';

const RECENT_INSIGHTS_REPO_LIMIT = 100;

export const getInsightsPreviewData = () => {
  const repositories = getDemoLightwellRepositoryList(1, RECENT_INSIGHTS_REPO_LIMIT, {
    feature_name: LIGHTWELL_DEMO_FEATURE_NAME,
  }).data;

  const packageReleaseStats = getMockCrossRepoPackageReleaseStats(
    repositories,
    LIGHTWELL_INSIGHTS_DAYS,
  );

  return {
    recentActivitySummary: buildRecentActivitySummary(packageReleaseStats),
    topRecentPackagesBySecurityLevel: getTopPackagesBySecurityLevel(packageReleaseStats),
    cveFixesBySeverity: getMockCveFixesBySeverityInPastDays(LIGHTWELL_INSIGHTS_DAYS),
  };
};
