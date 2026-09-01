import { Timestamp } from '@patternfly/react-core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

type LastActivityCellProps = {
  timestamp?: string | null;
};

const LastActivityCell = ({ timestamp }: LastActivityCellProps) => {
  if (!timestamp) {
    return <>—</>;
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return <>—</>;
  }

  return (
    <Timestamp
      date={date}
      dateFormat='medium'
      timeFormat='short'
      tooltip={{ variant: 'default' }}
      style={{ fontSize: 'inherit', textDecoration: 'none' }}
    >
      {dayjs(timestamp).fromNow()}
    </Timestamp>
  );
};

export default LastActivityCell;
