import type { LwMetricsDonutDatum, LwMetricsDonutLegendDatum } from 'kit/components/assemblies';
import { lightwellConfig } from 'kit/lightwell.config';

import {
  NO_REMEDIATION_LABEL,
  PIPELINE_STEPPER_STATUSES,
  UNREMEDIATED_STATUS,
} from './constants';

export const ON_HOLD_LABEL = 'On Hold';
export const IN_PIPELINE_LABEL = 'In Pipeline';

export type BeaconSummaryDonutModel = {
  data: LwMetricsDonutDatum[];
  colorScale: string[];
  legendData: LwMetricsDonutLegendDatum[];
  getLabel: (args: { datum: LwMetricsDonutDatum }) => string;
};

const countFor = (statusCounts: Record<string, number> | undefined, key: string): number =>
  statusCounts?.[key] ?? 0;

export const getInPipelineCount = (statusCounts: Record<string, number> | undefined): number =>
  PIPELINE_STEPPER_STATUSES.reduce((sum, status) => sum + countFor(statusCounts, status), 0);

export const getBeaconSummaryDonutModel = (
  statusCounts: Record<string, number> | undefined,
): BeaconSummaryDonutModel => {
  const onHold = countFor(statusCounts, ON_HOLD_LABEL);
  const noRemediation = countFor(statusCounts, UNREMEDIATED_STATUS);
  const inPipeline = getInPipelineCount(statusCounts);

  const data: LwMetricsDonutDatum[] = [
    { x: ON_HOLD_LABEL, y: onHold },
    { x: NO_REMEDIATION_LABEL, y: noRemediation },
    { x: IN_PIPELINE_LABEL, y: inPipeline },
  ];

  const colorScale = [
    lightwellConfig.colors.matchStatus.partial,
    lightwellConfig.colors.matchStatus.none,
    lightwellConfig.colors.matchStatus.exact,
  ];

  return {
    data,
    colorScale,
    legendData: data.map(({ x, y }) => ({ name: `${x} ${y}` })),
    getLabel: ({ datum }) => `${datum.x}: ${datum.y}`,
  };
};
