import { render, screen } from '@testing-library/react';

import { LwMetricsDonutChart } from './metrics-donut-chart';

const sampleData = [
  { x: 'Exact match', y: 60 },
  { x: 'Partial match', y: 15 },
  { x: 'No match', y: 25 },
];

it('renders the donut host with title and kit class', () => {
  const { container } = render(
    <LwMetricsDonutChart
      data={sampleData}
      width={320}
      height={280}
      title='75%'
      subTitle='packages matched'
      ariaDesc='Match summary donut chart'
    />,
  );

  expect(container.querySelector('.lw-c-metrics-donut-chart')).toBeTruthy();
  expect(screen.getByText('75%')).toBeInTheDocument();
});

it('renders a bottom legend when legendData is provided', () => {
  render(
    <LwMetricsDonutChart
      data={sampleData}
      width={320}
      height={320}
      title='100'
      subTitle='Total'
      legendData={[{ name: 'Exact match' }, { name: 'Partial match' }, { name: 'No match' }]}
      ariaDesc='Summary donut with legend'
    />,
  );

  expect(screen.getByText('Exact match')).toBeInTheDocument();
  expect(screen.getByText('Partial match')).toBeInTheDocument();
  expect(screen.getByText('No match')).toBeInTheDocument();
  expect(screen.getByText('100')).toBeInTheDocument();
});
