import { useMemo } from 'react';
import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query';

import { ContentItem, getLightwellRepositoryPackages } from 'services/Content/ContentApi';
import { useContentListQuery } from 'services/Content/ContentQueries';
import {
  LIGHTWELL_DEMO_FEATURE_NAME,
  LIGHTWELL_FEATURE_NAME,
  LIGHTWELL_INSIGHTS_DAYS,
  LIGHTWELL_USE_MOCK,
} from '../../constants';
import {
  buildCrossRepoPackageReleaseStats,
  buildRecentActivitySummary,
  getTopPackagesBySecurityLevel,
  type RecentActivitySummary,
  type TopPackagesBySecurityLevel,
} from '../../helpers';
import { getMockCrossRepoPackageReleaseStats } from '../../mockPackages';
import {
  getDemoLightwellRepositoryList,
  getMockLightwellRepositoryList,
} from '../../mockRepositories';
import {
  getMockCveFixesBySeverityInPastDays,
  type CveFixesBySeverity,
} from '../../mockRecentCveFixes';

const RECENT_INSIGHTS_REPO_LIMIT = 100;
const RECENT_INSIGHTS_PACKAGES_LIMIT = 500;

type UseRepositoryInsightsDeckOptions = {
  isDemo: boolean;
};

const getAllRepositories = (isDemo: boolean): ContentItem[] => {
  const filters = {
    feature_name: isDemo ? LIGHTWELL_DEMO_FEATURE_NAME : LIGHTWELL_FEATURE_NAME,
  };

  return isDemo
    ? getDemoLightwellRepositoryList(1, RECENT_INSIGHTS_REPO_LIMIT, filters).data
    : getMockLightwellRepositoryList(1, RECENT_INSIGHTS_REPO_LIMIT, filters).data;
};

const emptyCveFixes: CveFixesBySeverity = {
  critical: 0,
  important: 0,
  moderate: 0,
};

export const useRepositoryInsightsDeck = ({ isDemo }: UseRepositoryInsightsDeckOptions) => {
  const useMock = LIGHTWELL_USE_MOCK;
  const filters = {
    feature_name: isDemo ? LIGHTWELL_DEMO_FEATURE_NAME : LIGHTWELL_FEATURE_NAME,
  };

  const mockRepositoriesQuery = useQuery({
    queryKey: ['lightwell-insights-deck-repositories-mock', isDemo],
    queryFn: () => getAllRepositories(isDemo),
    enabled: useMock,
    staleTime: 60000,
  });

  const apiRepositoriesQuery = useContentListQuery(
    1,
    RECENT_INSIGHTS_REPO_LIMIT,
    filters,
    '',
    [],
    !useMock,
  );

  const repositories = useMock
    ? (mockRepositoriesQuery.data ?? [])
    : (apiRepositoriesQuery.data?.data ?? []);

  const packageQueries = useQueries({
    queries: repositories.map((repo) => ({
      queryKey: ['lightwell-insights-deck-packages', repo.uuid],
      queryFn: async () => {
        const response = await getLightwellRepositoryPackages(
          repo.uuid,
          1,
          RECENT_INSIGHTS_PACKAGES_LIMIT,
        );
        return response.results;
      },
      enabled: !useMock && !!repo.uuid && apiRepositoriesQuery.isSuccess,
      placeholderData: keepPreviousData,
      staleTime: 60000,
    })),
  });

  const packageReleaseStats = useMemo(() => {
    if (useMock && mockRepositoriesQuery.isSuccess) {
      return getMockCrossRepoPackageReleaseStats(repositories, LIGHTWELL_INSIGHTS_DAYS);
    }

    if (useMock) {
      return [];
    }

    const packagesByRepoUuid = Object.fromEntries(
      repositories.map((repo, index) => [repo.uuid, packageQueries[index]?.data ?? []]),
    );

    return buildCrossRepoPackageReleaseStats(
      repositories,
      packagesByRepoUuid,
      LIGHTWELL_INSIGHTS_DAYS,
    );
  }, [useMock, mockRepositoriesQuery.isSuccess, repositories, packageQueries]);

  const topRecentPackagesBySecurityLevel = useMemo(
    (): TopPackagesBySecurityLevel => getTopPackagesBySecurityLevel(packageReleaseStats),
    [packageReleaseStats],
  );

  const recentActivitySummary = useMemo(
    () => buildRecentActivitySummary(packageReleaseStats),
    [packageReleaseStats],
  );

  const cveFixesBySeverity = useMock
    ? getMockCveFixesBySeverityInPastDays(LIGHTWELL_INSIGHTS_DAYS)
    : emptyCveFixes;

  const isLoading = useMock
    ? mockRepositoriesQuery.isLoading
    : apiRepositoriesQuery.isLoading || packageQueries.some((query) => query.isLoading);

  const isError = useMock
    ? mockRepositoriesQuery.isError
    : apiRepositoriesQuery.isError || packageQueries.some((query) => query.isError);

  return {
    recentActivitySummary,
    topRecentPackagesBySecurityLevel,
    cveFixesBySeverity,
    isLoading,
    isError,
  };
};
