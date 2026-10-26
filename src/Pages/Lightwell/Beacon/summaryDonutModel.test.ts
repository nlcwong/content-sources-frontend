import { NO_REMEDIATION_LABEL, UNREMEDIATED_STATUS } from './constants';
import {
  getBeaconSummaryDonutModel,
  getInPipelineCount,
  IN_PIPELINE_LABEL,
  ON_HOLD_LABEL,
} from './summaryDonutModel';

describe('Beacon summary donut model', () => {
  const statusCounts = {
    Submitted: 2,
    'On Hold': 3,
    Classified: 1,
    'Fix in Progress': 4,
    Validation: 1,
    'Lightwell Network': 5,
    [UNREMEDIATED_STATUS]: 7,
  };

  it('sums In Pipeline from stepper statuses excluding On Hold', () => {
    expect(getInPipelineCount(statusCounts)).toBe(2 + 1 + 4 + 1 + 5);
  });

  it('builds slices as On Hold, No remediation, In Pipeline', () => {
    const model = getBeaconSummaryDonutModel(statusCounts);

    expect(model.data).toEqual([
      { x: ON_HOLD_LABEL, y: 3 },
      { x: NO_REMEDIATION_LABEL, y: 7 },
      { x: IN_PIPELINE_LABEL, y: 13 },
    ]);
    expect(model.legendData.map((item) => item.name)).toEqual([
      `${ON_HOLD_LABEL}: 3`,
      `${NO_REMEDIATION_LABEL}: 7`,
      `${IN_PIPELINE_LABEL}: 13`,
    ]);
  });

  it('uses the No remediation label for the unremediated slice', () => {
    const model = getBeaconSummaryDonutModel({ [UNREMEDIATED_STATUS]: 2 });

    expect(model.data.find((slice) => slice.x === NO_REMEDIATION_LABEL)?.y).toBe(2);
    expect(model.getLabel({ datum: { x: NO_REMEDIATION_LABEL, y: 2 } })).toBe(
      `${NO_REMEDIATION_LABEL}: 2`,
    );
  });

  it('defaults missing counts to zero', () => {
    const model = getBeaconSummaryDonutModel(undefined);

    expect(model.data.every((slice) => slice.y === 0)).toBe(true);
    expect(model.legendData.map((item) => item.name)).toEqual([
      `${ON_HOLD_LABEL}: 0`,
      `${NO_REMEDIATION_LABEL}: 0`,
      `${IN_PIPELINE_LABEL}: 0`,
    ]);
    expect(getInPipelineCount(undefined)).toBe(0);
  });
});
