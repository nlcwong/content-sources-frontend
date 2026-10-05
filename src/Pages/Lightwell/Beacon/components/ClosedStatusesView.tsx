import { Content, Flex, FlexItem, Tooltip } from '@patternfly/react-core';

import { CLOSED_STATUSES, STATUS_DESCRIPTIONS } from '../constants';

type ClosedStatusesViewProps = {
  statusCounts?: Record<string, number>;
  className?: string;
};

export function ClosedStatusesView({ statusCounts = {}, className }: ClosedStatusesViewProps) {
  const statusStats = CLOSED_STATUSES.map((status) => ({
    status,
    count: statusCounts[status] ?? 0,
  }));

  return (
    <div className={`lightwell-closed-statuses ${className ?? ''}`}>
      <Content component='small' className='lightwell-closed-statuses-label'>
        Closed without remediation
      </Content>
      <Flex
        justifyContent={{ default: 'justifyContentCenter' }}
        gap={{ default: 'gapXl' }}
        alignItems={{ default: 'alignItemsCenter' }}
      >
        {statusStats.map((stat) => (
          <FlexItem key={stat.status} style={{ textAlign: 'center' }}>
            <Tooltip content={STATUS_DESCRIPTIONS[stat.status]}>
              <span style={{ display: 'inline-block' }}>
                <span className='lightwell-stat-number'>{stat.count}</span>
                <Content component='small' style={{ display: 'block' }}>
                  {stat.status}
                </Content>
              </span>
            </Tooltip>
          </FlexItem>
        ))}
      </Flex>
    </div>
  );
}
