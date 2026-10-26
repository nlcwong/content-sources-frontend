import RhUiPauseCircleIcon from '@patternfly/react-icons/dist/esm/icons/rh-ui-pause-circle-icon';

import { PIPELINE_STEPPER_STATUSES, STATUSES, STATUS_DESCRIPTIONS } from './constants';
import {
  buildPipelineMetricSteps,
  getPipelineStepPresentation,
  PIPELINE_STEP_PRESENTATION,
} from './pipeline';

describe('Beacon pipeline steps', () => {
  it('keeps On Hold in STATUSES but omits it from the stepper list', () => {
    expect(STATUSES).toContain('On Hold');
    expect(PIPELINE_STEPPER_STATUSES).toEqual([
      'Submitted',
      'Classified',
      'Fix in Progress',
      'Validation',
      'Lightwell Network',
    ]);
    expect(PIPELINE_STEPPER_STATUSES).not.toContain('On Hold');
  });

  it('keeps On Hold presentation for non-stepper callers', () => {
    const presentation = PIPELINE_STEP_PRESENTATION['On Hold'];

    expect(presentation.color).toBe('partial');
    expect(presentation.icon).toEqual(<RhUiPauseCircleIcon />);
    expect(getPipelineStepPresentation('On Hold')).toEqual(presentation);
  });

  it('builds metric steps without On Hold', () => {
    const steps = buildPipelineMetricSteps(
      {
        Submitted: 2,
        'On Hold': 1,
        Classified: 3,
      },
      true,
    );

    expect(steps.map((step) => step.id)).toEqual(PIPELINE_STEPPER_STATUSES);
    expect(steps.find((step) => step.id === 'On Hold')).toBeUndefined();
    expect(steps[0]).toMatchObject({
      id: 'Submitted',
      label: 'Submitted',
      tooltip: STATUS_DESCRIPTIONS.Submitted,
      value: 2,
    });
    expect(steps[1]).toMatchObject({
      id: 'Classified',
      label: 'Classified',
      value: 3,
    });
  });
});
