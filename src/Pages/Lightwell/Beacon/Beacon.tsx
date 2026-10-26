import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRemoteHook } from '@scalprum/react-core';
import { useFlag } from '@unleash/proxy-client-react';
import {
  Content,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  Flex,
  FlexItem,
  PageSection,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import {
  FilterSidePanel,
  FilterSidePanelCategory,
  FilterSidePanelCategoryItem,
} from '@patternfly/react-catalog-view-extension';
import UserIcon from '@patternfly/react-icons/dist/esm/icons/user-icon';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';

import useDebounce from 'Hooks/useDebounce';
import { useLightwellRootPath } from '../../../Hooks/Lightwell/navigation/useLightwellRootPath';
import {
  LwButtonGroup,
  LwLoaded,
  LwMetricsDonutChart,
  LwMetricsStepper,
  LwPageHeader,
  PageChromeSlot,
  PageChromeSlotFooter,
  PageChromeSlots,
  PageTitleStack,
} from 'kit/components/assemblies';
import {
  LwButton,
  LwEmptyState,
  LwMenu,
  LwPopover,
  LwSkeleton,
  LwTitle,
} from 'kit/components/primitives';

import { FILTER_STATUSES, SEVERITIES, statusLabel } from './constants';
import { buildPipelineMetricSteps } from './pipeline';
import { getBeaconSummaryDonutModel } from './summaryDonutModel';
import type { Severity, Status } from './types';
import { ExportMenu } from './components/ExportMenu';
import { VulnerabilityTable } from './components/VulnerabilityTable';
import { useBeaconData } from './hooks/useBeaconData';
import { getMatchDonutChartHeight } from '../Lens/charts/matchDonutModel';
import { useContainerWidth } from '../hooks/useContainerWidth';
import {
  type BeaconVulnerabilityFilters,
  type BeaconVulnerabilityFlag,
} from 'services/Lightwell/BeaconApi';
import { useBeaconStatusQuery, useLtwlsuptTicketIdsQuery } from 'services/Lightwell/BeaconQueries';
import { useCustomerIdsQuery } from 'services/Lightwell/CustomerQueries';
import {
  createDefaultVulnerabilityColumns,
  getVisibleVulnerabilityColumns,
} from './utils/vulnerabilityTableColumns';

import '../../../../styles/lightwell-beacon.scss';

const DEFAULT_PER_PAGE = 20;
const SUMMARY_DONUT_DEFAULT_WIDTH = 220;

const slaHelpPopover = (
  <LwPopover
    hasHeader='SLA Policy'
    hasBody={
      <Content>
        <p>
          <strong>Submit</strong> vulnerabilities to the clearinghouse at any time.
        </p>
        <p>
          <strong>Triage within 48 hours.</strong>
        </p>
        <p>
          <strong>Priority is yours.</strong> Your severity sets the default order. Adjust at any
          time.
        </p>
        <p>
          A fix is complete when a patched artifact is published in the repository (or when it gets
          to the Lightwell Network).
        </p>
        <br />
        <p>
          SLA applies to up to 25 findings per member per week. All other findings are worked
          continuously on a best-effort basis.
        </p>
      </Content>
    }
    hasTrigger={
      <LwButton isCircle variant='plain' aria-label='SLA help'>
        <HelpIcon />
      </LwButton>
    }
  />
);

const DROP_LAST_CHROME_SEGMENT_OPTIONS = { dropLastChromeSegment: true };

function buildBeaconFilters(
  selectedSeverities: Set<Severity>,
  selectedStatuses: Set<Status>,
  selectedLtwlsuptTickets: Set<string>,
  showDuplicates: boolean,
): BeaconVulnerabilityFilters | undefined {
  const flags: BeaconVulnerabilityFlag[] = [];
  if (showDuplicates) flags.push('duplicate');

  const filters: BeaconVulnerabilityFilters = {
    severities: selectedSeverities.size ? [...selectedSeverities] : undefined,
    statuses: selectedStatuses.size ? [...selectedStatuses] : undefined,
    ltwlsuptTicketIds: selectedLtwlsuptTickets.size ? [...selectedLtwlsuptTickets] : undefined,
    flags: flags.length ? flags : undefined,
  };

  const hasFilters =
    (filters.severities?.length ?? 0) > 0 ||
    (filters.statuses?.length ?? 0) > 0 ||
    (filters.ltwlsuptTicketIds?.length ?? 0) > 0 ||
    (filters.flags?.length ?? 0) > 0;

  return hasFilters ? filters : undefined;
}

const Beacon = () => {
  const rootPath = useLightwellRootPath();
  const appBreadcrumbsEnabled = useFlag('platform.chrome.app-breadcrumbs');
  const breadcrumbs = useMemo(
    () => [{ pathname: `${rootPath}/beacon`, title: 'Lightwell Beacon' }],
    [rootPath],
  );

  useRemoteHook({
    scope: 'chrome',
    module: './breadcrumbs/useReplaceBreadcrumbs',
    args: appBreadcrumbsEnabled ? [breadcrumbs, DROP_LAST_CHROME_SEGMENT_OPTIONS] : [[]],
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>();
  const [selectedSeverities, setSelectedSeverities] = useState<Set<Severity>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<Status>>(new Set());
  const [selectedLtwlsuptTickets, setSelectedLtwlsuptTickets] = useState<Set<string>>(new Set());
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [searchQuery, setSearchQuery] = useState('');
  const [columns, setColumns] = useState(createDefaultVulnerabilityColumns);
  const debouncedSearch = useDebounce(searchQuery, searchQuery === '' ? 0 : 500);

  const apiFilters = useMemo(
    () =>
      buildBeaconFilters(
        selectedSeverities,
        selectedStatuses,
        selectedLtwlsuptTickets,
        showDuplicates,
      ),
    [selectedSeverities, selectedStatuses, selectedLtwlsuptTickets, showDuplicates],
  );

  const queryFilters = useMemo((): BeaconVulnerabilityFilters | undefined => {
    const search = debouncedSearch.trim();
    const hasSearch = search.length >= 2;

    if (!apiFilters && !hasSearch) {
      return undefined;
    }

    return {
      ...apiFilters,
      search: hasSearch ? search : undefined,
    };
  }, [apiFilters, debouncedSearch]);

  const pagination = useMemo(
    () => ({
      limit: perPage,
      offset: (page - 1) * perPage,
    }),
    [page, perPage],
  );

  useEffect(() => {
    setPage(1);
  }, [selectedCustomerId, queryFilters]);

  const handleCustomerIdChange = useCallback(
    (customerId: string) => {
      if (customerId === selectedCustomerId) {
        return;
      }

      setSelectedLtwlsuptTickets(new Set());
      setSearchQuery('');
      setSelectedCustomerId(customerId);
    },
    [selectedCustomerId],
  );

  const { data: customerIds, isLoading: isLoadingCustomers } = useCustomerIdsQuery();

  useEffect(() => {
    if (!selectedCustomerId && customerIds?.length === 1) {
      handleCustomerIdChange(customerIds[0]);
    }
  }, [selectedCustomerId, customerIds, handleCustomerIdChange]);

  const customerIdMenuItems = (customerIds ?? []).map((customerId) => ({
    id: customerId,
    children: customerId,
    onSelect: () => handleCustomerIdChange(customerId),
  }));

  const resetFilters = useCallback(() => {
    setSelectedSeverities(new Set());
    setSelectedStatuses(new Set());
    setSelectedLtwlsuptTickets(new Set());
    setShowDuplicates(false);
    setSearchQuery('');
    setPage(1);
  }, []);

  const {
    data: displayData,
    isLoading: isLoadingDisplay,
    isError,
    error,
  } = useBeaconData(selectedCustomerId, queryFilters, pagination);
  const { data: ltwlsuptTicketIds = [] } = useLtwlsuptTicketIdsQuery(selectedCustomerId);
  const { data: lastUpdated } = useBeaconStatusQuery();

  const isLoading = !displayData && isLoadingDisplay;
  const { containerRef: summaryDonutContainerRef, width: summaryDonutWidth } =
    useContainerWidth(SUMMARY_DONUT_DEFAULT_WIDTH);

  if (isError) throw error;

  const filteredVulns = displayData?.vulnerabilities ?? [];
  const displayMeta = displayData?.meta;
  const summaryTotal = displayMeta?.count ?? filteredVulns.length;
  const summaryDonut = getBeaconSummaryDonutModel(displayMeta?.statusCounts);
  const summaryDonutHeight = getMatchDonutChartHeight(summaryDonutWidth);

  const toggleShowAllCategory = (key: string) => {
    setShowAllCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSeverity = (sev: Severity) => {
    setSelectedSeverities((prev) => {
      const next = new Set(prev);
      if (next.has(sev)) next.delete(sev);
      else next.add(sev);
      return next;
    });
  };

  const toggleStatus = (status: Status) => {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const toggleLtwlsuptTicket = (ticketId: string) => {
    setSelectedLtwlsuptTickets((prev) => {
      const next = new Set(prev);
      if (next.has(ticketId)) next.delete(ticketId);
      else next.add(ticketId);
      return next;
    });
  };

  const activeFilterCount =
    selectedSeverities.size +
    selectedStatuses.size +
    selectedLtwlsuptTickets.size +
    (showDuplicates ? 1 : 0);

  const onSetPage = (_event: unknown, newPage: number) => setPage(newPage);
  const onPerPageSelect = (_event: unknown, newPerPage: number, newPage: number) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const isPipelineHydrated = Boolean(selectedCustomerId && !isLoading);
  const pipelineMetricSteps = buildPipelineMetricSteps(
    displayMeta?.statusCounts,
    isPipelineHydrated,
  );

  const showCustomerEmpty = !selectedCustomerId && !isLoadingCustomers;

  return (
    <>
      <LwPageHeader hero bodyWidth='100%' bodyMaxWidth='100%'>
        <PageChromeSlots>
          <PageChromeSlot>
            <PageTitleStack
              title={
                <div className='lw-c-page-title-stack__title'>
                  <LwTitle headingLevel='h1' ouiaId='lightwell-beacon-header'>
                    Beacon
                  </LwTitle>
                  {slaHelpPopover}
                </div>
              }
              description={
                <>
                  Understand the status of your Lightwell submissions
                  {lastUpdated ? (
                    <>
                      <br />
                      Last updated: {lastUpdated}
                    </>
                  ) : null}
                </>
              }
            />
            <PageChromeSlotFooter>
              <LwMetricsStepper
                isHorizontal
                aria-label='Submission pipeline metrics'
                isHydrated={isPipelineHydrated}
                steps={pipelineMetricSteps}
              />
            </PageChromeSlotFooter>
          </PageChromeSlot>
          {showCustomerEmpty ? (
            <PageChromeSlot>
              <LwEmptyState
                headingLevel='h2'
                icon={UserIcon}
                titleText='Select customer'
                variant={EmptyStateVariant.sm}
              >
                <EmptyStateFooter>
                  <EmptyStateActions>
                    <LwMenu
                      label={selectedCustomerId ?? 'Select customer ID'}
                      toggleProps={{
                        ouiaId: 'customer-id-select-toggle',
                        size: 'lg',
                        variant: 'primary',
                      }}
                      isDisabled={customerIdMenuItems.length === 0}
                      items={customerIdMenuItems}
                    />
                  </EmptyStateActions>
                </EmptyStateFooter>
                <EmptyStateBody>
                  Select a customer ID first to view the status of their Lightwell submissions.
                </EmptyStateBody>
              </LwEmptyState>
            </PageChromeSlot>
          ) : selectedCustomerId ? (
            <PageChromeSlot>
              <div className='lightwell-beacon-summary'>
                <LwLoaded
                  isLoaded={!isLoading}
                  fallback={
                    <LwSkeleton
                      height={`${summaryDonutHeight}px`}
                      width='100%'
                      screenreaderText='Loading status summary'
                    />
                  }
                >
                  <LwMetricsDonutChart
                    data={summaryDonut.data}
                    colorScale={summaryDonut.colorScale}
                    getLabel={summaryDonut.getLabel}
                    width={summaryDonutWidth}
                    height={summaryDonutHeight}
                    title={String(summaryTotal)}
                    subTitle='Total'
                    ariaDesc='Vulnerability summary donut chart'
                    containerRef={summaryDonutContainerRef}
                  />
                  <ul className='lightwell-beacon-summary-legend' aria-label='Vulnerability status summary'>
                    {summaryDonut.data.map((slice, index) => (
                      <li key={slice.x} className='lightwell-beacon-summary-legend__item'>
                        <span
                          className='lightwell-beacon-summary-legend__swatch'
                          style={{ background: summaryDonut.colorScale[index] }}
                          aria-hidden
                        />
                        <span className='lightwell-beacon-summary-legend__label'>
                          {slice.x}: {slice.y}
                        </span>
                      </li>
                    ))}
                  </ul>
                </LwLoaded>
              </div>
            </PageChromeSlot>
          ) : null}
        </PageChromeSlots>
      </LwPageHeader>
      <PageSection hasBodyWrapper={false} data-ouia-component-id='lightwell-beacon-page'>
        <Stack hasGutter className='lightwell-beacon-content'>
          {!showCustomerEmpty ? (
            <StackItem>
              <LwButtonGroup>
                {isLoadingCustomers ? (
                  <div className='lw-c-menu lw-c-menu-group' role='group' aria-label='Customer ID'>
                    <span className='lw-c-menu-group__label'>Customer ID</span>
                    <LwSkeleton height='36px' />
                  </div>
                ) : (
                  <LwMenu
                    fieldLabel='Customer ID'
                    label={selectedCustomerId ?? 'Select customer ID'}
                    toggleProps={{ ouiaId: 'customer-id-select-toggle' }}
                    isDisabled={customerIdMenuItems.length === 0}
                    items={customerIdMenuItems}
                  />
                )}
                <ExportMenu
                  customerId={selectedCustomerId}
                  filters={queryFilters}
                  visibleColumns={getVisibleVulnerabilityColumns(columns)}
                  itemCount={displayMeta?.count ?? 0}
                  lastUpdated={lastUpdated ?? undefined}
                />
              </LwButtonGroup>
            </StackItem>
          ) : null}
          <StackItem>
            <Flex
              gap={{ default: 'gapMd' }}
              alignItems={{ default: 'alignItemsFlexStart' }}
              className='lightwell-beacon-layout'
            >
              <FlexItem className='lightwell-filter-panel'>
                <span className='lightwell-filter-panel-header'>
                  <Title headingLevel='h4' size='md'>
                    Filters
                  </Title>
                  {activeFilterCount > 0 && (
                    <Content component='small' className='lightwell-filter-count'>
                      {activeFilterCount} active
                    </Content>
                  )}
                </span>
                <FilterSidePanel id='beacon-filter-panel'>
                  <FilterSidePanelCategory
                    title='Severity'
                    showAll={!!showAllCategories.severity}
                    onShowAllToggle={() => toggleShowAllCategory('severity')}
                  >
                    {SEVERITIES.map((sev) => (
                      <FilterSidePanelCategoryItem
                        key={sev}
                        checked={selectedSeverities.has(sev)}
                        onClick={() => toggleSeverity(sev)}
                      >
                        {sev}
                      </FilterSidePanelCategoryItem>
                    ))}
                  </FilterSidePanelCategory>

                  <FilterSidePanelCategory
                    title='Status'
                    showAll={!!showAllCategories.pipeline}
                    onShowAllToggle={() => toggleShowAllCategory('pipeline')}
                  >
                    {FILTER_STATUSES.map((status) => (
                      <FilterSidePanelCategoryItem
                        key={status}
                        checked={selectedStatuses.has(status)}
                        onClick={() => toggleStatus(status)}
                      >
                        {statusLabel(status)}
                      </FilterSidePanelCategoryItem>
                    ))}
                  </FilterSidePanelCategory>

                  {ltwlsuptTicketIds.length > 0 && (
                    <FilterSidePanelCategory
                      title='LTWLSUPT_TICKET'
                      showAll={!!showAllCategories.ltwlsuptTicket}
                      onShowAllToggle={() => toggleShowAllCategory('ltwlsuptTicket')}
                    >
                      {ltwlsuptTicketIds.map((ticketId) => (
                        <FilterSidePanelCategoryItem
                          key={ticketId}
                          checked={selectedLtwlsuptTickets.has(ticketId)}
                          onClick={() => toggleLtwlsuptTicket(ticketId)}
                        >
                          {ticketId}
                        </FilterSidePanelCategoryItem>
                      ))}
                    </FilterSidePanelCategory>
                  )}

                  <FilterSidePanelCategory title='Flags'>
                    <FilterSidePanelCategoryItem
                      checked={showDuplicates}
                      onClick={() => setShowDuplicates(!showDuplicates)}
                    >
                      Duplicates
                    </FilterSidePanelCategoryItem>
                  </FilterSidePanelCategory>
                </FilterSidePanel>
              </FlexItem>
              <FlexItem flex={{ default: 'flex_1' }} className='lightwell-beacon-table-area'>
                {selectedCustomerId && !isLoading ? (
                  <VulnerabilityTable
                    vulnerabilities={filteredVulns}
                    itemCount={displayMeta?.count ?? 0}
                    page={page}
                    perPage={perPage}
                    onSetPage={onSetPage}
                    onPerPageSelect={onPerPageSelect}
                    searchValue={searchQuery}
                    onSearchChange={setSearchQuery}
                    onSearchClear={() => setSearchQuery('')}
                    onResetFilters={resetFilters}
                    columns={columns}
                    onColumnsChange={setColumns}
                  />
                ) : selectedCustomerId ? (
                  <LwSkeleton height='400px' />
                ) : null}
              </FlexItem>
            </Flex>
          </StackItem>
        </Stack>
      </PageSection>
    </>
  );
};

export default Beacon;
