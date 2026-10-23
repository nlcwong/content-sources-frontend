import RhUiPauseCircleIcon from '@patternfly/react-icons/dist/esm/icons/rh-ui-pause-circle-icon';

import { STATUSES, STATUS_DESCRIPTIONS } from './constants';
import {
  buildPipelineMetricSteps,
  getPipelineStepPresentation,
  PIPELINE_STEP_PRESENTATION,
} from './pipeline';

describe('Beacon pipeline steps', () => {
  it('places On Hold between Submitted and Classified', () => {
    expect(STATUSES).toEqual([
      'Submitted',
      'On Hold',
      'Classified',
      'Fix in Progress',
      'Validation',
      'Lightwell Network',
    ]);
  });

  it('uses the pause-circle icon and partial (pastel yellow) color for On Hold', () => {
    const presentation = PIPELINE_STEP_PRESENTATION['On Hold'];

    expect(presentation.color).toBe('partial');
    expect(presentation.icon).toEqual(<RhUiPauseCircleIcon />);
    expect(getPipelineStepPresentation('On Hold')).toEqual(presentation);
  });

  it('builds metric steps in STATUSES order with On Hold tooling', () => {
    const steps = buildPipelineMetricSteps(
      {
        Submitted: 2,
        'On Hold': 1,
        Classified: 3,
      },
      true,
    );

    expect(steps.map((step) => step.id)).toEqual(STATUSES);
    expect(steps[1]).toMatchObject({
      id: 'On Hold',
      label: 'On Hold',
      tooltip: STATUS_DESCRIPTIONS['On Hold'],
      value: 1,
      color: 'partial',
    });
    expect(steps[1].icon).toEqual(<RhUiPauseCircleIcon />);
  });
});
