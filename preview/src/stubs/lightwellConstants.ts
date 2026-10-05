/** Preview-only Lightwell constants — force Beacon mock data offline. */

export const LIGHTWELL_FEATURE_NAME =
  'lightwell-network,lightwell-clearinghouse,lightwell-research-institutions';
export const LIGHTWELL_DEMO_FEATURE_NAME = 'lightwell-network-demo';
export const LIGHTWELL_ROUTE = '/lightwell';
export const LIGHTWELL_ORIGIN = 'lightwell';
export const LIGHTWELL_USE_MOCK = true;
export const LIGHTWELL_LENS_USE_MOCK = true;
export const LIGHTWELL_BEACON_USE_MOCK = true;

export const lightwellReposPerPageKey = 'lightwellRepositoriesPerPage';
export const lightwellPkgsPerPageKey = 'lightwellPackagesPerPage';
export const lightwellCoveragePkgsPerPageKey = 'lightwellCoveragePackagesPerPage';

export const CONTENT_TYPE_PARAMETERS: Record<string, { ecosystem: string }> = {
  maven: { ecosystem: 'Java' },
  python: { ecosystem: 'Python' },
};

export const REPOSITORY_DESCRIPTIONS: Record<string, Record<string, string>> = {};
