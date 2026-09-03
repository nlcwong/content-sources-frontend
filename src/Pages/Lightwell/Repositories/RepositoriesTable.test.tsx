import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RepositoriesTable from './RepositoriesTable';
import { useContentListQuery } from 'services/Content/ContentQueries';
import {
  defaultLightwellContentItem,
  defaultPythonRemediatedContentItem,
  defaultPythonValidatedContentItem,
  ReactQueryTestWrapper,
} from 'testingHelpers';
import { ContentItem } from 'services/Content/ContentApi';
import { getSlugFromRepositoryName } from '../helpers';
import { useLightwellNotificationPrefs } from './hooks/useLightwellNotificationPrefs';
import { useLightwellNavigateTo } from '../../../Hooks/Lightwell/navigation/useLightwellNavigateTo';
import { useLightwellRepoNotifications } from './hooks/useLightwellRepoNotifications';
import { useRepositoryInsightsDeck } from './hooks/useRepositoryInsightsDeck';

jest.mock('services/Content/ContentQueries', () => ({
  useContentListQuery: jest.fn(),
  useLightwellRepositoryPackageCountsQuery: jest.fn(),
}));

jest.mock('./hooks/useRepositoryInsightsDeck', () => ({
  useRepositoryInsightsDeck: jest.fn(),
}));

const mockNavigateTo = jest.fn();

jest.mock('Hooks/Lightwell/navigation/useLightwellNavigateTo', () => ({
  useLightwellNavigateTo: jest.fn(),
}));

jest.mock('../constants', () => ({
  ...jest.requireActual('../constants'),
  LIGHTWELL_USE_MOCK: false,
}));

jest.mock('./hooks/useLightwellNotificationPrefs', () => ({
  useLightwellNotificationPrefs: jest.fn(),
}));

jest.mock('./hooks/useLightwellRepoNotifications', () => ({
  ...jest.requireActual('./hooks/useLightwellRepoNotifications'),
  useLightwellRepoNotifications: jest.fn(),
}));

const javaRemediatedContentItem: ContentItem = {
  ...defaultLightwellContentItem,
  name: 'lightwell/java/remediated',
  published_distribution_url: 'https://example.com/lightwell/java/remediated',
  uuid: '3875c35b-a67a-4ac2-a989-21139433c178',
  security_level: 'remediated',
  package_count: 11,
  build_count: 28,
  version_count: 28,
};

const javaPredisclosureContentItem: ContentItem = {
  ...defaultLightwellContentItem,
  name: 'lightwell/java/predisclosure',
  published_distribution_url: 'https://example.com/lightwell/java/predisclosure',
  uuid: '3875c35b-a67a-4ac2-a989-21139433c179',
  security_level: 'predisclosure',
  package_count: 8,
  build_count: 18,
  version_count: 18,
};

const emptyRecentActivitySummary = {
  repositories: 0,
  packages: 0,
  releases: 0,
};

const emptyTopRecentPackagesBySecurityLevel = {
  validated: [],
  remediated: [],
  predisclosure: [],
};

const renderRepositoriesTable = () =>
  render(
    <ReactQueryTestWrapper>
      <RepositoriesTable />
    </ReactQueryTestWrapper>,
  );

beforeEach(() => {
  (useLightwellNavigateTo as jest.Mock).mockReturnValue({
    navigateTo: mockNavigateTo,
  });
  (useLightwellNotificationPrefs as jest.Mock).mockReturnValue({
    prefs: undefined,
    isLoading: false,
    isError: false,
    shouldExposeNotifications: false,
  });
  (useLightwellRepoNotifications as jest.Mock).mockReturnValue({
    isRepoSubscribed: jest.fn().mockReturnValue(false),
    setRepoSubscribed: jest.fn(),
    isLoading: false,
    isError: false,
    pendingEventType: undefined,
  });
  (useRepositoryInsightsDeck as jest.Mock).mockReturnValue({
    recentActivitySummary: emptyRecentActivitySummary,
    topRecentPackagesBySecurityLevel: emptyTopRecentPackagesBySecurityLevel,
    cveFixesBySeverity: { critical: 0, important: 0, moderate: 0 },
    isLoading: false,
    isError: false,
  });
});

it('renders repository insights deck with recent activity summary panel', async () => {
  (useRepositoryInsightsDeck as jest.Mock).mockReturnValue({
    recentActivitySummary: {
      repositories: 3,
      packages: 12,
      releases: 18,
    },
    topRecentPackagesBySecurityLevel: emptyTopRecentPackagesBySecurityLevel,
    cveFixesBySeverity: { critical: 0, important: 0, moderate: 0 },
    isLoading: false,
    isError: false,
  });
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultLightwellContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  const deck = await screen.findByRole('region', { name: 'Repository insights statistics' });

  expect(await screen.findByText('Repository insights')).toBeInTheDocument();
  expect(within(deck).getByText('Release activity in the past 7 days')).toBeInTheDocument();
  expect(within(deck).getByText('Repositories')).toBeInTheDocument();
  expect(within(deck).getByText('Packages')).toBeInTheDocument();
  expect(within(deck).getByText('Releases')).toBeInTheDocument();
  expect(within(deck).getByText('3')).toBeInTheDocument();
  expect(within(deck).getByText('12')).toBeInTheDocument();
  expect(within(deck).getByText('18')).toBeInTheDocument();
});

it('renders repository insights deck with security-level panel', async () => {
  const user = userEvent.setup();
  (useRepositoryInsightsDeck as jest.Mock).mockReturnValue({
    recentActivitySummary: emptyRecentActivitySummary,
    topRecentPackagesBySecurityLevel: {
      validated: [
        {
          packageKey: 'validated-pkg',
          packageName: 'org.json:json',
          repositoryUuid: defaultLightwellContentItem.uuid,
          repositoryName: defaultLightwellContentItem.name,
          releaseCount: 2,
          securityLevel: 'validated',
        },
      ],
      remediated: [],
      predisclosure: [],
    },
    cveFixesBySeverity: { critical: 0, important: 0, moderate: 0 },
    isLoading: false,
    isError: false,
  });
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultLightwellContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  await user.click(await screen.findByRole('button', { name: 'Next' }));

  expect(
    await screen.findByText('Top packages released in the past 7 days by repository type'),
  ).toBeInTheDocument();
  expect(screen.getByText('org.json:json')).toBeInTheDocument();
  expect(screen.getAllByRole('columnheader', { name: 'Releases' }).length).toBeGreaterThan(0);
});

it('renders security-level split panel in insights deck', async () => {
  const user = userEvent.setup();
  (useRepositoryInsightsDeck as jest.Mock).mockReturnValue({
    recentActivitySummary: emptyRecentActivitySummary,
    topRecentPackagesBySecurityLevel: {
      validated: [
        {
          packageKey: 'validated-pkg',
          packageName: 'org.json:json',
          repositoryUuid: defaultLightwellContentItem.uuid,
          repositoryName: defaultLightwellContentItem.name,
          releaseCount: 2,
          securityLevel: 'validated',
        },
      ],
      remediated: [
        {
          packageKey: 'remediated-pkg',
          packageName: 'org.apache.logging.log4j:log4j-core',
          repositoryUuid: javaRemediatedContentItem.uuid,
          repositoryName: javaRemediatedContentItem.name,
          releaseCount: 1,
          securityLevel: 'remediated',
        },
      ],
      predisclosure: [
        {
          packageKey: 'predisclosure-pkg',
          packageName: 'com.example:secret-fix',
          repositoryUuid: javaPredisclosureContentItem.uuid,
          repositoryName: javaPredisclosureContentItem.name,
          releaseCount: 1,
          securityLevel: 'predisclosure',
        },
      ],
    },
    cveFixesBySeverity: { critical: 0, important: 0, moderate: 0 },
    isLoading: false,
    isError: false,
  });
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultLightwellContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  await user.click(await screen.findByRole('button', { name: 'Next' }));

  expect(
    await screen.findByText('Top packages released in the past 7 days by repository type'),
  ).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Validated' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Remediated' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Predisclosure' })).toBeInTheDocument();
  expect(screen.getByText('org.json:json')).toBeInTheDocument();
  expect(screen.getByText('org.apache.logging.log4j:log4j-core')).toBeInTheDocument();
  expect(screen.getByText('com.example:secret-fix')).toBeInTheDocument();
});

it('advances insights deck to the CVE fixes panel', async () => {
  const user = userEvent.setup();
  (useRepositoryInsightsDeck as jest.Mock).mockReturnValue({
    recentActivitySummary: emptyRecentActivitySummary,
    topRecentPackagesBySecurityLevel: emptyTopRecentPackagesBySecurityLevel,
    cveFixesBySeverity: { critical: 2, important: 5, moderate: 3 },
    isLoading: false,
    isError: false,
  });
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultLightwellContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  await user.click(await screen.findByRole('button', { name: 'Next' }));
  await user.click(await screen.findByRole('button', { name: 'Next' }));

  expect(await screen.findByText('CVEs fixed in the past 7 days')).toBeInTheDocument();
  expect(screen.getByText('Critical')).toBeInTheDocument();
});

it('shows empty state when there are no repositories', async () => {
  (useContentListQuery as jest.Mock).mockImplementation(() => ({ isLoading: false }));

  renderRepositoriesTable();

  expect(await screen.findByText('Lightwell members only')).toBeInTheDocument();
});

it('renders with a single repository', async () => {
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [
        {
          ...defaultLightwellContentItem,
          last_introspection_time: '2026-07-01T00:00:00Z',
        },
      ],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  expect(await screen.findByText('Java Validated')).toBeInTheDocument();
  expect(await screen.findByText('Last activity')).toBeInTheDocument();
  expect(
    await screen.findByText(
      'Maven artifacts rebuilt from source by Red Hat. Verified end-to-end with no modifications.',
    ),
  ).toBeInTheDocument();
  expect(await screen.findByText('Java')).toBeInTheDocument();
  expect(await screen.findByText('1')).toBeInTheDocument();
  expect(await screen.findByText('3')).toBeInTheDocument();
});

it('passes last activity sort to the repositories query', async () => {
  const user = userEvent.setup();
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [
        {
          ...defaultLightwellContentItem,
          last_introspection_time: '2026-07-01T00:00:00Z',
        },
      ],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  await user.click(await screen.findByRole('button', { name: 'Last activity' }));

  expect(useContentListQuery).toHaveBeenLastCalledWith(
    1,
    20,
    expect.objectContaining({ feature_name: expect.any(String) }),
    'last_introspection_time:desc',
    [],
    true,
  );
});

it('shows a loading skeleton while repositories are loading', () => {
  (useContentListQuery as jest.Mock).mockImplementation(() => ({ isLoading: true }));

  renderRepositoriesTable();

  expect(
    screen.getByText('Browse Lightwell repositories by ecosystem and security level.'),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('table', { name: 'Lightwell repositories table' }),
  ).not.toBeInTheDocument();
});

it('navigates to repository packages when a repository name is clicked', async () => {
  const user = userEvent.setup();
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultLightwellContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  await user.click(await screen.findByRole('button', { name: 'Java Validated' }));

  expect(mockNavigateTo).toHaveBeenCalledWith('repositoryPackages', {
    repoSlug: getSlugFromRepositoryName(defaultLightwellContentItem.name),
  });
});

it('renders java remediated repository with remediated description', async () => {
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [javaRemediatedContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  expect(await screen.findByText('Java Remediated')).toBeInTheDocument();
  expect(
    screen.getByText(
      'Maven artifacts with Red Hat backported fixes for known vulnerabilities in pinned versions.',
    ),
  ).toBeInTheDocument();
  expect(screen.getByText('11')).toBeInTheDocument();
  expect(screen.getByText('28')).toBeInTheDocument();
});

it('renders python validated repository with python ecosystem label', async () => {
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultPythonValidatedContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  expect(await screen.findByText('Python Validated')).toBeInTheDocument();
  expect(
    screen.getByText(
      'Python wheels rebuilt from source by Red Hat. Verified end-to-end with no modifications.',
    ),
  ).toBeInTheDocument();
  expect(screen.getByText('Python')).toBeInTheDocument();
});

it('renders connect action for each repository', async () => {
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultLightwellContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  expect(await screen.findByText('Connect to this repository')).toBeInTheDocument();
});

it('renders validated and remediated security level labels', async () => {
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultLightwellContentItem, defaultPythonRemediatedContentItem],
      meta: { count: 2, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  expect(await screen.findByRole('columnheader', { name: 'Ecosystem' })).toBeInTheDocument();
  const repositoriesTable = screen
    .getAllByRole('grid')
    .find((table) => within(table).queryByRole('columnheader', { name: 'Ecosystem' }))!;

  expect(within(repositoriesTable).getByText('Validated')).toBeInTheDocument();
  expect(within(repositoriesTable).getByText('Remediated')).toBeInTheDocument();
});

it('renders repository table column headers', async () => {
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultLightwellContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  expect(await screen.findByRole('columnheader', { name: 'Ecosystem' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Security level' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Packages' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Versions' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Last activity' })).toBeInTheDocument();
});

it('hides notification features when the feature flag is off', async () => {
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultLightwellContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  expect(await screen.findByText('Java Validated')).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Notification preferences' }),
  ).not.toBeInTheDocument();
});

it('shows notification column and modal when user has stored notification preferences', async () => {
  const user = userEvent.setup();
  (useLightwellNotificationPrefs as jest.Mock).mockReturnValue({
    prefs: { enabled: true, minimumSeverity: 'critical' },
    isLoading: false,
    isError: false,
    shouldExposeNotifications: true,
  });
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultLightwellContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  expect(await screen.findByRole('columnheader', { name: 'Notify' })).toBeInTheDocument();
  expect(screen.getByText('N/A')).toBeInTheDocument();

  const notificationsButton = screen.getByRole('button', { name: 'Notification preferences' });
  expect(notificationsButton).toBeEnabled();

  await user.click(notificationsButton);

  const modal = await screen.findByRole('dialog', { name: 'Notification preferences' });

  await waitFor(() => {
    expect(
      within(modal).getByRole('switch', { name: 'Notify me when fixes are available' }),
    ).toBeChecked();
    expect(within(modal).getByRole('radio', { name: 'Critical' })).toBeChecked();
  });
});

it('disables notification features when preferences fail to load', async () => {
  (useLightwellNotificationPrefs as jest.Mock).mockReturnValue({
    prefs: undefined,
    isLoading: false,
    isError: true,
    shouldExposeNotifications: true,
  });
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultLightwellContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  expect(await screen.findByRole('button', { name: 'Notification preferences' })).toBeDisabled();
  expect(screen.queryByRole('columnheader', { name: 'Notify' })).not.toBeInTheDocument();
});

it('unsubscribes from repository notifications when toggle is turned off', async () => {
  const user = userEvent.setup();
  const mockSetRepoSubscribed = jest.fn();
  (useLightwellNotificationPrefs as jest.Mock).mockReturnValue({
    prefs: { enabled: true, minimumSeverity: 'critical' },
    isLoading: false,
    isError: false,
    shouldExposeNotifications: true,
  });
  (useLightwellRepoNotifications as jest.Mock).mockReturnValue({
    isRepoSubscribed: jest.fn().mockReturnValue(true),
    setRepoSubscribed: mockSetRepoSubscribed,
    isLoading: false,
    isError: false,
    pendingEventType: undefined,
  });
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultPythonRemediatedContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  const toggle = await screen.findByRole('switch', {
    name: `Toggle notifications for ${defaultPythonRemediatedContentItem.name}`,
  });
  expect(toggle).toBeChecked();

  await user.click(toggle);
  expect(mockSetRepoSubscribed).toHaveBeenCalledWith('python-remediated', []);
});

it('renders java predisclosure repository', async () => {
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [javaPredisclosureContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  expect(await screen.findByRole('columnheader', { name: 'Ecosystem' })).toBeInTheDocument();
  const repositoriesTable = screen
    .getAllByRole('grid')
    .find((table) => within(table).queryByRole('columnheader', { name: 'Ecosystem' }))!;

  expect(await screen.findByText('Java Predisclosure')).toBeInTheDocument();
  expect(within(repositoriesTable).getByText('Predisclosure')).toBeInTheDocument();
});

it('does not show notification toggle for predisclosure repositories', async () => {
  (useLightwellNotificationPrefs as jest.Mock).mockReturnValue({
    prefs: { enabled: true, minimumSeverity: 'critical' },
    isLoading: false,
    isError: false,
    shouldExposeNotifications: true,
  });
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [javaPredisclosureContentItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  renderRepositoriesTable();

  await screen.findByText('Java Predisclosure');

  expect(
    screen.queryByRole('switch', {
      name: `Toggle notifications for ${javaPredisclosureContentItem.name}`,
    }),
  ).not.toBeInTheDocument();
});
